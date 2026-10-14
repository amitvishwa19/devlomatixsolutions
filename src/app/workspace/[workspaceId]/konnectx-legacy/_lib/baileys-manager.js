import {
    makeWASocket,
    fetchLatestWaWebVersion,
    fetchLatestBaileysVersion,
    DisconnectReason,
    Browsers,
    proto,
    generateWAMessageFromContent,
    prepareWAMessageMedia
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import { db } from '@/lib/db';
import { usePrismaAuthState } from './prisma-auth-adapter';

/**
 * Robust helper to extract clean text and media info from various WhatsApp message wrappers
 */
function extractMessageContent(msg) {
    if (!msg || !msg.message) return null;
    let m = msg.message;

    // Unwrap ephemeral, viewOnce, or forwarded wrappers
    while (m.ephemeralMessage || m.viewOnceMessage || m.viewOnceMessageV2 || m.documentWithCaptionMessage) {
        m = (m.ephemeralMessage || m.viewOnceMessage || m.viewOnceMessageV2 || m.documentWithCaptionMessage)?.message || m;
    }

    let text = '';
    let mediaType = null;
    let mediaUrl = null;

    if (m.conversation) {
        text = m.conversation;
    } else if (m.extendedTextMessage?.text) {
        text = m.extendedTextMessage.text;
    } else if (m.imageMessage) {
        text = m.imageMessage.caption || '[Image]';
        mediaType = 'image';
        mediaUrl = m.imageMessage.url || null;
    } else if (m.videoMessage) {
        text = m.videoMessage.caption || '[Video]';
        mediaType = 'video';
    } else if (m.audioMessage) {
        text = '[Voice Note / Audio]';
        mediaType = 'audio';
    } else if (m.documentMessage) {
        text = m.documentMessage.fileName || m.documentMessage.title || '[Document]';
        mediaType = 'document';
    } else if (m.stickerMessage) {
        text = '[Sticker]';
        mediaType = 'sticker';
    } else if (m.contactMessage || m.contactsArrayMessage) {
        text = '[Contact Card]';
    } else if (m.locationMessage) {
        text = '[Location Pin]';
    } else if (m.buttonsResponseMessage?.selectedDisplayText) {
        text = m.buttonsResponseMessage.selectedDisplayText;
    } else if (m.listResponseMessage?.title) {
        text = m.listResponseMessage.title;
    } else if (m.templateButtonReplyMessage?.selectedDisplayText) {
        text = m.templateButtonReplyMessage.selectedDisplayText;
    } else if (m.protocolMessage) {
        return null; // ignore protocol messages (revokes, sync keys)
    } else {
        text = '[WhatsApp Message]';
    }

    return { text, mediaType, mediaUrl };
}

class KonnectLegacyManager {
    constructor() {
        this.sessions = new Map();
        console.log('[KONNECT-LEGACY] Baileys Manager initialized.');
    }

    /**
     * Get or create a session status object
     */
    getSessionState(sessionId) {
        if (!this.sessions.has(sessionId)) {
            this.sessions.set(sessionId, {
                sock: null,
                status: 'DISCONNECTED', // DISCONNECTED | CONNECTING | SCAN_QR | CONNECTED | LOGOUT
                qrCode: null,           // Base64 Data URL
                qrString: null,
                phoneNumber: null,
                deviceName: null,
                platform: null,
                connectedAt: null,
                listeners: new Set(),
                lastError: null
            });
        }
        return this.sessions.get(sessionId);
    }

    /**
     * Ensure socket is active if credentials exist in DB
     */
    async ensureActiveSocket(sessionId) {
        const state = this.getSessionState(sessionId);
        if (state.sock && state.status === 'CONNECTED') {
            return state;
        }

        try {
            const dbAuth = await db.whatsAppAuth.findUnique({
                where: { sessionId },
                select: { id: true, status: true, phoneNumber: true }
            });

            if (dbAuth && dbAuth.status !== 'LOGOUT') {
                const keysCount = await db.whatsAppSessionKey.count({
                    where: { whatsappAuthId: dbAuth.id }
                });

                if (keysCount > 0) {
                    if (state.status !== 'CONNECTING' && (!state.sock || state.status !== 'CONNECTED')) {
                        console.log(`[KONNECT-LEGACY] Reconnecting socket for ${sessionId} (${keysCount} stored keys)...`);
                        await this.connect(sessionId);
                    }

                    // If connecting, wait briefly up to 4s for open state
                    if (state.status === 'CONNECTING') {
                        let attempts = 0;
                        while (state.status === 'CONNECTING' && attempts < 8) {
                            await new Promise(r => setTimeout(r, 500));
                            attempts++;
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('[KONNECT-LEGACY] ensureActiveSocket error:', e.message);
        }

        return state;
    }

    /**
     * Get live status of session
     */
    async getStatus(sessionId) {
        await this.ensureActiveSocket(sessionId);
        const memState = this.getSessionState(sessionId);
        try {
            const dbAuth = await db.whatsAppAuth.findUnique({
                where: { sessionId },
                select: {
                    status: true,
                    phoneNumber: true,
                    deviceName: true,
                    platform: true,
                    qrCode: true,
                    connectedAt: true
                }
            });
            const status = memState.sock ? memState.status : (dbAuth?.status || 'DISCONNECTED');
            return {
                status,
                phoneNumber: memState.phoneNumber || dbAuth?.phoneNumber || null,
                deviceName: memState.deviceName || dbAuth?.deviceName || null,
                qrCode: memState.qrCode || dbAuth?.qrCode || null,
                connectedAt: memState.connectedAt || dbAuth?.connectedAt || null
            };
        } catch (e) {
            return {
                status: memState.status || 'DISCONNECTED',
                phoneNumber: memState.phoneNumber || null,
                deviceName: memState.deviceName || null,
                qrCode: memState.qrCode || null
            };
        }
    }

    /**
     * Add listener for state changes
     */
    subscribe(sessionId, callback) {
        const state = this.getSessionState(sessionId);
        state.listeners.add(callback);
        return () => state.listeners.delete(callback);
    }

    /**
     * Broadcast updates to registered listeners and update DB
     */
    async notifyStateChange(sessionId, partialState) {
        const state = this.getSessionState(sessionId);
        Object.assign(state, partialState);

        // Map status to valid Prisma WA_STATUS enum
        let dbStatus = state.status;
        if (dbStatus === 'SCAN_QR') dbStatus = 'QR_REQUIRED';
        if (dbStatus === 'LOGOUT') dbStatus = 'LOGGED_OUT';
        const validStatuses = ['DISCONNECTED', 'CONNECTING', 'QR_REQUIRED', 'AUTHENTICATED', 'CONNECTED', 'LOGGED_OUT', 'ERROR'];
        if (!validStatuses.includes(dbStatus)) {
            dbStatus = 'DISCONNECTED';
        }

        // Update database record
        try {
            const dbData = {
                status: dbStatus,
                qrCode: state.qrCode,
                phoneNumber: state.phoneNumber,
                deviceName: state.deviceName,
                platform: state.platform,
                updatedAt: new Date()
            };

            if (dbStatus === 'CONNECTED') {
                dbData.connectedAt = state.connectedAt || new Date();
                dbData.lastConnectedAt = new Date();
            } else if (dbStatus === 'DISCONNECTED' || dbStatus === 'LOGGED_OUT') {
                dbData.disconnectedAt = new Date();
            }

            await db.whatsAppAuth.upsert({
                where: { sessionId },
                update: dbData,
                create: {
                    sessionId,
                    ...dbData,
                    isActive: true
                }
            });
        } catch (dbErr) {
            console.error(`[KONNECT-LEGACY] DB status sync error for ${sessionId}:`, dbErr.message);
        }

        for (const cb of state.listeners) {
            try {
                cb(state);
            } catch (err) {
                console.error(`[KONNECT-LEGACY] Listener error for ${sessionId}:`, err);
            }
        }
    }

    /**
     * Helper to save incoming or synced message to isolated table
     */
    async saveIncomingMessage(sessionId, msg) {
        try {
            if (!msg || !msg.message || !msg.key) return;
            const jid = msg.key.remoteJid;
            if (!jid || jid === 'status@broadcast') return;

            const content = extractMessageContent(msg);
            if (!content || !content.text) return;

            const fromMe = Boolean(msg.key.fromMe);
            const id = msg.key.id;
            const timestamp = msg.messageTimestamp || Math.floor(Date.now() / 1000);
            const cleanPhone = jid.replace('@s.whatsapp.net', '').replace('@g.us', '').replace('@lid', '').replace('@c.us', '');

            const authRecord = await db.whatsAppAuth.findUnique({
                where: { sessionId },
                select: { userId: true }
            });
            const userId = authRecord?.userId || sessionId;

            await db.konnectLegacyMessage.upsert({
                where: { waId: id },
                update: {
                    text: content.text,
                    status: fromMe ? 'SENT' : 'DELIVERED',
                    pushName: msg.pushName || null,
                    mediaUrl: content.mediaUrl || undefined,
                    mediaType: content.mediaType || undefined
                },
                create: {
                    workspaceId: sessionId,
                    userId,
                    waId: id,
                    jid,
                    phoneNumber: cleanPhone,
                    pushName: msg.pushName || null,
                    text: content.text,
                    fromMe,
                    timestamp: BigInt(timestamp),
                    status: fromMe ? 'SENT' : 'DELIVERED',
                    mediaUrl: content.mediaUrl || null,
                    mediaType: content.mediaType || null,
                    metadata: { pushName: msg.pushName || null }
                }
            }).catch(() => {});

            // Auto-update contact in isolated table
            if (cleanPhone && !jid.includes('@g.us')) {
                await db.konnectLegacyContact.upsert({
                    where: {
                        workspaceId_phone: {
                            workspaceId: sessionId,
                            phone: cleanPhone
                        }
                    },
                    update: {
                        lastMessage: content.text,
                        lastInteraction: new Date(Number(timestamp) * 1000),
                        ...(msg.pushName ? { whatsappName: msg.pushName } : {})
                    },
                    create: {
                        workspaceId: sessionId,
                        userId,
                        name: msg.pushName || `+${cleanPhone}`,
                        phone: cleanPhone,
                        whatsappName: msg.pushName || null,
                        lastMessage: content.text,
                        lastInteraction: new Date(Number(timestamp) * 1000),
                        tags: ['Linked Device']
                    }
                }).catch(() => {});
            }
        } catch (err) {
            console.warn('[KONNECT-LEGACY] Save message err:', err.message);
        }
    }

    /**
     * Helper to save contact from sync
     */
    async saveContactFromSync(sessionId, c) {
        try {
            if (!c || !c.id || c.id === 'status@broadcast') return;
            const cleanPhone = c.id.replace('@s.whatsapp.net', '').replace('@c.us', '').replace('@lid', '');
            if (!cleanPhone || cleanPhone.length < 6 || c.id.includes('@g.us')) return;

            const authRecord = await db.whatsAppAuth.findUnique({
                where: { sessionId },
                select: { userId: true }
            });
            const userId = authRecord?.userId || sessionId;
            const displayName = c.name || c.notify || c.verifiedName || `+${cleanPhone}`;

            await db.konnectLegacyContact.upsert({
                where: {
                    workspaceId_phone: {
                        workspaceId: sessionId,
                        phone: cleanPhone
                    }
                },
                update: {
                    name: displayName,
                    whatsappName: c.notify || undefined,
                    isSyncedFromPhone: true
                },
                create: {
                    workspaceId: sessionId,
                    userId,
                    name: displayName,
                    phone: cleanPhone,
                    whatsappName: c.notify || null,
                    isSyncedFromPhone: true,
                    tags: ['Phone Contact']
                }
            }).catch(() => {});
        } catch (_) {}
    }

    /**
     * Connect or Reconnect a Baileys WhatsApp Session
     */
    async connect(sessionId, { forceNewQr = false } = {}) {
        const state = this.getSessionState(sessionId);

        // If already connected and socket is open, return current state unless forcing fresh QR
        if (!forceNewQr && state.sock && state.status === 'CONNECTED') {
            return {
                status: 'CONNECTED',
                phoneNumber: state.phoneNumber,
                deviceName: state.deviceName,
                qrCode: null
            };
        }

        // If currently waiting for scan and not forcing fresh QR, return existing QR
        if (!forceNewQr && (state.status === 'QR_REQUIRED' || state.status === 'SCAN_QR') && state.qrCode) {
            return {
                status: 'QR_REQUIRED',
                qrCode: state.qrCode,
                phoneNumber: null
            };
        }

        // If forcing fresh QR, cleanly wipe old session socket and auth keys
        if (forceNewQr) {
            if (state.sock) {
                try { state.sock.end(undefined); } catch (_) {}
                state.sock = null;
            }
            state.qrCode = null;
            state.qrString = null;
            state.phoneNumber = null;
            state.status = 'CONNECTING';

            try {
                const dbAuth = await db.whatsAppAuth.findUnique({
                    where: { sessionId },
                    select: { id: true }
                });
                if (dbAuth) {
                    await db.whatsAppSessionKey.deleteMany({
                        where: { whatsappAuthId: dbAuth.id }
                    }).catch(() => null);
                    await db.whatsAppAuth.update({
                        where: { id: dbAuth.id },
                        data: {
                            credentials: null,
                            qrCode: null,
                            phoneNumber: null,
                            status: 'CONNECTING',
                            disconnectedAt: new Date()
                        }
                    }).catch(() => null);
                }
            } catch (wipeErr) {
                console.warn('[KONNECT-LEGACY] Clean auth wipe warn:', wipeErr.message);
            }
        }

        await this.notifyStateChange(sessionId, {
            status: 'CONNECTING',
            qrCode: null,
            lastError: null
        });

        try {
            const { state: authState, saveCreds, whatsappAuthId } = await usePrismaAuthState(sessionId);
            let baileysVersion = [2, 3000, 1050326552];
            try {
                const waWebVer = await fetchLatestWaWebVersion();
                if (waWebVer?.version) {
                    baileysVersion = waWebVer.version;
                }
            } catch (_) {
                try {
                    const verInfo = await fetchLatestBaileysVersion();
                    if (verInfo?.version) baileysVersion = verInfo.version;
                } catch (_) {}
            }

            const sock = makeWASocket({
                version: baileysVersion,
                auth: authState,
                printQRInTerminal: false,
                logger: pino({ level: 'silent' }),
                browser: Browsers.ubuntu('Chrome'),
                syncFullHistory: true,
                shouldSyncHistoryMessage: () => true,
                generateHighQualityLinkPreview: true,
                defaultQueryTimeoutMs: 60000,
                getMessage: async (key) => {
                    if (key?.id) {
                        const m = await db.konnectLegacyMessage.findUnique({
                            where: { waId: key.id },
                            select: { text: true }
                        });
                        if (m?.text) {
                            return proto.Message.fromObject({ conversation: m.text });
                        }
                    }
                    return undefined;
                }
            });

            state.sock = sock;

            // Handle Credentials Save
            sock.ev.on('creds.update', saveCreds);

            // Handle Connection Updates (QR & Connected)
            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    try {
                        const qrDataUrl = await QRCode.toDataURL(qr, {
                            width: 280,
                            margin: 2,
                            color: {
                                dark: '#0F172A',
                                light: '#FFFFFF'
                            }
                        });

                        await this.notifyStateChange(sessionId, {
                            status: 'QR_REQUIRED',
                            qrCode: qrDataUrl,
                            qrString: qr
                        });
                        console.log(`[KONNECT-LEGACY] Generated fresh QR code for session: ${sessionId}`);
                    } catch (qrErr) {
                        console.error(`[KONNECT-LEGACY] QR generation error:`, qrErr);
                    }
                }

                if (connection === 'open') {
                    const rawJid = sock.user?.id || '';
                    const cleanPhone = rawJid.split(':')[0].split('@')[0];
                    const deviceName = sock.user?.name || 'Linked Mobile';

                    await this.notifyStateChange(sessionId, {
                        status: 'CONNECTED',
                        qrCode: null,
                        qrString: null,
                        phoneNumber: cleanPhone,
                        deviceName,
                        platform: 'WhatsApp Multi-Device',
                        connectedAt: new Date(),
                        lastError: null
                    });

                    console.log(`[KONNECT-LEGACY] WhatsApp connected for session ${sessionId} (Phone: ${cleanPhone})`);

                    await db.whatsAppConnectionLog.create({
                        data: {
                            whatsappAuthId,
                            event: 'CONNECTED',
                            newStatus: 'CONNECTED',
                            metadata: {
                                jid: rawJid,
                                phone: cleanPhone,
                                name: deviceName
                            }
                        }
                    }).catch(() => null);
                }

                if (connection === 'close') {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut && statusCode !== 401;

                    console.warn(`[KONNECT-LEGACY] Connection closed for ${sessionId}. Code: ${statusCode}, Reconnect: ${shouldReconnect}`);

                    if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                        await this.notifyStateChange(sessionId, {
                            status: 'LOGGED_OUT',
                            sock: null,
                            qrCode: null,
                            phoneNumber: null
                        });
                    } else if (shouldReconnect) {
                        await this.notifyStateChange(sessionId, {
                            status: 'CONNECTING',
                            sock: null
                        });
                        setTimeout(() => this.connect(sessionId), 3000);
                    } else {
                        await this.notifyStateChange(sessionId, {
                            status: 'DISCONNECTED',
                            sock: null
                        });
                    }
                }
            });

            // Handle Initial History Sync from Connected Phone
            sock.ev.on('messaging-history.set', async ({ chats, contacts, messages }) => {
                console.log(`[KONNECT-LEGACY] History sync: ${messages?.length || 0} messages, ${contacts?.length || 0} contacts, ${chats?.length || 0} chats`);
                if (Array.isArray(contacts)) {
                    for (const c of contacts) {
                        await this.saveContactFromSync(sessionId, c);
                    }
                }
                if (Array.isArray(chats)) {
                    for (const ch of chats) {
                        if (ch?.id) {
                            await this.saveContactFromSync(sessionId, { id: ch.id, name: ch.name });
                        }
                    }
                }
                if (Array.isArray(messages)) {
                    for (const msg of messages) {
                        await this.saveIncomingMessage(sessionId, msg);
                    }
                }
            });

            // Handle Real-time Incoming & Synced Messages
            sock.ev.on('messages.upsert', async ({ messages, type }) => {
                console.log(`[KONNECT-LEGACY] messages.upsert: ${messages?.length || 0} msgs (type: ${type})`);
                if (Array.isArray(messages)) {
                    for (const msg of messages) {
                        await this.saveIncomingMessage(sessionId, msg);
                    }
                }
            });

            // Handle Real-time Contacts & Chats
            sock.ev.on('contacts.upsert', async (contacts) => {
                if (Array.isArray(contacts)) {
                    for (const c of contacts) {
                        await this.saveContactFromSync(sessionId, c);
                    }
                }
            });

            sock.ev.on('chats.upsert', async (chats) => {
                if (Array.isArray(chats)) {
                    for (const ch of chats) {
                        if (ch?.id) {
                            await this.saveContactFromSync(sessionId, { id: ch.id, name: ch.name });
                        }
                    }
                }
            });

            // Wait up to 5 seconds for QR code or connected status to be generated by WhatsApp
            let waitAttempts = 0;
            while (waitAttempts < 10 && state.status === 'CONNECTING' && !state.qrCode) {
                await new Promise(r => setTimeout(r, 500));
                waitAttempts++;
            }

            return {
                status: state.status,
                qrCode: state.qrCode,
                phoneNumber: state.phoneNumber
            };

        } catch (error) {
            console.error(`[KONNECT-LEGACY] Failed to initialize socket for session ${sessionId}:`, error);
            await this.notifyStateChange(sessionId, {
                status: 'DISCONNECTED',
                lastError: error.message
            });
            throw error;
        }
    }

    /**
     * Disconnect an active session
     */
    async disconnect(sessionId, forceLogout = false) {
        const state = this.getSessionState(sessionId);
        if (state.sock) {
            try {
                if (forceLogout) {
                    await state.sock.logout('User manual logout');
                } else {
                    state.sock.end(new Error('User manual disconnect'));
                }
            } catch (err) {
                console.warn(`[KONNECT-LEGACY] Disconnect socket warn:`, err.message);
            }
            state.sock = null;
        }

        await this.notifyStateChange(sessionId, {
            status: forceLogout ? 'LOGGED_OUT' : 'DISCONNECTED',
            qrCode: null,
            qrString: null,
            phoneNumber: forceLogout ? null : state.phoneNumber
        });

        return { success: true };
    }

    /**
     * Send Outbound Message (Text or Media)
     */
    async sendMessage(sessionId, toJid, content) {
        await this.ensureActiveSocket(sessionId);
        const state = this.getSessionState(sessionId);
        if (!state.sock || state.status !== 'CONNECTED') {
            throw new Error(`WhatsApp not connected for session ${sessionId}. Please scan QR code.`);
        }

        // Format clean JID
        let targetJid = toJid.replace(/[^\d]/g, '');
        if (targetJid.length === 10) {
            targetJid = '91' + targetJid;
        }
        if (!targetJid.includes('@s.whatsapp.net') && !targetJid.includes('@g.us')) {
            targetJid = `${targetJid}@s.whatsapp.net`;
        }

        let messagePayload;
        if (typeof content === 'string') {
            messagePayload = { text: content };
        } else if (content.text) {
            messagePayload = { text: content.text };
        } else if (content.image) {
            messagePayload = { image: content.image, caption: content.caption || '' };
        } else if (content.document) {
            messagePayload = { document: content.document, fileName: content.fileName || 'file.pdf', mimetype: 'application/pdf' };
        } else {
            messagePayload = content;
        }

        const sent = await state.sock.sendMessage(targetJid, messagePayload);

        // Record in isolated KonnectLegacyMessage table
        try {
            const authRecord = await db.whatsAppAuth.findUnique({
                where: { sessionId },
                select: { userId: true }
            });
            const userId = authRecord?.userId || sessionId;
            const cleanPhone = targetJid.replace('@s.whatsapp.net', '').replace('@g.us', '');

            await db.konnectLegacyMessage.upsert({
                where: { waId: sent.key?.id || `out_${Date.now()}` },
                update: {
                    text: messagePayload.text || '[Media Message]',
                    status: 'SENT'
                },
                create: {
                    workspaceId: sessionId,
                    userId,
                    waId: sent.key?.id || `out_${Date.now()}`,
                    jid: targetJid,
                    phoneNumber: cleanPhone,
                    text: messagePayload.text || '[Media Message]',
                    fromMe: true,
                    timestamp: BigInt(Math.floor(Date.now() / 1000)),
                    status: 'SENT'
                }
            }).catch(e => console.warn('[KONNECT-LEGACY] Upsert sent msg warn:', e.message));

            // Update contact last message
            if (cleanPhone && !targetJid.includes('@g.us')) {
                await db.konnectLegacyContact.upsert({
                    where: {
                        workspaceId_phone: {
                            workspaceId: sessionId,
                            phone: cleanPhone
                        }
                    },
                    update: {
                        lastMessage: messagePayload.text || '[Media Message]',
                        lastInteraction: new Date()
                    },
                    create: {
                        workspaceId: sessionId,
                        userId,
                        name: `+${cleanPhone}`,
                        phone: cleanPhone,
                        lastMessage: messagePayload.text || '[Media Message]',
                        lastInteraction: new Date(),
                        tags: ['Linked Device']
                    }
                }).catch(() => {});
            }
        } catch (dbErr) {
            console.warn('[KONNECT-LEGACY] Failed to record sent message in DB:', dbErr.message);
        }

        return sent;
    }
}

// Preserve Singleton across Next.js Hot Reloads while ensuring prototype is always up to date
const globalForKonnect = globalThis;

let managerInstance = globalForKonnect.konnectLegacyManager;

if (!managerInstance || typeof managerInstance.ensureActiveSocket !== 'function') {
    const previousSessions = managerInstance?.sessions;
    managerInstance = new KonnectLegacyManager();
    if (previousSessions) {
        managerInstance.sessions = previousSessions;
    }
} else {
    // Rebind prototype so new/edited methods are immediately inherited by the singleton
    Object.setPrototypeOf(managerInstance, KonnectLegacyManager.prototype);
}

export const konnectLegacyManager = managerInstance;

if (process.env.NODE_ENV !== 'production') {
    globalForKonnect.konnectLegacyManager = konnectLegacyManager;
}
