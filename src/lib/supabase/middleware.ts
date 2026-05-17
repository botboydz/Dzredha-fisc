import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/auth/callback"];
  const isPublicRoute = publicRoutes.some(
    (route) =>
      request.nextUrl.pathname === route ||
      request.nextUrl.pathname.startsWith(route + "/")
  );

  // Root page "/" is accessible in demo mode without auth
  const isRootPage = request.nextUrl.pathname === "/";

  // API routes should not redirect (they handle auth themselves)
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");

  // Static files and Next.js internals
  const isStaticFile =
    request.nextUrl.pathname.startsWith("/_next/") ||
    request.nextUrl.pathname.startsWith("/favicon") ||
    request.nextUrl.pathname.includes(".");

  // If user is not signed in and the route is protected, redirect to login
  if (
    !user &&
    !isPublicRoute &&
    !isRootPage &&
    !isApiRoute &&
    !isStaticFile
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // If user is signed in and trying to access login/signup, redirect to home
  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // ── Security Headers ──────────────────────────────────────

  // Prevent clickjacking: deny framing entirely
  supabaseResponse.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff');

  // Control referrer information leakage
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Enable XSS filter in browsers (legacy but still useful)
  supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block');

  // Disable unnecessary browser features
  supabaseResponse.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // Content Security Policy — strict but allows Supabase, fonts, and our CDN
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js dev requires unsafe-inline/eval
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://z-cdn.chatglm.cn",
    "connect-src 'self' https://htwxqoklsnyezddgmika.supabase.co https://api.anthropic.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');

  supabaseResponse.headers.set('Content-Security-Policy', csp);

  // Strict Transport Security (1 year, include subdomains)
  // Only set in production to avoid issues with local dev
  if (request.nextUrl.protocol === 'https:') {
    supabaseResponse.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Cross-origin policies
  supabaseResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  supabaseResponse.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  supabaseResponse.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');

  return supabaseResponse;
}
