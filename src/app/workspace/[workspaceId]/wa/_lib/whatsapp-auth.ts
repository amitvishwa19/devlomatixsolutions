import { AuthenticationCreds, AuthenticationState, BufferJSON, SignalDataSet, SignalDataTypeMap, initAuthCreds } from '@whiskeysockets/baileys';
import { WA_NODE_REGISTRY as NODE_REGISTRY } from '@/app/workspace/[workspaceId]/wa/bot-flow-builder/_lib/node-registry';
import { db } from '@/lib/db';

/**
 * Custom auth state for Baileys that uses Prisma as the backend.
 */
export async function usePrismaAuthState(sessionId: string): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> {
    
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
    let creds: AuthenticationCreds;
    if (auth.credentials) {
        creds = JSON.parse(JSON.stringify(auth.credentials), BufferJSON.reviver);
    } else {
        creds = initAuthCreds();
    }

    // 2. Define Keys Interface
    const keys = {
        get: async (type: keyof SignalDataTypeMap, ids: string[]) => {
            const data: { [id: string]: any } = {};
            
            if (!db.whatsAppSessionKey) {
                console.error("[CRITICAL DB ERROR] db.whatsAppSessionKey is UNDEFINED. Available keys:", Object.keys(db));
                throw new Error("Cannot read properties of undefined (reading 'findMany') - whatsAppSessionKey is missing from Prisma Client!");
            }

            const results = await db.whatsAppSessionKey.findMany({
                where: {
                    whatsappAuthId,
                    keyId: { in: ids.map(id => `${type}-${id}`) }
                }
            });

            for (const row of results) {
                const id = row.keyId.substring(type.length + 1);
                console.log(`[WA] Found key: ${row.keyId} in DB for session: ${sessionId}`);
                data[id] = JSON.parse(row.data, BufferJSON.reviver);
            }

            if (Object.keys(data).length === 0 && ids.length > 0) {
                console.log(`[WA] Keys NOT found in DB for session: ${sessionId}, types: ${type}, ids: ${ids.join(',')}`);
            }

            return data;
        },
        set: async (data: SignalDataSet) => {
            try {
                const tasks: any[] = [];
                
                for (const type in data) {
                    const typeData = data[type as keyof SignalDataSet];
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
