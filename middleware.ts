import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "smsim_auth";

// Only login is public; registration and password reset are disabled.
const PUBLIC_ROUTES = ["/login"];

const DISABLED_AUTH_PAGES = ["/register", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|gif|webp|mp4|glb|rar|woff|woff2|ttf|otf|css|js)$/)
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Registration / forgot-password → always send to login
  if (DISABLED_AUTH_PAGES.some((r) => pathname.startsWith(r))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const isAuthenticated = !!token && token.split(".").length === 3;

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  if (!isAuthenticated && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
