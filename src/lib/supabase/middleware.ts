import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // ── Security Headers (always applied, even if Supabase is not configured) ──
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Prevent clickjacking
  supabaseResponse.headers.set('X-Frame-Options', 'DENY');
  // Prevent MIME type sniffing
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff');
  // Referrer policy
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // XSS filter
  supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block');
  // Disable unnecessary browser features
  supabaseResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // CSP
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
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

  // HSTS
  if (request.nextUrl.protocol === 'https:') {
    supabaseResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Cross-origin policies
  supabaseResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  supabaseResponse.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  supabaseResponse.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');

  // ── Auth check (only if Supabase env vars are configured) ──
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const supabaseKey = supabaseAnonKey || supabasePublishableKey;

  // If Supabase is not configured, allow all routes (demo mode) with security headers
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  let user = null;
  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          // Re-apply security headers after response recreation
          supabaseResponse.headers.set('X-Frame-Options', 'DENY');
          supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff');
          supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
          supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block');
          supabaseResponse.headers.set('Content-Security-Policy', csp);
          supabaseResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
          supabaseResponse.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
          supabaseResponse.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err) {
    // If Supabase client fails, allow access — client-side handles offline state
    console.error("[Middleware] Supabase auth check failed:", err);
    return supabaseResponse;
  }

  // Define public routes
  const publicRoutes = ["/login", "/signup", "/auth/callback"];
  const isPublicRoute = publicRoutes.some(
    (route) => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route + "/")
  );

  const isRootPage = request.nextUrl.pathname === "/";
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");
  const isStaticFile =
    request.nextUrl.pathname.startsWith("/_next/") ||
    request.nextUrl.pathname.startsWith("/favicon") ||
    request.nextUrl.pathname.includes(".");

  // Dashboard routes are accessible in demo mode (data hook falls back to mock)
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/declarations") ||
    request.nextUrl.pathname.startsWith("/documents") ||
    request.nextUrl.pathname.startsWith("/security") ||
    request.nextUrl.pathname.startsWith("/services") ||
    request.nextUrl.pathname.startsWith("/notifications") ||
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/profile");

  // Only redirect to login for non-dashboard protected routes
  if (!user && !isPublicRoute && !isRootPage && !isApiRoute && !isStaticFile && !isDashboardRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // If user is signed in and trying to access login/signup, redirect to dashboard
  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
