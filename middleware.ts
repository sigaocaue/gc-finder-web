import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protege todas as rotas /admin/* exceto /admin/login
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    // Verifica se existe o cookie de refresh token como indicação de sessão
    const refreshToken = request.cookies.get("refresh_token");

    if (!refreshToken) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
