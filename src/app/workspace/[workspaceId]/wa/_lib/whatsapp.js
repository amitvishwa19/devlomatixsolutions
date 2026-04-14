import { makeWASocket, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import * as fs from 'fs';
import { usePrismaAuthState } from './whatsapp-auth';
import { db } from '@/lib/db';

class WhatsAppManager {
    constructor() {
        console.log('[WA] NEW WhatsAppManager Instance Created (V15) BINGO');
    }
    
    sock = null;
    state = 'welcome';
    qrString = null;
    messages = [];
    contacts = [];
    currentSessionId = null;
    userId = null;

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

    connect(sessionId = 'default') {
        console.log('wa manager connect for session:', sessionId)
        if (this.state === 'open' || this.state === 'connecting' || this.state === 'qr') return;
        this.currentSessionId = sessionId;
        this.init(sessionId);
    }

    async init(sessionId) {
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

            this.sock.ev.on('connection.update', (update) => {
                const { connection, lastDisconnect, qr } = update;
                console.log(`[WA] Connection Update: ${connection || 'no status'}, state: ${this.state}`);

                if (qr) {
                    this.state = 'qr';
                    this.qrString = qr;
                    console.log('[WA] New QR Code generated');
                }

                if (connection === 'close') {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                    console.log(`[WA] Connection Closed. Reason: ${statusCode}, Reconnecting: ${shouldReconnect} in 5s`);

                    if (shouldReconnect) {
                        setTimeout(() => this.init(sessionId), 5000);
                    } else {
                        console.log(`[WA] Session logged out. Clearing DB for ${sessionId}...`);
                        this.state = 'welcome';
                        this.sock = null;
                        this.qrString = null;
                        this.userId = null;

                        db.whatsAppAuth.deleteMany({
                            where: { sessionId }
                        }).catch((e) => console.error('[WA] DB clear error:', e));
                    }
                } else if (connection === 'open') {
                    console.log('[WA] Connection successfully opened!');
                    this.state = 'open';
                    this.qrString = null;
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

        try {
            const logEntry = `[${new Date().toISOString()}] Sending to ${jid}:\n${JSON.stringify(data, null, 2)}\n\n`;
            fs.appendFileSync('d:/Dev/React/devlomatix/devlomatixv2/wa_debug.log', logEntry);
        } catch (e) {
            console.error('[WA] Debug log write failed', e);
        }

        const getCleanText = (input) => {
            if (!input) return '';
            if (typeof input === 'string') return input;
            if (input.text) return input.text;
            return String(input);
        };

        let result;
        let finalBody = '';

        if (data.image) {
            finalBody = getCleanText(data.caption || data.text || 'Image');
            result = await this.sock.sendMessage(jid, { image: data.image, caption: finalBody });
        } else if (data.video) {
            finalBody = getCleanText(data.caption || data.text || 'Video');
            result = await this.sock.sendMessage(jid, { video: data.video, caption: finalBody });
        } else if (data.audio) {
            finalBody = 'Audio Message';
            result = await this.sock.sendMessage(jid, { audio: data.audio, mimetype: 'audio/mp4' });
        } else if (data.document) {
            finalBody = getCleanText(data.caption || data.text || 'Document');
            result = await this.sock.sendMessage(jid, { document: data.document, caption: finalBody, mimetype: 'application/pdf' });
        } else if (data.location) {
            finalBody = `Location: ${data.location.name || 'Shared Location'}`;
            result = await this.sock.sendMessage(jid, { location: data.location });
        } else if (data.interactive) {
            const isList = data.interactive.type === 'list' ||
                !!data.interactive.sections ||
                !!data.interactive.action?.sections ||
                !!data.interactive.buttonText;

            if (isList) {
                const bodyText = getCleanText(data.interactive.body?.text || data.interactive.text || data.text || data.interactive.body);
                const footerText = getCleanText(data.interactive.footer?.text || data.interactive.footer);
                const buttonText = data.interactive.action?.button || data.interactive.buttonText || 'Options';
                const sections = data.interactive.action?.sections || data.interactive.sections || [];

                const formattedSections = sections.map((section) => ({
                    title: section.title,
                    rows: (section.rows || []).map((row) => ({
                        title: row.title,
                        rowId: row.id || row.rowId || row.title.toLowerCase().replace(/\s+/g, '_'),
                        description: row.description
                    }))
                }));

                finalBody = bodyText;
                result = await this.sock.sendMessage(jid, {
                    text: bodyText,
                    footer: footerText,
                    title: data.interactive.header?.title || data.interactive.header || '',
                    buttonText: buttonText,
                    sections: formattedSections
                });
            } else {
                let simulatedText = '';
                if (data.interactive.header) {
                    const headerText = getCleanText(data.interactive.header);
                    if (headerText) simulatedText += `*${headerText}*\n\n`;
                }
                const bodyText = getCleanText(data.interactive.body);
                simulatedText += `${bodyText}\n\n`;

                const sections = data.interactive.sections || data.interactive.action?.sections || [];
                if (sections.length > 0) {
                    simulatedText += `_*Reply with the number of your choice:*_\n\n`;
                    let optionCounter = 1;
                    for (const section of sections) {
                        if (section.title) simulatedText += `*--- ${section.title} ---*\n`;
                        for (const row of section.rows || []) {
                            simulatedText += `*[ ${optionCounter} ]* ${row.title}\n`;
                            if (row.description) simulatedText += `      _${row.description}_\n`;
                            optionCounter++;
                        }
                        simulatedText += '\n';
                    }
                }
                const footerText = getCleanText(data.interactive.footer);
                if (footerText) simulatedText += `_${footerText}_`;

                finalBody = simulatedText.trim();
                result = await this.sock.sendMessage(jid, { text: finalBody });
            }
        }
        else {
            finalBody = getCleanText(data.text);
            result = await this.sock.sendMessage(jid, { text: finalBody });
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
    }
}

const globalForWA = global;
export const waManager = globalForWA.waManagerV15 || new WhatsAppManager();

if (process.env.NODE_ENV !== 'production') {
    globalForWA.waManagerV15 = waManager;
}
