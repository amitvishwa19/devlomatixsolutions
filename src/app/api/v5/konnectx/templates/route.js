import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/auth";

async function getUserIdFromRequest(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
      const payload = await decrypt(token);
      if (payload?.userId) return payload.userId;
    }
    const { searchParams } = new URL(request.url);
    return searchParams.get("userId") || null;
  } catch (error) {
    console.error('[getUserIdFromRequest] Error decrypting token:', error);
    const { searchParams } = new URL(request.url);
    return searchParams.get("userId") || null;
  }
}

export async function GET(request) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const phoneNumberId =
      searchParams.get("phoneNumberId") ||
      searchParams.get("phone_number_id") ||
      searchParams.get("phonenumberid") ||
      searchParams.get("phoneNumber");

    const templates = await db.messageTemplate.findMany({
      where: {
        AND: [
          {
            OR: [
              { userId },
              { sharedWith: { some: { sharedWithUserId: userId } } }
            ]
          },
          ...(phoneNumberId
            ? [{ OR: [{ phoneNumberId }, { phoneNumberId: null }] }]
            : [])
        ]
      },
      include: {
        sharedWith: {
          include: {
            sharedWith: {
              select: { id: true, displayName: true, email: true }
            }
          }
        }
      },
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
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, category, language, type, body: templateBody, footer, buttons, metadata, platform, status, phoneNumberId } = body;

    if (!name || !templateBody) {
      return NextResponse.json({ error: "Name and body are required" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const accountPhone =
      phoneNumberId ||
      searchParams.get("phoneNumberId") ||
      searchParams.get("phone_number_id") ||
      null;

    const template = await db.messageTemplate.create({
      data: {
        userId,
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
        phoneNumberId: accountPhone,
      },
    });

    return NextResponse.json({ success: true, data: { template } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to create template" }, { status: 500 });
  }
}
