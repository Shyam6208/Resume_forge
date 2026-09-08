import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes requiring authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/editor",
  "/onboarding",
  "/profile",
  "/settings",
  "/builder",
  "/admin",
];

// Routes restricted for already authenticated users
const AUTH_ROUTES = ["/login", "/signup", "/register"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { pathname } = request.nextUrl;

  // Allow unauthenticated access to the dedicated admin login page
  if (pathname === "/admin/login") {
    return supabaseResponse;
  }

  // Check if route needs auth verification
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Fast-path for public routes (e.g. landing page, templates, ATS checker, portfolios):
  // Return immediately without making a blocking external network round-trip to Supabase!
  if (!isProtectedRoute && !isAuthRoute) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({
            request,
          });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // Refresh session token & retrieve user only for protected/auth routes
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Unauthenticated users trying to access protected routes
  if (!user && isProtectedRoute) {
    const targetLogin = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    const loginUrl = new URL(targetLogin, request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated users trying to access public auth pages (login/signup)
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public assets (*.svg, *.png, *.jpg, *.jpeg, *.gif, *.webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
