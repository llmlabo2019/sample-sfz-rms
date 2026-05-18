import { NextRequest, NextResponse } from "next/server";

const ORIGIN: string = process.env.ORIGIN!;
const BASE_URL: string = process.env.BASE_URL!;

type ProxyRequest<T = any> = {
  endpoint: string;
  postData: T;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  const origin: string | null = req.headers.get("origin");

  if (!origin) {
    return NextResponse.json(
      { message: "Bad Request: Missing Origin" },
      { status: 400 },
    );
  }

  // if (origin !== ORIGIN) {
  //   return NextResponse.json({ message: "Forbidden: Invalid Origin" }, { status: 403 });
  // }

  const token: string | undefined = req.cookies.get("sample-sfz-token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: ProxyRequest | null = null;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json(
      { message: "Bad Request: Invalid JSON" },
      { status: 400 },
    );
  }

  if (!body?.endpoint) {
    return NextResponse.json(
      { message: "Bad Request: Missing endpoint" },
      { status: 400 },
    );
  }

  const fullUrl = BASE_URL + body.endpoint;

  try {
    const awsResponse = await fetch(fullUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body.postData),
    });
    const data = await awsResponse.json();
    return NextResponse.json(data, { status: awsResponse.status });
  } catch (error) {
    console.error("Error during fetch:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
