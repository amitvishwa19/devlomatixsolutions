import { BufferJSON, initAuthCreds } from '@whiskeysockets/baileys';
import { db } from '@/lib/db';

/**
 * Custom auth state adapter for Baileys that persists session keys and credentials in PostgreSQL via Prisma.
 * Compatible with multi-device Baileys architecture.
 *
 * @param {string} sessionId - Unique workspace/user session identifier
 */
export async function usePrismaAuthState(sessionId) {
    if (!sessionId) {
        throw new Error("sessionId is required for usePrismaAuthState");
    }

    // Helper to get or create WhatsAppAuth record
    const getAuthRecord = async () => {
        let auth = await db.whatsAppAuth.findUnique({
            where: { sessionId }
        });

        if (!auth) {
            auth = await db.whatsAppAuth.create({
                data: {
                    sessionId,
                    status: 'DISCONNECTED',
                    isActive: true,
                    sessionName: `Konnect Session (${sessionId})`
                }
            });
        }

        return auth;
    };

    const auth = await getAuthRecord();
    const whatsappAuthId = auth.id;

    // 1. Initialize Credentials
    let creds;
    if (auth.credentials) {
        try {
            creds = JSON.parse(JSON.stringify(auth.credentials), BufferJSON.reviver);
        } catch (err) {
            console.warn(`[WA-AUTH] Failed to parse stored credentials for session ${sessionId}, re-initializing creds:`, err.message);
            creds = initAuthCreds();
        }
    } else {
        creds = initAuthCreds();
    }

    // 2. Define Keys Interface for Baileys
    const keys = {
        get: async (type, ids) => {
            const data = {};

            if (!db.whatsAppSessionKey) {
                console.error("[CRITICAL DB ERROR] db.whatsAppSessionKey is undefined in Prisma Client!");
                return data;
            }

            try {
                const targetKeyIds = ids.map(id => `${type}-${id}`);
                const rows = await db.whatsAppSessionKey.findMany({
                    where: {
                        whatsappAuthId,
                        keyId: { in: targetKeyIds }
                    }
                });

                for (const row of rows) {
                    try {
                        const id = row.keyId.substring(type.length + 1);
                        data[id] = JSON.parse(row.data, BufferJSON.reviver);
                    } catch (parseErr) {
                        console.warn(`[WA-AUTH] Corrupted key ${row.keyId} for session ${sessionId}:`, parseErr.message);
                    }
                }
            } catch (err) {
                console.error(`[WA-AUTH] Error getting keys for session ${sessionId}:`, err.message);
            }

            return data;
        },

        set: async (data) => {
            try {
                const upsertPromises = [];

                for (const type in data) {
                    const typeData = data[type];
                    for (const id in typeData) {
                        const value = typeData[id];
                        const keyId = `${type}-${id}`;

                        if (value) {
                            const serializedData = JSON.stringify(value, BufferJSON.replacer);
                            upsertPromises.push(
                                db.whatsAppSessionKey.upsert({
                                    where: {
                                        whatsappAuthId_keyId: {
                                            whatsappAuthId,
                                            keyId
                                        }
                                    },
                                    update: {
                                        data: serializedData
                                    },
                                    create: {
                                        whatsappAuthId,
                                        keyId,
                                        data: serializedData
                                    }
                                })
                            );
                        } else {
                            // If key value is null/undefined, remove it
                            upsertPromises.push(
                                db.whatsAppSessionKey.deleteMany({
                                    where: {
                                        whatsappAuthId,
                                        keyId
                                    }
                                })
                            );
                        }
                    }
                }

                if (upsertPromises.length > 0) {
                    await Promise.all(upsertPromises);
                }
            } catch (err) {
                console.error(`[WA-AUTH] Error setting keys for session ${sessionId}:`, err.message);
            }
        }
    };

    // 3. Callback to persist root credentials update
    const saveCreds = async () => {
        try {
            await db.whatsAppAuth.update({
                where: { id: whatsappAuthId },
                data: {
                    credentials: JSON.parse(JSON.stringify(creds, BufferJSON.replacer)),
                    updatedAt: new Date()
                }
            });
        } catch (err) {
            console.error(`[WA-AUTH] Error saving credentials for session ${sessionId}:`, err.message);
        }
    };

    return {
        state: {
            creds,
            keys
        },
        saveCreds,
        whatsappAuthId
    };
}
