import { NextResponse } from "next/server";

export async function GET(req) {
    const cookie = req.headers.get("cookie") ?? "";

    const backendRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
        {
            headers: { cookie },
            credentials: "include",
        }
    );

    const data = await backendRes.json();
    return NextResponse.json(data);
}
