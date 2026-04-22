import { makeWASocket, DisconnectReason, fetchLatestBaileysVersion, prepareWAMessageMedia } from '@whiskeysockets/baileys';
import pino from 'pino';
import { usePrismaAuthState } from './whatsapp-auth.js';
import { db } from '../../../../../../src/lib/db.js';
import * as fs from 'fs';

class WhatsAppManager {
    constructor() { }
    
    sock = null;
    state = 'welcome';
    qrString = null;
    messages = [];
    contacts = [];
    currentSessionId = null;
    userId = null;
    workspaceId = null;
    connectedAt = null;

    getState() {
        return this.state;
    }

    getQrCodeString() {
        return this.qrString;
    }

    getMessages() {
        return this.messages.map(m => ({
            id: m.id,
            jid: m.jid,
            text: m.text,
            fromMe: m.fromMe,
            timestamp: typeof m.timestamp === 'bigint' ? Number(m.timestamp) : m.timestamp
        }));
    }

    getContacts() {
        return this.contacts;
    }

    getUser() {
        if (!this.sock?.user) return null;
        return {
            id: this.sock.user.id,
            name: this.sock.user.name,
            imgUrl: this.sock.user.imgUrl,
            connectedAt: this.connectedAt
        };
    }

    connect(sessionId = 'default') {
        if (this.state === 'open' || this.state === 'connecting' || this.state === 'qr') return;
        this.currentSessionId = sessionId;
        this.init(sessionId);
    }

    async init(sessionId) {
        this.state = 'connecting';
        this.qrString = null;
        this.currentSessionId = sessionId;

        try {
            const { state, saveCreds } = await usePrismaAuthState(sessionId);
            const { version } = await fetchLatestBaileysVersion();

            const authRecord = await db.whatsAppAuth.findUnique({
                where: { sessionId }
            });
            this.userId = authRecord?.userId || null;
            // Attempt to get metadata from authRecord if workspaceId was stored there
            this.workspaceId = authRecord?.metadata?.workspaceId || null;

            this.sock = makeWASocket({
                version,
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: 'silent' }),
                browser: ['Devlomatix', 'Chrome', '118.0.5993.88'],
                syncFullHistory: false
            });

            this.sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;
                
                if (qr) {
                    this.state = 'qr';
                    this.qrString = qr;
                }

                if (connection === 'close') {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                    
                    console.log(`[WA] Connection closed for ${sessionId}. Should reconnect: ${shouldReconnect}`);
                    
                    if (shouldReconnect) {
                        setTimeout(() => this.init(sessionId), 5000);
                    } else {
                        this.state = 'welcome';
                        this.sock = null;
                        this.qrString = null;
                        this.userId = null;
                        
                        await db.whatsAppAuth.updateMany({
                            where: { sessionId },
                            data: { status: 'DISCONNECTED', isActive: false }
                        }).catch((e) => console.error('[WA] DB update error:', e));

                        db.whatsAppSessionKey.deleteMany({
                            where: { sessionId }
                        }).catch((e) => console.error('[WA] DB clear error:', e));
                    }
                } else if (connection === 'open') {
                    this.state = 'open';
                    this.qrString = null;
                    if (!this.connectedAt) this.connectedAt = Date.now();
                    
                    console.log(`[WA] Connection SUCCESS for session: ${sessionId}`);
                    
                    // Automatically update DB status to CONNECTED
                    await db.whatsAppAuth.update({
                        where: { sessionId },
                        data: { status: 'CONNECTED', isActive: true }
                    }).catch((e) => console.error('[WA] Failed to update DB status to CONNECTED:', e));
                }
            });

            this.sock.ev.on('messages.upsert', async (m) => {
                const msgs = m.messages;
                if (!msgs || msgs.length === 0) return;

                const dbActions = [];
                for (const msg of msgs) {
                    if (!msg.message) continue;

                    const jid = msg.key.remoteJid || '';
                    const fromMe = msg.key.fromMe || false;
                    const id = msg.key.id || '';
                    const timestamp = msg.messageTimestamp ? (typeof msg.messageTimestamp === 'number' ? msg.messageTimestamp : msg.messageTimestamp.low) : Math.floor(Date.now() / 1000);
                    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

                    if (text && jid) {
                        this.pushToHistory(id, jid, text, fromMe);
                        if (this.userId) {
                            dbActions.push(
                                db.whatsAppMessage.upsert({
                                    where: { waId: id },
                                    update: { status: 'DELIVERED' },
                                    create: {
                                        waId: id,
                                        userId: this.userId,
                                        jid,
                                        text,
                                        fromMe,
                                        timestamp: BigInt(timestamp)
                                    }
                                })
                            );

                            if (this.workspaceId) {
                                dbActions.push(
                                    db.systemLog.create({
                                        data: {
                                            workspaceId: this.workspaceId,
                                            userId: this.userId,
                                            message: `${fromMe ? 'Outgoing' : 'Incoming'} message ${fromMe ? 'to' : 'from'} ${jid.split('@')[0]}`,
                                            type: fromMe ? 'MESSAGE_OUT' : 'MESSAGE_IN',
                                            level: 'info',
                                            provider: 'wa-business-api',
                                            details: { jid, text }
                                        }
                                    })
                                );
                            }
                        }
                    }
                }

                if (dbActions.length > 0) {
                    Promise.all(dbActions).catch(e => console.error('[WA] DB Save Error:', e));
                }
            });

            this.sock.ev.on('contacts.upsert', (contacts) => {
                this.contacts = [...this.contacts, ...contacts];
            });

            this.sock.ev.on('contacts.update', (updates) => {
                for (const update of updates) {
                    const index = this.contacts.findIndex(c => c.id === update.id);
                    if (index !== -1) {
                        this.contacts[index] = { ...this.contacts[index], ...update };
                    } else {
                        this.contacts.push(update);
                    }
                }
            });

            this.sock.ev.on('creds.update', saveCreds);

        } catch (err) {
            console.error('Failed to initialize WA socket', err);
            this.state = 'close';
        }
    }

    pushToHistory(id, jid, text, fromMe) {
        if (!this.messages.some(m => m.id === id)) {
            this.messages.push({
                id,
                jid,
                text,
                fromMe,
                timestamp: Date.now()
            });
            if (this.messages.length > 100) {
                this.messages.shift();
            }
        }
    }

    async sendMessage(jid, data) {
        if (!this.sock || this.state !== 'open') throw new Error('WhatsApp not connected');

        const getCleanText = (input) => {
            if (!input) return '';
            if (typeof input === 'string') return input;
            if (input.text !== undefined && input.text !== null) return String(input.text);
            return String(input);
        };

        const type = (data.type || '').toLowerCase();
        let result;
        let finalBody = '';

        try {
            if (data.image || type === 'image') {
                finalBody = getCleanText(data.caption || data.text || 'Image');
                result = await this.sock.sendMessage(jid, { image: data.image || { url: data.metadata?.mediaUrl }, caption: finalBody });
            } else if (data.video || type === 'video') {
                finalBody = getCleanText(data.caption || data.text || 'Video');
                result = await this.sock.sendMessage(jid, { video: data.video || { url: data.metadata?.mediaUrl }, caption: finalBody });
            } else if (data.audio || type === 'audio') {
                finalBody = 'Audio Message';
                result = await this.sock.sendMessage(jid, { audio: data.audio || { url: data.metadata?.mediaUrl }, mimetype: 'audio/mp4' });
            } else if (data.document || type === 'document') {
                finalBody = getCleanText(data.caption || data.text || 'Document');
                result = await this.sock.sendMessage(jid, { document: data.document || { url: data.metadata?.mediaUrl }, caption: finalBody, mimetype: 'application/pdf' });
            } else if (data.location || type === 'location') {
                const loc = data.location || {
                    degreesLatitude: parseFloat(data.metadata?.latitude),
                    degreesLongitude: parseFloat(data.metadata?.longitude),
                    name: data.metadata?.locationName
                };
                finalBody = `Location: ${loc.name || 'Shared Location'}`;
                result = await this.sock.sendMessage(jid, { location: loc });
            } else if (data.interactive || type === 'interactive' || data.carousel || type === 'carousel') {
                const interactiveData = data.interactive || data;
                finalBody = getCleanText(interactiveData.body || interactiveData.text || 'Interactive Message');
                const msgContent = interactiveData.interactiveMessage || interactiveData;

                // Ensure type is set (native_flow is common for recent baileys buttons/carousels)
                if (!msgContent.type && msgContent.nativeFlowMessage) {
                    msgContent.type = 'native_flow';
                }

                console.log(`[WA] Sending interactive message of type: ${msgContent.type || 'unknown'} to ${jid}`);
                result = await this.sock.sendMessage(jid, { interactiveMessage: msgContent });
            } else {
                finalBody = getCleanText(data.text || data.body || '');
                result = await this.sock.sendMessage(jid, { text: finalBody });
            }
        } catch (err) {
            console.error('[WA] Send Message Failed:', err);
            
            // Critical handle: If connection is actually dead or unauthorized, reset state
            const errorMessage = err?.message || '';
            const isConnectionError = errorMessage.includes('close') || 
                                    errorMessage.includes('Unauthorized') || 
                                    errorMessage.includes('Connection');

            if (isConnectionError) {
                console.warn('[WA] Critical connection error detected. Resetting socket state for reconnection.');
                this.state = 'welcome';
                this.sock = null;
                throw err; // Re-throw so campaign engine knows it failed
            }

            // For other errors, attempt a simple text fallback
            try {
                finalBody = getCleanText(data.text || data.body || 'Error sending content');
                result = await this.sock.sendMessage(jid, { text: finalBody });
            } catch (fallbackErr) {
                console.error('[WA] Fallback Send Failed:', fallbackErr);
                throw fallbackErr;
            }
        }

        if (result && this.userId) {
            const id = result.key?.id || Date.now().toString();
            const timestamp = Math.floor(Date.now() / 1000);
            this.pushToHistory(id, jid, finalBody, true);
            db.whatsAppMessage.create({
                data: {
                    waId: id,
                    userId: this.userId,
                    jid,
                    text: finalBody,
                    fromMe: true,
                    timestamp: BigInt(timestamp),
                    metadata: data.metadata || null
                }
            }).catch((e) => console.error('[WA] DB Save Error (Send):', e));
        }

        return result;
    }

    async checkNumber(phone) {
        if (!this.sock || this.state !== 'open') throw new Error('WhatsApp not connected');
        
        const cleanPhone = phone.replace(/[^\d]/g, '');
        const jid = `${cleanPhone}@s.whatsapp.net`;
        
        const results = await this.sock.onWhatsApp(jid);
        if (results && results[0] && results[0].exists) {
            const foundJid = results[0].jid;
            
            // 1. Try local cache first
            let contact = this.contacts.find(c => c.id === foundJid);
            let name = contact?.name || contact?.notify || contact?.verifiedName;

            // 2. Try fetching business profile if name is still missing
            if (!name) {
                try {
                    const biz = await this.sock.getBusinessProfile(foundJid);
                    if (biz) name = biz.description || null; // Often the desc or name is in biz
                } catch (e) {
                    // ignore biz fetch errors
                }
            }

            // 3. Last resort: check if socket has a cached name we haven't seen in contacts.upsert
            if (!name && this.sock.contacts && this.sock.contacts[foundJid]) {
                name = this.sock.contacts[foundJid].name || this.sock.contacts[foundJid].notify;
            }
            
            return {
                exists: true,
                jid: foundJid,
                name: name || null
            };
        }
        
        return { exists: false };
    }

    async disconnect() {
        if (this.sock) {
            try {
                if (this.state === 'open') {
                    await this.sock.logout('user initialized disconnect');
                }
            } catch (err) {
                console.error('Logout error', err);
            }
            this.sock = null;
        }
        this.state = 'welcome';
        this.qrString = null;
        this.messages = [];
        this.userId = null;
        this.connectedAt = null;
    }
}

const globalForWA = global;
const waManager = globalForWA.waManagerV2_Standard || new WhatsAppManager();

if (process.env.NODE_ENV !== 'production') {
    globalForWA.waManagerV2_Standard = waManager;
    // Development hack: if methods are missing on the cached global instance, attach them from the prototype
    const proto = WhatsAppManager.prototype;
    Object.getOwnPropertyNames(proto).forEach(name => {
        if (name !== 'constructor' && typeof proto[name] === 'function' && !waManager[name]) {
            console.log(`[WA Manager] Patching missing method: ${name}`);
            waManager[name] = proto[name].bind(waManager);
        }
    });
}

export { waManager };
