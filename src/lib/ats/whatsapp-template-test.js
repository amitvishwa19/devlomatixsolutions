import { makeWASocket, fetchLatestBaileysVersion, generateWAMessageFromContent, proto, prepareWAMessageMedia } from '@whiskeysockets/baileys';
import pino from 'pino';
import { usePrismaAuthState } from '../whatsapp-auth.js';
import { db } from '../db.js';

/**
 * Validates and formats a phone number to a WhatsApp JID.
 */
function formatToJid(number) {
    let clean = number.replace(/\D/g, '');
    if (!clean.startsWith('91') && clean.length === 10) {
        clean = '91' + clean;
    }
    return clean.includes('@s.whatsapp.net') ? clean : `${clean}@s.whatsapp.net`;
}

/**
 * Core function to initialize a fresh, standalone socket.
 */
async function getStandaloneSocket(sessionId) {
    console.log(`[ATS] Initializing standalone socket for session: ${sessionId}`);
    const { state, saveCreds } = await usePrismaAuthState(sessionId);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['Devlomatix-ATS', 'Chrome', '118.0.0.0'],
    });

    sock.ev.on('creds.update', saveCreds);

    return sock;
}

/**
 * Sends a Standard Text Message using a fresh connection.
 */
export async function sendStandardText(recipient, text, sessionId) {
    console.log(`[ATS] --- START: Standard Text Test ---`);
    console.log(`[ATS] Target: ${recipient}`);

    let sock = null;
    try {
        const targetJid = formatToJid(recipient);
        sock = await getStandaloneSocket(sessionId);

        // Wait for connection to be open
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Connection timeout')), 20000);

            sock.ev.on('connection.update', (update) => {
                const { connection } = update;
                if (connection === 'open') {
                    clearTimeout(timeout);
                    resolve();
                } else if (connection === 'close') {
                    // We don't reject immediately here to allow for reconnection if it's just a transient issue
                    console.log('[ATS] Connection closed, waiting for potential reopen...');
                }
            });
        });

        console.log(`[ATS] Socket OPEN. Sending message...`);
        const result = await sock.sendMessage(targetJid, { text });
        console.log(`[ATS] Message SENT successfully. ID: ${result.key.id}`);

        return result;
    } catch (error) {
        console.error(`[ATS] Error in sendStandardText:`, error.message);
        throw error;
    } finally {
        if (sock) {
            console.log(`[ATS] Closing standalone socket.`);
            sock.end(undefined);
        }
        console.log(`[ATS] --- END: Standard Text Test ---`);
    }
}

/**
 * Sends an Image Message using a fresh connection.
 */
export async function sendImageMessage(recipient, imageUrl, caption, sessionId) {
    console.log(`[ATS] --- START: Image Message Test ---`);
    console.log(`[ATS] Target: ${recipient}`);
    console.log(`[ATS] Image: ${imageUrl}`);

    let sock = null;
    try {
        const targetJid = formatToJid(recipient);
        sock = await getStandaloneSocket(sessionId);

        // Wait for connection to be open
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Connection timeout')), 20000);
            sock.ev.on('connection.update', (update) => {
                if (update.connection === 'open') {
                    clearTimeout(timeout);
                    resolve();
                }
            });
        });

        console.log(`[ATS] Socket OPEN. Sending image...`);
        const result = await sock.sendMessage(targetJid, {
            image: { url: imageUrl },
            caption: caption || 'Test Image from ATS'
        });
        console.log(`[ATS] Image SENT successfully. ID: ${result.key.id}`);

        return result;
    } catch (error) {
        console.error(`[ATS] Error in sendImageMessage:`, error.message);
        throw error;
    } finally {
        if (sock) {
            console.log(`[ATS] Closing standalone socket.`);
            sock.end(undefined);
        }
        console.log(`[ATS] --- END: Image Message Test ---`);
    }
}

/**
 * Sends a Disappearing View Once Message (Image)
 */
export async function sendViewOnceMessage(recipient, imageUrl, caption, sessionId) {
    console.log(`[ATS] --- START: View Once Message Test ---`);
    console.log(`[ATS] Target: ${recipient}`);

    let sock = null;
    try {
        const targetJid = formatToJid(recipient);
        sock = await getStandaloneSocket(sessionId);

        // Wait for connection to be open
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Connection timeout')), 20000);
            sock.ev.on('connection.update', (update) => {
                if (update.connection === 'open') {
                    clearTimeout(timeout);
                    resolve();
                }
            });
        });

        console.log(`[ATS] Socket OPEN. Sending view-once image...`);

        // Fetch image as buffer to ensure viewOnce flag is correctly applied
        const response = await fetch(imageUrl);
        const buffer = Buffer.from(await response.arrayBuffer());

        const result = await sock.sendMessage(targetJid, {
            image: buffer,
            caption: caption || 'This message will disappear after one view! 👁️',
            viewOnce: true
        });
        console.log(`[ATS] View Once SENT successfully. ID: ${result.key.id}`);

        return result;
    } catch (error) {
        console.error(`[ATS] Error in sendViewOnceMessage:`, error.message);
        throw error;
    } finally {
        if (sock) {
            console.log(`[ATS] Closing standalone socket.`);
            sock.end(undefined);
        }
        console.log(`[ATS] --- END: View Once Message Test ---`);
    }
}

/**
 * Sends a Document Message using a fresh connection.
 */
export async function sendDocumentMessage(recipient, docUrl, fileName, sessionId) {
    console.log(`[ATS] --- START: Document Message Test ---`);
    console.log(`[ATS] Target: ${recipient}`);
    console.log(`[ATS] Document: ${docUrl}`);

    let sock = null;
    try {
        const targetJid = formatToJid(recipient);
        sock = await getStandaloneSocket(sessionId);

        // Wait for connection to be open
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Connection timeout')), 20000);
            sock.ev.on('connection.update', (update) => {
                if (update.connection === 'open') {
                    clearTimeout(timeout);
                    resolve();
                }
            });
        });

        console.log(`[ATS] Socket OPEN. Sending document...`);
        const result = await sock.sendMessage(targetJid, {
            document: { url: docUrl },
            fileName: fileName || 'TestDocument.pdf',
            mimetype: 'application/pdf'
        });
        console.log(`[ATS] Document SENT successfully. ID: ${result.key.id}`);

        return result;
    } catch (error) {
        console.error(`[ATS] Error in sendDocumentMessage:`, error.message);
        throw error;
    } finally {
        if (sock) {
            console.log(`[ATS] Closing standalone socket.`);
            sock.end(undefined);
        }
        console.log(`[ATS] --- END: Document Message Test ---`);
    }
}

/**
 * Sends a Carousel Interactive Message using RAW protobuf structure.
 */
export async function sendCarouselMessage(recipient, cards, sessionId) {
    console.log(`[ATS] --- START: Carousel Message Test ---`);
    console.log(`[ATS] Target: ${recipient}`);

    let sock = null;

    try {
        const targetJid = formatToJid(recipient);
        sock = await getStandaloneSocket(sessionId);

        // ✅ Wait for connection
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Connection timeout')), 20000);

            sock.ev.on('connection.update', (update) => {
                if (update.connection === 'open') {
                    clearTimeout(timeout);
                    resolve();
                }
            });
        });

        console.log(`[ATS] Socket OPEN. Preparing media...`);

        // ✅ FIX: Prepare media properly
        const preparedCards = await Promise.all(
            cards.map(async (card, idx) => {
                const response = await fetch(card.imageUrl);
                const buffer = Buffer.from(await response.arrayBuffer());

                const media = await prepareWAMessageMedia(
                    { image: buffer },
                    { upload: sock.waUploadToServer }
                );

                return {
                    header: {
                        imageMessage: media.imageMessage,
                        hasMediaAttachment: true
                    },
                    body: {
                        text: card.title || `Item ${idx + 1}`
                    },
                    footer: {
                        text: card.description || 'Exclusive offer'
                    },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: card.buttonText || "Select Item",
                                    id: `card_select_${idx}`
                                })
                            }
                        ]
                    }
                };
            })
        );

        console.log(`[ATS] Building message...`);

        const messageContent = {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: 'Check out our featured items! 🚀' },
                        footer: { text: 'Devlomatix Solutions' },
                        carouselMessage: {
                            cards: preparedCards
                        }
                    }
                }
            }
        };

        const msg = generateWAMessageFromContent(targetJid, messageContent, {
            userJid: sock.user.id,
            upload: sock.waUploadToServer
        });

        console.log(`[ATS] Sending Carousel...`);

        await sock.relayMessage(targetJid, msg.message, {
            messageId: msg.key.id
        });

        console.log(`✅ Carousel SENT successfully. ID: ${msg.key.id}`);

        return msg;

    } catch (error) {
        console.error(`[ATS] Error in sendCarouselMessage:`, error);
        throw error;

    } finally {
        if (sock) {
            console.log(`[ATS] Closing standalone socket.`);
            sock.end(undefined);
        }
        console.log(`[ATS] --- END: Carousel Message Test ---`);
    }
}

/**
 * Utility to find the first connected session and run a test.
 */
async function autoRunTest() {
    try {
        const auth = await db.whatsAppAuth.findFirst({
            where: { status: 'CONNECTED' }
        });

        if (!auth) {
            console.error('[ATS] No connected WhatsApp session found in database.');
            return;
        }

        const testNumbers = auth.metadata?.testNumbers || [];
        if (testNumbers.length === 0) {
            console.error('[ATS] No test numbers found in session metadata. Please add them in Settings.');
            return;
        }

        const target = testNumbers[0];

        // 1. Test Standard Text
        const textMessage = "Hello! This is a Standard Text test from your new standalone ATS utility. 🚀";
        await sendStandardText(target, textMessage, auth.sessionId);

        // 2. Test Image Message
        const testImageUrl = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop";
        const imageCaption = "This is a Test Image with a caption. 📸";
        await sendImageMessage(target, testImageUrl, imageCaption, auth.sessionId);

        // 3. Test View Once Message
        const viewOnceUrl = "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop";
        const viewOnceCaption = "This is a Disappearing View Once test! 👁️";
        await sendViewOnceMessage(target, viewOnceUrl, viewOnceCaption, auth.sessionId);

        // 4. Test Document Message
        const testDocUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
        const testFileName = "SampleTestDocument.pdf";
        await sendDocumentMessage(target, testDocUrl, testFileName, auth.sessionId);

        // 5. Test Carousel Message
        const carouselCards = [
            {
                title: "Premium Hosting",
                description: "Lightning fast servers for your enterprise.",
                imageUrl: "https://plus.unsplash.com/premium_photo-1678565869434-c81195663466?q=80&w=1000&auto=format&fit=crop",
                buttonText: "Learn More"
            },
            {
                title: "Cloud Storage",
                description: "Secure, encrypted storage you can trust.",
                imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop",
                buttonText: "Get Started"
            },
            {
                title: "24/7 Support",
                description: "Always here for you, anytime, anywhere.",
                imageUrl: "https://plus.unsplash.com/premium_photo-1661299387682-24220c3eecf4?q=80&w=1000&auto=format&fit=crop",
                buttonText: "Chat Now"
            }
        ];
        await sendCarouselMessage(target, carouselCards, auth.sessionId);

    } catch (err) {
        console.error('[ATS] Auto-run failed:', err);
    } finally {
        process.exit(0);
    }
}

// Run if called directly
if (process.argv[1].endsWith('whatsapp-template-test.js')) {
    autoRunTest();
}
