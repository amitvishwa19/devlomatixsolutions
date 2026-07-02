import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");

    const templates = await db.messageTemplate.findMany({
      where: { ...(userId && { userId }) },
      orderBy: { updatedAt: 'desc' },
    });

    const parsed = templates.map(t => {
      let mt = { ...t };
      if (typeof t.metadata === 'string' && t.metadata.trim().startsWith('{')) {
        try { mt.metadata = JSON.parse(t.metadata); } catch (e) {}
      }
      if (typeof t.buttons === 'string' && t.buttons.trim().startsWith('[')) {
        try { mt.buttons = JSON.parse(t.buttons); } catch (e) {}
      }
      return mt;
    });

    return NextResponse.json({ data: { templates: parsed } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, category, language, type, body: templateBody, footer, buttons, metadata, platform, status } = body;

    if (!name || !templateBody) {
      return NextResponse.json({ error: "Name and body are required" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const template = await db.messageTemplate.create({
      data: {
        ...(userId && { userId }),
        name,
        templateName: name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        category: category || 'UTILITY',
        language: language || 'en_US',
        type: type || 'text',
        body: templateBody,
        footer: footer || null,
        buttons: buttons || [],
        metadata: metadata || {},
        platform: platform || 'WHATSAPP_CLOUD',
        status: status || 'DRAFT',
      },
    });

    return NextResponse.json({ success: true, data: { template } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to create template" }, { status: 500 });
  }
}
