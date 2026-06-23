import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    
    if (!name) return NextResponse.json({ error: "No name provided" });

    const template = await db.messageTemplate.findFirst({
        where: { name: name }
    });

    return NextResponse.json(template);
}
