/**
 * DZ-Fisc Rate Limiter
 * In-memory sliding window rate limiter for API routes
 * Prevents brute force, DDoS, and abuse
 */

interface RateLimitEntry {
  timestamps: number[];
  blocked: boolean;
  blockedUntil: number;
}

// Store for rate limit tracking (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Number of minutes to block after exceeding the limit */
  blockDurationMs: number;
}

// Preset configurations for different route types
export const RATE_LIMITS = {
  /** General API: 60 requests per minute */
  api: { maxRequests: 60, windowMs: 60_000, blockDurationMs: 60_000 },
  /** Auth routes: 5 attempts per 15 minutes (prevents brute force) */
  auth: { maxRequests: 5, windowMs: 15 * 60_000, blockDurationMs: 15 * 60_000 },
  /** Write operations: 20 per minute */
  write: { maxRequests: 20, windowMs: 60_000, blockDurationMs: 120_000 },
  /** AI/LLM routes: 10 per minute (expensive operations) */
  ai: { maxRequests: 10, windowMs: 60_000, blockDurationMs: 300_000 },
} as const;

export type RateLimitPreset = keyof typeof RATE_LIMITS;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Check if a request should be rate limited
 * @param key - Unique identifier (usually IP address or user ID)
 * @param config - Rate limit configuration or preset name
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig | RateLimitPreset
): RateLimitResult {
  // Cleanup old entries periodically
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    cleanupOldEntries(now);
    lastCleanup = now;
  }

  const limitConfig: RateLimitConfig =
    typeof config === "string" ? RATE_LIMITS[config] : config;

  let entry = rateLimitStore.get(key);

  // Create new entry if none exists
  if (!entry) {
    entry = { timestamps: [], blocked: false, blockedUntil: 0 };
    rateLimitStore.set(key, entry);
  }

  // Check if currently blocked
  if (entry.blocked && now < entry.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.blockedUntil,
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  // If block period expired, unblock
  if (entry.blocked && now >= entry.blockedUntil) {
    entry.blocked = false;
    entry.blockedUntil = 0;
  }

  // Remove timestamps outside the sliding window
  const windowStart = now - limitConfig.windowMs;
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  // Check if limit exceeded
  if (entry.timestamps.length >= limitConfig.maxRequests) {
    // Block the client
    entry.blocked = true;
    entry.blockedUntil = now + limitConfig.blockDurationMs;

    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.blockedUntil,
      retryAfter: Math.ceil(limitConfig.blockDurationMs / 1000),
    };
  }

  // Add current timestamp
  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: limitConfig.maxRequests - entry.timestamps.length,
    resetAt: now + limitConfig.windowMs,
  };
}

/**
 * Extract client identifier from request
 * Uses X-Forwarded-For header (when behind proxy) or falls back to connection info
 */
export function getClientIdentifier(request: Request): string {
  // Check X-Forwarded-For header (set by Caddy/proxy)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take the first IP in the chain (original client)
    return forwarded.split(",")[0].trim();
  }

  // Check X-Real-IP header
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Fallback: use a hash of the user agent as a rough identifier
  const userAgent = request.headers.get("user-agent") || "unknown";
  return `ua:${userAgent.slice(0, 50)}`;
}

/**
 * Create rate limit headers for the response
 */
export function createRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers();
  headers.set("X-RateLimit-Remaining", result.remaining.toString());
  headers.set("X-RateLimit-Reset", new Date(result.resetAt).toISOString());

  if (!result.allowed && result.retryAfter) {
    headers.set("Retry-After", result.retryAfter.toString());
  }

  return headers;
}

// Cleanup entries older than 30 minutes
function cleanupOldEntries(now: number): void {
  const maxAge = 30 * 60 * 1000;
  for (const [key, entry] of rateLimitStore.entries()) {
    // Remove expired entries
    if (entry.blocked && entry.blockedUntil < now) {
      entry.blocked = false;
      entry.blockedUntil = 0;
    }
    // Remove empty entries
    if (
      entry.timestamps.length === 0 &&
      !entry.blocked &&
      entry.timestamps.every((ts) => now - ts > maxAge)
    ) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Middleware helper: check rate limit and return appropriate response
 */
export function withRateLimit(
  request: Request,
  preset: RateLimitPreset
): { allowed: true; headers: Headers } | { allowed: false; response: Response } {
  const clientId = getClientIdentifier(request);
  const result = checkRateLimit(clientId, preset);
  const headers = createRateLimitHeaders(result);

  if (!result.allowed) {
    return {
      allowed: false,
      response: Response.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: result.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": result.retryAfter?.toString() || "60",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
          },
        }
      ),
    };
  }

  return { allowed: true, headers };
}
