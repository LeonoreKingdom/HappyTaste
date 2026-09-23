import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

function requiresMemberSession(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (
    pathname === "/akun/profil" ||
    pathname.startsWith("/akun/profil/") ||
    pathname === "/loyalty" ||
    pathname.startsWith("/loyalty/") ||
    pathname === "/reservation" ||
    pathname.startsWith("/reservation/") ||
    pathname === "/order/advance" ||
    pathname.startsWith("/order/advance/")
  ) {
    return true;
  }

  const isAdvanceOrderPath =
    pathname === "/order" ||
    pathname === "/order/cart" ||
    pathname === "/order/confirm";

  return isAdvanceOrderPath && searchParams.getAll("mode").includes("advance");
}

export function proxy(request: NextRequest) {
  if (!requiresMemberSession(request) || getSessionCookie(request)) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/akun/masuk";
  loginUrl.search = "";
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/akun/profil/:path*",
    "/loyalty/:path*",
    "/reservation/:path*",
    "/order",
    "/order/advance/:path*",
    "/order/cart/:path*",
    "/order/confirm/:path*",
  ],
};
