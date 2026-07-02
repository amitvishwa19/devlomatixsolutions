import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const userId = searchParams.get("userId");

    const defaultCredential = await db.credentials.findFirst({
      where: { ...(userId && { userId }), platform: 'WHATSAPP_CLOUD', isDefault: true }
    });

    if (!defaultCredential) {
      return NextResponse.json({ data: { success: true, activities: [], pagination: { currentPage: 1, pageSize, hasMore: false, totalOnPage: 0 } } });
    }

    let cloudCreds = null;
    const stored = defaultCredential.credentials;
    if (typeof stored === 'string' && stored.includes(':')) {
      try {
        const { symmetricDecrypt } = await import("@/lib/encryption");
        cloudCreds = JSON.parse(symmetricDecrypt(stored));
      } catch (e) {}
    } else if (typeof stored === 'string') {
      try { cloudCreds = JSON.parse(stored); } catch (e) {}
    } else { cloudCreds = stored; }

    if (cloudCreds?.enc) {
      try {
        const { symmetricDecrypt } = await import("@/lib/encryption");
        cloudCreds = JSON.parse(symmetricDecrypt(cloudCreds.enc));
      } catch (e) {}
    }

    const activePhoneId = String(cloudCreds?.phoneNumberId || cloudCreds?.phone_number_id || "");
    const bufferSize = page * pageSize + 10;

    const recentMessages = await db.whatsAppMessage.findMany({
      where: { ...(userId && { userId }), metadata: { path: ['phone_number_id'], equals: activePhoneId } },
      orderBy: { createdAt: 'desc' },
      take: bufferSize,
      select: { id: true, jid: true, text: true, fromMe: true, status: true, createdAt: true, waId: true }
    });

    const templateActivities = await db.messageTemplate.findMany({
      where: { ...(userId && { userId }), phoneNumberId: activePhoneId },
      orderBy: { updatedAt: 'desc' },
      take: bufferSize
    });

    const allActivities = [];

    recentMessages.forEach(msg => {
      if (!msg.fromMe) {
        allActivities.push({ id: `msg-${msg.id}`, type: "message", title: `New reply from ${msg.jid}`, description: (msg.text || "").substring(0, 50), time: msg.createdAt, status: 'unread' });
      } else if (msg.status === 'FAILED') {
        allActivities.push({ id: `fail-${msg.id}`, type: "alert", title: `Message delivery failed to ${msg.jid}`, description: "Meta API error or invalid number.", time: msg.createdAt, status: 'error' });
      }
    });

    templateActivities.forEach(tmpl => {
      if (tmpl.status === 'APPROVED') {
        allActivities.push({ id: `tmpl-app-${tmpl.id}`, type: "success", title: `Template Approved: ${tmpl.name}`, description: `Ready to send in ${tmpl.language}.`, time: tmpl.updatedAt, status: 'done' });
      } else if (tmpl.status === 'REJECTED') {
        allActivities.push({ id: `tmpl-rej-${tmpl.id}`, type: "alert", title: `Template Rejected: ${tmpl.name}`, description: "Check Meta for policy violations.", time: tmpl.updatedAt, status: 'error' });
      }
    });

    allActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    const start = (page - 1) * pageSize;
    const paginatedActivities = allActivities.slice(start, start + pageSize);
    const hasMore = allActivities.length > start + pageSize;

    return NextResponse.json({
      data: {
        success: true,
        activities: paginatedActivities.map(act => ({ ...act, time: act.time ? new Date(act.time).toISOString() : null })),
        pagination: { currentPage: page, pageSize, hasMore, totalOnPage: paginatedActivities.length }
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch activities" }, { status: 500 });
  }
}
