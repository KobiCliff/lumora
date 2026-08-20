import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const exists = await kv.get(`waitlist_email:${email}`);
    if (exists) {
    return NextResponse.json({ error: "Already on the waitlist" }, { status: 409 });
    }
    const count = await kv.incr("waitlist_count");
    await kv.set(`waitlist_email:${email}`, count);

    return NextResponse.json({ success: true, position: count });
}