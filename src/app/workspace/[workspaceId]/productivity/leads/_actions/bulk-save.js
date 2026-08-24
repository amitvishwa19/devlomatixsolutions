"use server"
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { revalidatePath } from "next/cache";

/**
 * Bulk Save Leads to Contacts
 * @param {string} workspaceId 
 * @param {Array} leads 
 * @param {Object} globalData { category, tags, description }
 */
export async function bulkSaveLeadsAction(workspaceId, leads, globalData = {}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.userId) {
            return { success: false, error: "Unauthorized" };
        }

        const userId = session.user.userId || session.user.id;

        if (!leads || !Array.isArray(leads) || leads.length === 0) {
            return { success: false, error: "No leads provided" };
        }

        const results = {
            saved: 0,
            skipped: 0,
            failed: 0
        };

        // Helper to clean business name (SEO suffixes)
        const cleanBusinessName = (name) => {
            if (!name) return "";
            return name.split(/[-|]/)[0].trim();
        };

        // Helper to clean phone and ensure 12 digits (India prefix 91)
        const formatPhone = (phone) => {
            if (!phone) return null;
            let digits = phone.replace(/\D/g, '');
            if (digits.length === 11 && digits.startsWith('0')) {
                digits = digits.substring(1);
            }
            return digits.length === 10 ? `91${digits}` : digits;
        };

        // We use a simple loop instead of transaction to handle individual row failures/duplicates gracefully
        for (const lead of leads) {
            try {
                const cleanPhone = formatPhone(lead.phone);
                if (!cleanPhone) {
                    results.failed++;
                    continue;
                }

                const info = {
                    description: globalData.description || "",
                    source: 'LeadFinder (Bulk)',
                    savedAt: new Date().toISOString(),
                    raw: lead // Store the full original lead data here
                };

                await db.contact.upsert({
                    where: {
                        workspaceId_phone: {
                            workspaceId,
                            phone: cleanPhone
                        }
                    },
                    update: {
                        name: lead.name,
                        title: cleanBusinessName(lead.name),
                        address: lead.address || undefined,
                        location: lead.location || undefined,
                        category: globalData.category || undefined,
                        tags: globalData.tags || [],
                        info: info,
                        type: 'GOOGLE_PLACE'
                    },
                    create: {
                        workspaceId,
                        userId,
                        name: lead.name,
                        phone: cleanPhone,
                        title: cleanBusinessName(lead.name),
                        address: lead.address || undefined,
                        location: lead.location || undefined,
                        category: globalData.category || "Google Places",
                        tags: globalData.tags || [],
                        info: info,
                        type: 'GOOGLE_PLACE'
                    }
                });
                results.saved++;
            } catch (err) {
                console.error(`[BULK_SAVE] Error saving lead ${lead.id}:`, err);
                results.failed++;
            }
        }

        revalidatePath(`/workspace/${workspaceId}/miscellaneous/leads`);
        return { success: true, results };

    } catch (error) {
        console.error("[BULK_SAVE_ERROR]", error);
        return { success: false, error: "Internal Server Error" };
    }
}
