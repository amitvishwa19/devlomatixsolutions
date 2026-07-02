import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const metadata = await db.workspaceMetadata.findUnique({
          });

    return NextResponse.json({ data: { metadata: metadata || {} } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch metadata" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { ...metadataFields } = body;

    const metadata = await db.workspaceMetadata.upsert({
            update: metadataFields,
      create: { ...metadataFields },
    });

    return NextResponse.json({ success: true, data: { metadata } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to update metadata" }, { status: 500 });
  }
}
