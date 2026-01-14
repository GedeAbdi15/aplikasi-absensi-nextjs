import { NextResponse } from "next/server";

export async function GET(req) {
    const backendRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/izin`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Cookie: req.headers.get("cookie") || "",
            },
            credentials: "include",
        }
    );

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
}

export async function POST(req) {
    const body = await req.json();

    const backendRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/izin`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: req.headers.get("cookie") || "",
            },
            body: JSON.stringify(body),
            credentials: "include",
        }
    );

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
}

