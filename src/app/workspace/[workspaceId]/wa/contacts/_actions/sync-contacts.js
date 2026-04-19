'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { waManager } from '@/app/workspace/[workspaceId]/wa/_lib/whatsapp-v2';

const SyncContactsSchema = z.object({
    userId: z.string(),
    workspaceId: z.string().optional(),
});

const handler = async (data) => {
    const { userId, workspaceId } = data;
    await ensureWorkspaceAccess(workspaceId);

    try {
        if (waManager.getState() !== 'open') {
            return { error: 'WhatsApp is not connected' };
        }

        const waContacts = waManager.getContacts();
        
        if (!waContacts || !Array.isArray(waContacts) || waContacts.length === 0) {
            return { data: { count: 0, message: 'No contacts found on WhatsApp' } };
        }

        let count = 0;
        const targetWorkspaceId = workspaceId || 'cmnbhifag000458ikwhv1zso2';

        for (const contact of waContacts) {
            try {
                if (!contact || !contact.id) continue;
                
                const jid = contact.id;
                if (jid.includes('@g.us') || jid.includes('@broadcast') || jid.includes('newsletter')) continue;
                if (!jid.endsWith('@s.whatsapp.net')) continue;

                const phone = jid.split('@')[0];
                if (!phone) continue;

                const cleanPhone = phone.replace(/[^\d+]/g, '');
                if (!cleanPhone || cleanPhone.length < 5) continue;

                const name = contact.name || contact.notify || contact.verifiedName || phone;
                
                await db.contact.upsert({
                    where: { 
                        workspaceId_phone: { 
                            workspaceId: targetWorkspaceId, 
                            phone: cleanPhone 
                        } 
                    },
                    update: {
                        name,
                        userId,
                        updatedAt: new Date()
                    },
                    create: {
                        name,
                        phone: cleanPhone,
                        userId,
                        workspaceId: targetWorkspaceId,
                        info: { source: 'WhatsApp Sync' }
                    }
                });
                count++;
            } catch (err) {
                console.error(`[Sync Action] Failed to process contact ${contact?.id}:`, err);
            }
        }

        return { 
            data: { 
                count, 
                message: `Successfully synchronized ${count} contacts from WhatsApp` 
            } 
        };
    } catch (error) {
        console.error('Action Error (syncWAContacts):', error);
        return { error: error.message || 'Internal Server Error' };
    }
};

export const syncWAContacts = createSafeAction(SyncContactsSchema, handler);
