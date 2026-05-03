import { makeWASocket, DisconnectReason, Browsers, fetchLatestBaileysVersion, generateWAMessageFromContent, prepareWAMessageMedia, proto } from '@whiskeysockets/baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import * as fs from 'fs';
import { usePrismaAuthState } from './whatsapp-auth';
import { db } from './db';

export interface WAMessageHistory {
    id: string;
    jid: string;
    text: string;
    fromMe: boolean;
    timestamp: number;
}

class WhatsAppManager {
    constructor() {
    }
    private sock: ReturnType<typeof makeWASocket> | null = null;
    private state: 'welcome' | 'connecting' | 'qr' | 'open' | 'close' = 'welcome';
    private qrString: string | null = null;
    private messages: WAMessageHistory[] = [];
    private contacts: any[] = [];
    private currentSessionId: string | null = null;
    private userId: string | null = null;

    getState() {
        return this.state;
    }

    getQrCodeString() {
        return this.qrString;
    }

    getMessages() {
        return this.messages;
    }

    getContacts() {
        return this.contacts;
    }

    getUser() {
        return this.sock?.user || null;
    }

    connect(sessionId: string = 'default') {
        console.log('wa manager connect for session:', sessionId)
        if (this.state === 'open' || this.state === 'connecting' || this.state === 'qr') return;
        this.currentSessionId = sessionId;
        this.init(sessionId);
    }

    private async init(sessionId: string) {
        this.state = 'connecting';
        this.qrString = null;
        this.currentSessionId = sessionId;

        console.log('wa manager init for session:', sessionId)

        try {
            const { state, saveCreds } = await usePrismaAuthState(sessionId);
            const { version } = await fetchLatestBaileysVersion();

            // Fetch userId associated with this session
            const authRecord = await db.whatsAppAuth.findUnique({
                where: { sessionId }
            });
            this.userId = authRecord?.userId || null;
            console.log(`[WA] Session ${sessionId} linked to User: ${this.userId}`);

            this.sock = makeWASocket({
                version,
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: 'silent' }),
                browser: ['Devlomatix', 'Chrome', '118.0.5993.88'],
                syncFullHistory: false
            });

            this.sock.ev.on('connection.update', (update: any) => {
                const { connection, lastDisconnect, qr } = update;
                console.log(`[WA] Connection Update: ${connection || 'no status'}, state: ${this.state}`);

                if (qr) {
                    this.state = 'qr';
                    this.qrString = qr;
                    console.log('[WA] New QR Code generated');
                }

                if (connection === 'close') {
                    const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                    console.log(`[WA] Connection Closed. Reason: ${statusCode}, Reconnecting: ${shouldReconnect} in 5s`);
                    
                    if (shouldReconnect) {
                        // Add a delay to prevent infinite immediate reconnect loops
                        setTimeout(() => this.init(sessionId), 5000);
                    } else {
                        console.log(`[WA] Session logged out. Clearing DB for ${sessionId}...`);
                        this.state = 'welcome';
                        this.sock = null;
                        this.qrString = null;
                        this.userId = null;
                        
                        db.whatsAppAuth.deleteMany({
                            where: { sessionId }
                        }).catch((e: any) => console.error('[WA] DB clear error:', e));
                    }
                } else if (connection === 'open') {
                    console.log('[WA] Connection successfully opened!');
                    this.state = 'open';
                    this.qrString = null;
                }
            });

            this.sock.ev.on('messages.upsert', async (m: any) => {
                const msgs = m.messages;
                if (!msgs || msgs.length === 0) return;

                const dbActions: any[] = [];

                for (const msg of msgs) {
                    if (!msg.message) continue;

                    const jid = msg.key.remoteJid || '';
                    const fromMe = msg.key.fromMe || false;
                    const id = msg.key.id || '';
                    const timestamp = msg.messageTimestamp ? (typeof msg.messageTimestamp === 'number' ? msg.messageTimestamp : (msg.messageTimestamp as any).low) : Math.floor(Date.now() / 1000);

                    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

                    if (text && jid) {
                        this.pushToHistory(id, jid, text, fromMe);

                        // Save to Database
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
                        }
                    }
                }

                if (dbActions.length > 0) {
                    Promise.all(dbActions).catch(e => console.error('[WA] DB Save Error:', e));
                }
            });

            this.sock.ev.on('contacts.upsert', (contacts: any[]) => {
                this.contacts = [...this.contacts, ...contacts];
            });

            this.sock.ev.on('contacts.update', (updates: any[]) => {
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

    private pushToHistory(id: string, jid: string, text: string, fromMe: boolean) {
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

    async sendMessage(jid: string, data: any) {
        if (!this.sock || this.state !== 'open') throw new Error('WhatsApp not connected');

        // File-based debug logging
        try {
            const logEntry = `[${new Date().toISOString()}] Sending to ${jid}:\n${JSON.stringify(data, null, 2)}\n\n`;
            fs.appendFileSync('d:/Dev/React/devlomatix/devlomatixv2/wa_debug.log', logEntry);
        } catch (e) {
            console.error('[WA] Debug log write failed', e);
        }

        const getCleanText = (input: any) => {
            if (!input) return '';
            if (typeof input === 'string') return input;
            if (input.text !== undefined && input.text !== null) return String(input.text);
            return String(input);
        };

        const type = (data.type || '').toLowerCase();
        let result: any;
        let finalBody = '';

        try {
            // 1. Media Types
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
            } 
            // 2. Location
            else if (data.location || type === 'location') {
                const loc = data.location || {
                    degreesLatitude: parseFloat(data.metadata?.latitude),
                    degreesLongitude: parseFloat(data.metadata?.longitude),
                    name: data.metadata?.locationName
                };
                finalBody = `Location: ${loc.name || 'Shared Location'}`;
                result = await this.sock.sendMessage(jid, { location: loc });
            }
            // 3. Interactive / Carousel Types
            else if (data.interactive || type === 'interactive' || data.carousel || type === 'carousel') {
                const interactiveData = data.interactive || data;
                finalBody = getCleanText(interactiveData.body || interactiveData.text || 'Interactive Message');
                
                // If it's a raw interactive message payload from the frontend
                const msgContent = interactiveData.interactiveMessage || interactiveData;

                if (msgContent.carouselMessage?.cards) {
                    try {
                        for (const card of msgContent.carouselMessage.cards) {
                            if (card.header?.imageMessage?.url && !card.header.imageMessage.mimetype) {
                                // Prepare media if it's a raw URL
                                const media = await prepareWAMessageMedia(
                                    { image: { url: card.header.imageMessage.url } },
                                    { upload: (this.sock as any).waUploadToServer }
                                );
                                card.header.imageMessage = media.imageMessage;
                            }
                        }
                    } catch (mediaErr) {
                        console.error('[WA] Carousel Media Prep Failed:', mediaErr);
                    }
                }

                if (interactiveData.type === 'carousel' || data.carousel || msgContent.carouselMessage) {
                    result = await this.sock.sendMessage(jid, { 
                        interactiveMessage: msgContent 
                    } as any);
                } else {
                    result = await this.sock.sendMessage(jid, { 
                        interactiveMessage: msgContent 
                    } as any);
                }
            }
            // 4. Default Text
            else {
                finalBody = getCleanText(data.text || data.body || '');
                result = await this.sock.sendMessage(jid, { text: finalBody });
            }
        } catch (err) {
            console.error('[WA] Send Message Failed:', err);
            // Fallback to simple text if anything fails
            finalBody = getCleanText(data.text || data.body || 'Error sending content');
            result = await this.sock.sendMessage(jid, { text: finalBody });
        }

        if (result && this.userId) {
            const id = result.key?.id || Date.now().toString();
            const timestamp = Math.floor(Date.now() / 1000);
            
            this.pushToHistory(id, jid, finalBody, true);

            // Save to Database
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
            }).catch((e: Error) => console.error('[WA] DB Save Error (Send):', e));
        }

        return result;
    }

    async disconnect() {
        if (this.sock) {
            try {
                // If it's open, log out to invalidate session
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
    }
}

// Global scope to prevent re-instantiation in Next.js HMR (dev environment)
const globalForWA = global as unknown as { 
    waManagerV14: any; 
    waManagerV15: WhatsAppManager 
};

// Cleanup legacy managers if they exist
const gwa = globalForWA as any;
if (gwa.waManagerV12 || gwa.waManagerV13 || gwa.waManagerV14) {
    console.log('[WA] Detected legacy waManager instances. Shutting down...');
    try {
        if (gwa.waManagerV12) gwa.waManagerV12.disconnect?.();
        if (gwa.waManagerV13) gwa.waManagerV13.disconnect?.();
        if (gwa.waManagerV14) gwa.waManagerV14.disconnect?.();
    } catch (e) {}
    delete gwa.waManagerV12;
    delete gwa.waManagerV13;
    delete gwa.waManagerV14;
}

export const waManager = globalForWA.waManagerV15 || new WhatsAppManager();

if (process.env.NODE_ENV !== 'production') {
    globalForWA.waManagerV15 = waManager;
}
