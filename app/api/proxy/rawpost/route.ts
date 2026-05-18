import { NextRequest, NextResponse } from 'next/server';

const ORIGIN: string = process.env.ORIGIN!;
const BASE_URL: string = process.env.BASE_URL!;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { endpoint, body: requestBody } = body;
    const origin: string | null = req.headers.get('origin');

    if (!endpoint || typeof requestBody !== 'object') {
      return NextResponse.json({ message: 'Bad Request: Missing or invalid data' }, { status: 400 });
    }

    if (!origin) {
      return NextResponse.json({ message: 'Bad Request: Missing Origin' }, { status: 400 });
    }

    // if (origin !== ORIGIN) {
    // 	return NextResponse.json({ message: 'Forbidden: Invalid Origin' }, { status: 403 });
    // }

    const fullUrl = BASE_URL + endpoint;

    const awsResponse = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const cookieHeader = awsResponse.headers.get('set-cookie');

    const responseBody = await awsResponse.text();

    const nextResponse = new NextResponse(responseBody, {
      status: awsResponse.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Cookie がある場合のみヘッダーに設定
    if (cookieHeader) {
      nextResponse.headers.set('Set-Cookie', cookieHeader);
    }

    return nextResponse;
  } catch (error) {
    console.error('Proxy POST error:', error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
