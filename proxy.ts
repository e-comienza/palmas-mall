import { NextResponse, type NextRequest } from "next/server";

/**
 * Primera barrera para /admin: si no hay cookie de sesión redirige al login.
 * La verificación real de sesión y rol ocurre en el layout del admin y en
 * cada server action (ver src/lib/permissions.ts).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return NextResponse.next();
  }

  const hasSession =
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token");

  if (!hasSession) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
