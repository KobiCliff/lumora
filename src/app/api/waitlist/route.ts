import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const count = await kv.incr("waitlist_count");
    await kv.set(`waitlist_email_${count}`, email);

    return NextResponse.json({ success: true, position: count });
}