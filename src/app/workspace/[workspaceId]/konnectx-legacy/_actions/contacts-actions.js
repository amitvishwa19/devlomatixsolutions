'use server';

import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

/**
 * Fetch contacts for Konnect Legacy from isolated KonnectLegacyContact table
 */
export async function getKonnectContactsAction(workspaceId, filters = {}) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const where = {
            workspaceId,
            ...(filters.search ? {
                OR: [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    { phone: { contains: filters.search, mode: 'insensitive' } },
                    { email: { contains: filters.search, mode: 'insensitive' } }
                ]
            } : {})
        };

        const contacts = await db.konnectLegacyContact.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 200
        });

        return { success: true, contacts };
    } catch (error) {
        console.error("[GET_KONNECT_CONTACTS_ERROR]", error);
        return { success: false, error: error.message || "Failed to load contacts", contacts: [] };
    }
}

/**
 * Save / Create / Update a contact in isolated KonnectLegacyContact table
 */
export async function saveKonnectContactAction(workspaceId, contactData) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const { id, name, phone, email, tags, notes } = contactData;

        const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
        if (!cleanPhone) {
            return { success: false, error: "A valid phone number is required" };
        }

        let contact;
        if (id) {
            contact = await db.konnectLegacyContact.update({
                where: { id },
                data: {
                    name: name || undefined,
                    phone: cleanPhone,
                    email: email || undefined,
                    tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
                    notes: notes || undefined
                }
            });
        } else {
            contact = await db.konnectLegacyContact.upsert({
                where: {
                    workspaceId_phone: {
                        workspaceId,
                        phone: cleanPhone
                    }
                },
                update: {
                    name: name || `+${cleanPhone}`,
                    email: email || undefined,
                    tags: Array.isArray(tags) ? tags : (tags ? [tags] : ['Manual'])
                },
                create: {
                    workspaceId,
                    userId,
                    name: name || `+${cleanPhone}`,
                    phone: cleanPhone,
                    email: email || null,
                    tags: Array.isArray(tags) ? tags : (tags ? [tags] : ['Manual']),
                    notes: notes || null
                }
            });
        }

        return { success: true, contact };
    } catch (error) {
        console.error("[SAVE_KONNECT_CONTACT_ERROR]", error);
        return { success: false, error: error.message || "Failed to save contact" };
    }
}

/**
 * Delete a contact from KonnectLegacyContact table
 */
export async function deleteKonnectContactAction(workspaceId, contactId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        await db.konnectLegacyContact.delete({
            where: { id: contactId }
        });

        return { success: true };
    } catch (error) {
        console.error("[DELETE_KONNECT_CONTACT_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete contact" };
    }
}

/**
 * Bulk import contacts into KonnectLegacyContact table
 */
export async function importKonnectContactsAction(workspaceId, contactsList) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        if (!Array.isArray(contactsList) || contactsList.length === 0) {
            return { success: false, error: "No contacts provided" };
        }

        let createdCount = 0;
        let skippedCount = 0;

        for (const item of contactsList) {
            const rawPhone = item.phone || item.number || item.mobile;
            if (!rawPhone) {
                skippedCount++;
                continue;
            }
            const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
            if (!cleanPhone || cleanPhone.length < 6) {
                skippedCount++;
                continue;
            }

            try {
                await db.konnectLegacyContact.upsert({
                    where: {
                        workspaceId_phone: {
                            workspaceId,
                            phone: cleanPhone
                        }
                    },
                    update: {
                        name: item.name || undefined
                    },
                    create: {
                        workspaceId,
                        userId,
                        name: item.name || `+${cleanPhone}`,
                        phone: cleanPhone,
                        email: item.email || null,
                        tags: item.tags ? (Array.isArray(item.tags) ? item.tags : [item.tags]) : ['Imported']
                    }
                });
                createdCount++;
            } catch (e) {
                skippedCount++;
            }
        }

        return { success: true, createdCount, skippedCount };
    } catch (error) {
        console.error("[IMPORT_KONNECT_CONTACTS_ERROR]", error);
        return { success: false, error: error.message || "Failed to import contacts" };
    }
}

/**
 * Auto-sync contacts from recent linked device messages in KonnectLegacyMessage
 */
export async function syncWhatsAppContactsAction(workspaceId) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // Fetch distinct messages from isolated KonnectLegacyMessage table
        const recentMessages = await db.konnectLegacyMessage.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' },
            take: 300
        });

        let syncedCount = 0;
        const seenPhones = new Set();

        for (const msg of recentMessages) {
            const cleanPhone = msg.phoneNumber || msg.jid.replace('@s.whatsapp.net', '').replace('@g.us', '').replace('@lid', '');
            if (seenPhones.has(cleanPhone) || msg.jid.includes('@g.us') || !cleanPhone || cleanPhone.length < 6) continue;
            seenPhones.add(cleanPhone);

            try {
                await db.konnectLegacyContact.upsert({
                    where: {
                        workspaceId_phone: {
                            workspaceId,
                            phone: cleanPhone
                        }
                    },
                    update: {
                        lastMessage: msg.text,
                        lastInteraction: msg.createdAt,
                        ...(msg.pushName ? { whatsappName: msg.pushName } : {})
                    },
                    create: {
                        workspaceId,
                        userId,
                        name: msg.pushName || `+${cleanPhone}`,
                        phone: cleanPhone,
                        whatsappName: msg.pushName || null,
                        lastMessage: msg.text,
                        lastInteraction: msg.createdAt,
                        isSyncedFromPhone: true,
                        tags: ['WhatsApp Sync']
                    }
                });
                syncedCount++;
            } catch (err) {}
        }

        return { success: true, syncedCount };
    } catch (error) {
        console.error("[SYNC_WA_CONTACTS_ERROR]", error);
        return { success: false, error: error.message || "Sync failed" };
    }
}
