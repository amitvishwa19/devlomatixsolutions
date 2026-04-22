import { BufferJSON, initAuthCreds } from '@whiskeysockets/baileys';
import { db } from '../../../../../../src/lib/db.js';

/**
 * Custom auth state for Baileys that uses Prisma as the backend.
 */
export async function usePrismaAuthState(sessionId) {
    
    // Helper to get or create WhatsAppAuth record
    const getAuthRecord = async () => {
        return await db.whatsAppAuth.upsert({
            where: { sessionId },
            update: {},
            create: {
                sessionId,
                status: 'DISCONNECTED',
                isActive: true
            }
        });
    };

    const auth = await getAuthRecord();
    const whatsappAuthId = auth.id;

    // 1. Initialize Credentials
    let creds;
    if (auth.credentials) {
        creds = JSON.parse(JSON.stringify(auth.credentials), BufferJSON.reviver);
    } else {
        creds = initAuthCreds();
    }

    // 2. Define Keys Interface
    const keys = {
        get: async (type, ids) => {
            const data = {};
            
            if (!db.whatsAppSessionKey) {
                console.error("[CRITICAL DB ERROR] db.whatsAppSessionKey is UNDEFINED.");
                throw new Error("whatsAppSessionKey is missing from Prisma Client!");
            }

            const results = await db.whatsAppSessionKey.findMany({
                where: {
                    whatsappAuthId,
                    keyId: { in: ids.map(id => `${type}-${id}`) }
                }
            });

            for (const row of results) {
                const id = row.keyId.substring(type.length + 1);
                data[id] = JSON.parse(row.data, BufferJSON.reviver);
            }

            return data;
        },
        set: async (data) => {
            try {
                const tasks = [];
                
                for (const type in data) {
                    const typeData = data[type];
                    for (const id in typeData) {
                        const value = typeData[id];
                        const keyId = `${type}-${id}`;
                        
                        if (value) {
                            tasks.push(
                                db.whatsAppSessionKey.upsert({
                                    where: { whatsappAuthId_keyId: { whatsappAuthId, keyId } },
                                    update: { data: JSON.stringify(value, BufferJSON.replacer) },
                                    create: { whatsappAuthId, keyId, data: JSON.stringify(value, BufferJSON.replacer) }
                                })
                            );
                        } else {
                            tasks.push(
                                db.whatsAppSessionKey.deleteMany({
                                    where: { whatsappAuthId, keyId }
                                })
                            );
                        }
                    }
                }

                await Promise.all(tasks);
            } catch (err) {
                console.error(`[WA] ERROR saving keys for session ${sessionId}:`, err);
            }
        }
    };

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
                console.error(`[WA] ERROR saving credentials for session ${sessionId}:`, err);
            }
    };

    return {
        state: {
            creds,
            keys
        },
        saveCreds
    };
}
