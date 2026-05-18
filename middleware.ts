import { NextRequest, NextResponse } from "next/server";

// パブリック（認証不要）なパス一覧
const PUBLIC_PATHS = ["/login", "/complete-password"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("sample-sfz-token");
  const pathname = req.nextUrl.pathname;

  // "/" へのアクセスなら判定してリダイレクト
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } else {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // パブリックなパスは許可
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // それ以外は認証必須
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api).*)"], // ページ遷移に関係するすべてを対象
};
