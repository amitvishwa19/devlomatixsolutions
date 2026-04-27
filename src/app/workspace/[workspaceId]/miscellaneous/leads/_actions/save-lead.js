'use server'

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { revalidatePath } from "next/cache";

async function getUserId() {
    const session = await getServerSession(authOptions);
    return session?.user?.userId || session?.user?.id;
}

export async function saveLeadAction(workspaceId, data) {
    try {
        const userId = await getUserId();
        if (!userId) throw new Error("Unauthorized");

        const {
            name,
            phone,
            email,
            title,
            category,
            address,
            location,
            tags,
            description
        } = data;

        if (!name || !phone) {
            throw new Error("Name and Phone are required");
        }

        // Clean phone number and ensure 12 digits (handle leading 0 and add 91 if 10 digits)
        let digits = phone.replace(/\D/g, '');
        if (digits.length === 11 && digits.startsWith('0')) {
            digits = digits.substring(1);
        }
        const cleanPhone = digits.length === 10 ? `91${digits}` : digits;

        const info = {
            description: description || "",
            source: 'LeadFinder',
            savedAt: new Date().toISOString()
        };

        const contact = await db.contact.upsert({
            where: {
                workspaceId_phone: {
                    workspaceId,
                    phone: cleanPhone
                }
            },
            update: {
                name,
                email: email || undefined,
                title: title || undefined,
                category: category || undefined,
                address: address || undefined,
                location: location || undefined,
                tags: tags || [],
                info: info,
                userId,
                type: 'GOOGLE_PLACE'
            },
            create: {
                workspaceId,
                userId,
                name,
                phone: cleanPhone,
                email: email || undefined,
                title: title || undefined,
                category: category || undefined,
                address: address || undefined,
                location: location || undefined,
                tags: tags || [],
                info: info,
                type: 'GOOGLE_PLACE'
            }
        });

        revalidatePath(`/workspace/${workspaceId}/miscellaneous/leads`);
        
        return { success: true, contact };

    } catch (error) {
        console.error("[SAVE_LEAD_ACTION_ERROR]", error);
        return { success: false, error: error.message };
    }
}
