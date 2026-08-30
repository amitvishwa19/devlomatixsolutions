import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/auth";

async function getUserIdFromRequest(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return null;
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
    const payload = await decrypt(token);
    return payload?.userId || null;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { leads, workspaceId } = body;

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: "leads array is required" }, { status: 400 });
    }

    const wsId = workspaceId || "cmnbhifag000458ikwhv1zso2";
    const results = { saved: 0, updated: 0, skipped: 0, errors: [] };

    await db.$transaction(async (tx) => {
      for (const lead of leads) {
        try {
          if (!lead.phone) {
            results.skipped++;
            continue;
          }

          const cleanPhone = lead.phone.replace(/[^\d+]/g, "");
          if (!cleanPhone || cleanPhone.length < 5) {
            results.skipped++;
            continue;
          }

          const info = {
            address: lead.address || "No address provided",
            rating: lead.rating || 0,
            reviews: lead.reviews || 0,
            website: lead.website || null,
            category: lead.category || "General",
            source: "LeadGen",
          };

          const existingContact = await tx.contact.findFirst({
            where: { workspaceId: wsId, phone: cleanPhone }
          });

          let contact;
          if (existingContact) {
            contact = await tx.contact.update({
              where: { id: existingContact.id },
              data: {
                name: lead.name,
                email: lead.email || undefined,
                info,
                userId,
                type: "LEAD",
              }
            });
          } else {
            contact = await tx.contact.create({
              data: {
                name: lead.name,
                phone: cleanPhone,
                email: lead.email || undefined,
                info,
                userId,
                workspaceId: wsId,
                type: "LEAD",
              }
            });
          }

          results.saved++;
        } catch (err) {
          console.error(`[LEADGEN_SAVE] Error processing lead ${lead.name}:`, err);
          results.errors.push({ name: lead.name, error: err.message });
        }
      }
    }, { timeout: 30000 });

    return NextResponse.json({
      success: true,
      message: `Saved ${results.saved} leads (${results.skipped} skipped).`,
      results,
    });
  } catch (error) {
    console.error("LeadGen save error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
