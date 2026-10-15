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
import { emitKonnectxEvent } from '@/lib/socket-bridge';

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
    } else if (m.interactiveResponseMessage) {
        const resp = m.interactiveResponseMessage;
        if (resp.body?.text) {
            text = resp.body.text;
        } else if (resp.nativeFlowResponseMessage?.paramsJson) {
            try {
                const parsed = JSON.parse(resp.nativeFlowResponseMessage.paramsJson);
                text = parsed.display_text || parsed.title || parsed.id || '[Button Clicked]';
            } catch (_) {
                text = '[Button Clicked]';
            }
        } else {
            text = '[Button Clicked]';
        }
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

            if (dbAuth && dbAuth.status !== 'LOGGED_OUT' && dbAuth.status !== 'LOGOUT') {
                const keysCount = await db.whatsAppSessionKey.count({
                    where: { whatsappAuthId: dbAuth.id }
                });

                if (keysCount > 0 && dbAuth.status === 'CONNECTED') {
                    if (state.status !== 'CONNECTING' && (!state.sock || state.status !== 'CONNECTED')) {
                        console.log(`[KONNECT-LEGACY] Background reconnecting socket for ${sessionId} (${keysCount} stored keys)...`);
                        this.connect(sessionId).catch(err => {
                            console.warn(`[KONNECT-LEGACY] ensureActiveSocket background connect warn:`, err.message);
                        });
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

        // Real-time broadcast to socket server room workspace:{sessionId}
        emitKonnectxEvent(sessionId, 'konnectx:status:update', {
            workspaceId: sessionId,
            status: state.status,
            qrCode: state.qrCode,
            phoneNumber: state.phoneNumber,
            deviceName: state.deviceName,
            connectedAt: state.connectedAt
        });
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

            // Real-time broadcast to socket server room workspace:{sessionId}
            emitKonnectxEvent(sessionId, 'konnectx:message:new', {
                workspaceId: sessionId,
                jid,
                message: {
                    id,
                    waId: id,
                    jid,
                    phoneNumber: cleanPhone,
                    pushName: msg.pushName || null,
                    text: content.text,
                    fromMe,
                    status: fromMe ? 'SENT' : 'DELIVERED',
                    timestamp: Number(timestamp) * 1000,
                    mediaUrl: content.mediaUrl || null,
                    mediaType: content.mediaType || null
                }
            });
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

            // Handle Message Status Receipts (Sent, Delivered, Read ticks)
            sock.ev.on('messages.update', async (updates) => {
                if (!Array.isArray(updates)) return;
                for (const update of updates) {
                    const waId = update.key?.id;
                    const jid = update.key?.remoteJid;
                    const rawStatus = update.update?.status;
                    if (!waId || rawStatus === undefined) continue;

                    let statusStr = 'SENT';
                    if (rawStatus >= 4) {
                        statusStr = 'READ';
                    } else if (rawStatus === 3) {
                        statusStr = 'DELIVERED';
                    }

                    // Update DB record
                    await db.konnectLegacyMessage.updateMany({
                        where: { waId },
                        data: { status: statusStr }
                    }).catch(() => null);

                    // Real-time broadcast to socket server room workspace:{sessionId}
                    emitKonnectxEvent(sessionId, 'konnectx:message:status', {
                        workspaceId: sessionId,
                        jid,
                        messageId: waId,
                        status: statusStr
                    });
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
        const cleanPhone = targetJid.replace('@s.whatsapp.net', '').replace('@g.us', '');

        let sent;
        let loggedText = typeof content === 'string' ? content : (content.text || content.body || '[Media Message]');

        if (content && typeof content === 'object' && Array.isArray(content.buttons) && content.buttons.length > 0) {
            try {
                // Map buttons to nativeFlow interactive buttons
                const nativeButtons = content.buttons.map((btn, idx) => {
                    const btnType = (btn.type || 'QUICK_REPLY').toUpperCase();
                    if (btnType === 'URL') {
                        return {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: btn.text || 'Visit Website',
                                url: btn.value || 'https://devlomatix.com',
                                merchant_url: btn.value || 'https://devlomatix.com'
                            })
                        };
                    } else if (btnType === 'PHONE_NUMBER' || btnType === 'CALL') {
                        return {
                            name: 'cta_call',
                            buttonParamsJson: JSON.stringify({
                                display_text: btn.text || 'Call Now',
                                phone_number: btn.value || ''
                            })
                        };
                    } else if (btnType === 'COPY_CODE') {
                        return {
                            name: 'cta_copy',
                            buttonParamsJson: JSON.stringify({
                                display_text: btn.text || 'Copy Code',
                                copy_code: btn.value || ''
                            })
                        };
                    } else {
                        return {
                            name: 'quick_reply',
                            buttonParamsJson: JSON.stringify({
                                display_text: btn.text || `Option ${idx + 1}`,
                                id: btn.value || `btn_${idx + 1}`
                            })
                        };
                    }
                });

                let headerProto = undefined;
                if (content.headerText) {
                    headerProto = {
                        title: content.headerText,
                        hasMediaAttachment: false
                    };
                } else if (content.image?.url) {
                    try {
                        const media = await prepareWAMessageMedia(
                            { image: { url: content.image.url } },
                            { upload: state.sock.waUploadToServer }
                        );
                        headerProto = {
                            hasMediaAttachment: true,
                            imageMessage: media.imageMessage
                        };
                    } catch (e) {
                        console.warn('[BAILEYS] Header image upload warn:', e.message);
                    }
                } else if (content.document?.url) {
                    try {
                        const media = await prepareWAMessageMedia(
                            {
                                document: { url: content.document.url },
                                mimetype: content.document.mimetype || 'application/pdf',
                                fileName: content.fileName || 'document.pdf'
                            },
                            { upload: state.sock.waUploadToServer }
                        );
                        headerProto = {
                            hasMediaAttachment: true,
                            documentMessage: media.documentMessage
                        };
                    } catch (e) {
                        console.warn('[BAILEYS] Header doc upload warn:', e.message);
                    }
                }

                const bodyText = content.text || content.body || '';
                const footerText = content.footer || '';
                loggedText = bodyText;

                const interactiveMsg = {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({ text: bodyText }),
                        footer: footerText ? proto.Message.InteractiveMessage.Footer.create({ text: footerText }) : undefined,
                        header: headerProto,
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: nativeButtons
                        })
                    })
                };

                const userJid = state.sock.authState?.creds?.me?.id || state.sock.user?.id || (state.phoneNumber ? `${state.phoneNumber}@s.whatsapp.net` : undefined);
                const waMessage = generateWAMessageFromContent(targetJid, interactiveMsg, {
                    userJid,
                    upload: state.sock.waUploadToServer
                });

                const isGroup = targetJid.endsWith('@g.us');
                const additionalNodes = [
                    {
                        tag: 'biz',
                        attrs: {},
                        content: [
                            {
                                tag: 'interactive',
                                attrs: {
                                    type: 'native_flow',
                                    v: '1'
                                },
                                content: [
                                    {
                                        tag: 'native_flow',
                                        attrs: {
                                            v: '9',
                                            name: 'mixed'
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ];

                if (!isGroup) {
                    additionalNodes.push({
                        tag: 'bot',
                        attrs: { biz_bot: '1' }
                    });
                }

                await state.sock.relayMessage(targetJid, waMessage.message, {
                    messageId: waMessage.key.id,
                    additionalNodes
                });

                sent = waMessage;
            } catch (interactiveErr) {
                console.warn('[BAILEYS] Interactive button send failed, falling back to clean text:', interactiveErr.message);
                const buttonList = content.buttons.map((b, i) => `👉 ${b.text || `Option ${i + 1}`}${b.value ? `: ${b.value}` : ''}`).join('\n');
                const fallbackText = `${content.text || content.body || ''}\n\n${buttonList}${content.footer ? `\n\n_${content.footer}_` : ''}`;
                loggedText = fallbackText;
                sent = await state.sock.sendMessage(targetJid, { text: fallbackText });
            }
        } else {
            let messagePayload;
            if (typeof content === 'string') {
                messagePayload = { text: content };
            } else if (content.text) {
                messagePayload = { text: content.text };
            } else if (content.image) {
                messagePayload = { image: content.image, caption: content.caption || '' };
                loggedText = content.caption || '[Image]';
            } else if (content.document) {
                messagePayload = { document: content.document, fileName: content.fileName || 'file.pdf', mimetype: 'application/pdf' };
                loggedText = content.caption || content.fileName || '[Document]';
            } else {
                messagePayload = content;
            }

            sent = await state.sock.sendMessage(targetJid, messagePayload);
        }

        // Record in isolated KonnectLegacyMessage table
        try {
            const authRecord = await db.whatsAppAuth.findUnique({
                where: { sessionId },
                select: { userId: true }
            });
            const userId = authRecord?.userId || sessionId;

            await db.konnectLegacyMessage.upsert({
                where: { waId: sent.key?.id || `out_${Date.now()}` },
                update: {
                    text: loggedText,
                    status: 'SENT'
                },
                create: {
                    workspaceId: sessionId,
                    userId,
                    waId: sent.key?.id || `out_${Date.now()}`,
                    jid: targetJid,
                    phoneNumber: cleanPhone,
                    text: loggedText,
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
                        lastMessage: loggedText,
                        lastInteraction: new Date()
                    },
                    create: {
                        workspaceId: sessionId,
                        userId,
                        name: `+${cleanPhone}`,
                        phone: cleanPhone,
                        lastMessage: loggedText,
                        lastInteraction: new Date(),
                        tags: ['Linked Device']
                    }
                }).catch(() => {});
            }
        } catch (dbErr) {
            console.warn('[KONNECT-LEGACY] Failed to record sent message in DB:', dbErr.message);
        }

        // Real-time broadcast outbound message to socket server room workspace:{sessionId}
        const outboundWaId = sent?.key?.id || `out_${Date.now()}`;
        emitKonnectxEvent(sessionId, 'konnectx:message:new', {
            workspaceId: sessionId,
            jid: targetJid,
            message: {
                id: outboundWaId,
                waId: outboundWaId,
                jid: targetJid,
                phoneNumber: cleanPhone,
                text: loggedText,
                fromMe: true,
                status: 'SENT',
                timestamp: Date.now()
            }
        });

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
