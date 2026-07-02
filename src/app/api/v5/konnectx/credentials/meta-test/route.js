import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { url, headers, method = 'GET', payload } = body;

    if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

    const fetchOptions = {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
    };

    if (payload && method !== 'GET') {
      fetchOptions.body = JSON.stringify(payload);
    }

    const res = await fetch(url, fetchOptions);
    const data = await res.json();

    return NextResponse.json({ success: res.ok, apiData: data, statusCode: res.status });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
