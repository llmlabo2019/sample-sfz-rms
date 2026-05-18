import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token } = await req.json();

  if (!token) {
    return new NextResponse("トークンがありません", { status: 400 });
  }

  const response = NextResponse.json({ message: "ログイン成功" });

  // HttpOnly Cookie にJWTを保存（SecureやSameSiteの設定も追加）
  response.cookies.set("sample-sfz-token", token, {
    httpOnly: true,
    path: "/",
    secure: true, // HTTPSでのみ送信（ローカル開発中はfalseでも可）
    sameSite: "lax", // 適切なクロスサイト設定
    maxAge: 60 * 60 * 24, // 1日有効
  });

  return response;
}
