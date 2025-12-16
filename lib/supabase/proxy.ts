import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that don't require authentication (O(1) lookup)
const PUBLIC_ROUTES = new Set([
  "/",
  "/auth/login",
  "/auth/sign-up",
  "/auth/sign-up-success",
  "/auth/forgot-password",
  "/auth/update-password",
  "/auth/confirm",
  "/auth/error",
  "/auth/oauth",
  "/privacy",
  "/terms",
]);

// Check if the path is a public route
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.has(pathname);
}

// Routes that require authentication
function isProtectedRoute(pathname: string): boolean {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/api");
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { pathname } = request.nextUrl;

  // Skip auth check for public routes
  if (isPublicRoute(pathname) && !isProtectedRoute(pathname)) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getUser() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  // Note: getClaims() is deprecated, use getUser() instead
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If accessing a protected route without authentication
  if (!user && isProtectedRoute(pathname)) {
    // For API routes, return 401 Unauthorized
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Unauthorized", statusCode: 401 },
        { status: 401 },
      );
    }

    // For dashboard routes, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    // Store the original URL to redirect back after login
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
