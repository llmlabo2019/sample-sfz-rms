import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ORIGIN: string = process.env.ORIGIN!;
  const BASE_URL: string = process.env.BASE_URL!;
  const req_origin: string | null = req.headers.get("origin");
  let baseUrl: string = BASE_URL;

  if (!req_origin) {
    return NextResponse.json(
      { message: "Bad Request: Missing Origin" },
      { status: 400 },
    );
  }

  // if (req_origin !== ORIGIN) {
  //   return NextResponse.json(
  //     { message: "Forbidden: Invalid Origin" },
  //     { status: 403 }
  //   );
  // }

  const token = req.cookies.get("sample-sfz-token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: { endpoint: string } | null = null;
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

  const fullUrl = baseUrl + body.endpoint;

  try {
    const awsResponse = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // 204 No Content の場合は空のデータを返す
    if (awsResponse.status === 204) {
      return NextResponse.json({}, { status: 200 });
    }

    // レスポンスボディが空の場合のエラーハンドリング
    const text = await awsResponse.text();
    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return NextResponse.json(
        { message: "Invalid JSON response from server" },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: awsResponse.status });
  } catch (error) {
    console.error("Error during fetch:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
