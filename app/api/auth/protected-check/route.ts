import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';

const userPoolId = process.env.USER_POOL_ID!;
const issuer = `https://cognito-idp.ap-northeast-1.amazonaws.com/${userPoolId}`;
const JWKS = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));

export async function GET(req: NextRequest) {
  const token = req.cookies?.get('cpmc-token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Token is missing in cookies' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS, { issuer });

    return NextResponse.json({ message: 'Token is valid', user: payload }, { status: 200 });
  } catch (error) {
    console.error('JWT verification failed:', error);
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
  }
}
