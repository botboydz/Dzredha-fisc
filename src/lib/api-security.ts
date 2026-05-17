/**
 * Shared API security utilities for DZ-Fisc
 */

/**
 * Validates the Origin header against allowed origins to prevent CSRF attacks.
 * Returns true if the origin is valid or absent (same-origin requests often have no Origin).
 */
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin") || "";
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "http://localhost:3000",
  ];
  return !origin || allowedOrigins.includes(origin);
}

/**
 * Sanitizes a request body by whitelisting only allowed fields.
 * Prevents mass assignment vulnerabilities by filtering out sensitive fields
 * like id, created_at, updated_at, company_id.
 */
export function sanitizeBody(
  body: Record<string, unknown>,
  allowedFields: string[]
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) sanitized[key] = body[key];
  }
  return sanitized;
}
