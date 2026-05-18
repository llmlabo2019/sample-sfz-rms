import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'ログアウト成功' });

  // Cookieを削除
  response.cookies.set('cpmc-token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}
