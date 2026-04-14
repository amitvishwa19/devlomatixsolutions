import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req) {
    try {
        console.log("🚀 [Migration] Starting JID Normalization...");
        
        // 1. Fetch all messages
        const messages = await db.whatsAppMessage.findMany();
        let updatedCount = 0;

        for (const msg of messages) {
            const originalJid = msg.jid;
            // Normalize: Strip non-digits and ensure @s.whatsapp.net
            const cleanPhone = originalJid.replace(/\D/g, '').split('@')[0];
            const normalizedJid = `${cleanPhone}@s.whatsapp.net`;

            if (originalJid !== normalizedJid) {
                await db.whatsAppMessage.update({
                    where: { id: msg.id },
                    data: { jid: normalizedJid }
                });
                updatedCount++;
            }
        }

        console.log(`✅ [Migration] Successfully normalized ${updatedCount} messages.`);
        
        return NextResponse.json({ 
            success: true, 
            message: `JID Normalization complete. Updated ${updatedCount} messages.`,
            note: "You can now safely delete this API route."
        });
    } catch (error) {
        console.error("[MIGRATION_ERROR]", error);
        return NextResponse.json({ error: "Migration failed" }, { status: 500 });
    }
}
