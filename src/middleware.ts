import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "wildcanvas-super-secret-key-change-in-production-2026"
);
const COOKIE_NAME = process.env.COOKIE_NAME || "wildcanvas_session";

export async function middleware(request: any) {
  const { pathname } = request.nextUrl;

  // Only protect admin, studio, and account routes
  const isAdminRoute = pathname.startsWith("/admin");
  const isStudioRoute = pathname.startsWith("/studio");
  const isAccountRoute = pathname.startsWith("/account");

  if (!isAdminRoute && !isStudioRoute && !isAccountRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    // Redirect unauthenticated visitors to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ["HS256"],
    });

    const userRole = (payload as any).role;

    if (isAdminRoute && userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (isStudioRoute && userRole !== "TENANT_ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/studio/:path*", "/account/:path*"],
};
