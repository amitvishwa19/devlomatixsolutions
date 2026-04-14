import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import { db } from '@/lib/db';
import { waManager } from '@/app/workspace/[workspaceId]/wa/_lib/whatsapp-v2';
import * as cloudApi from '@/app/workspace/[workspaceId]/wa/_lib/whatsapp-cloud-api';
import { symmetricDecrypt } from '@/lib/encryption';

export async function POST(req) {
    try {

        console.log("Cloud API Send Request:");


        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId || session.user.id;
        const body = await req.json();
        const { to } = body;

        console.log(`[Cloud API Send] Request received for ${to}, type: ${body.type}`);

        if (!to) {
            return NextResponse.json({ error: 'Missing "to" (phone number).' }, { status: 400 });
        }

        // Clean phone number (strip non-digits, keep '+' if present) for Meta Cloud API
        const cleanTo = to.replace(/[^\d+]/g, '');

        // 1. Fetch Cloud API Credentials
        // First try to find the default account
        let credential = await db.credentials.findFirst({
            where: {
                userId,
                platform: 'WHATSAPP_CLOUD',
                isDefault: true
            }
        });

        // Fallback to most recent if no default is set
        if (!credential) {
            credential = await db.credentials.findFirst({
                where: {
                    userId,
                    platform: 'WHATSAPP_CLOUD'
                },
                orderBy: { updatedAt: 'desc' }
            });
        }

        if (!credential || !credential.credentials) {
            console.error(`[Cloud API Send] No credentials found for user ${userId}`);
            return NextResponse.json({
                error: "WhatsApp Cloud API credentials not found. Please configure them in Settings > Credentials."
            }, { status: 404 });
        }

        // Standardize credentials object for the library
        let cloudCredentials = null;
        const stored = credential.credentials;

        if (typeof stored === 'string' && stored.includes(':')) {
            try {
                console.log(`[Cloud API Send] Decrypting raw credentials for user ${userId}`);
                const decryptedStr = symmetricDecrypt(stored);
                cloudCredentials = JSON.parse(decryptedStr);
            } catch (e) {
                console.error(`[Cloud API Send] Decryption failed!`, e);
                return NextResponse.json({ error: "Failed to decrypt WhatsApp credentials." }, { status: 500 });
            }
        } else if (typeof stored === 'string') {
            try {
                cloudCredentials = JSON.parse(stored);
            } catch (e) {
                console.error(`[Cloud API Send] JSON Parse failed!`, e);
                return NextResponse.json({ error: "Invalid credentials format." }, { status: 500 });
            }
        } else {
            cloudCredentials = stored;
        }

        // Handle Legacy Object Wrapping
        if (cloudCredentials?.enc) {
            try {
                const decryptedStr = symmetricDecrypt(cloudCredentials.enc);
                cloudCredentials = JSON.parse(decryptedStr);
            } catch (e) {
                console.error(`[Cloud API Send] legacy Decryption failed!`, e);
            }
        }

        if (!cloudCredentials.accessToken || !cloudCredentials.phoneNumberId) {
            console.error(`[Cloud API Send] Incomplete credentials for user ${userId}`, cloudCredentials);
            return NextResponse.json({
                error: "Incomplete Cloud API credentials. Please update them in Settings."
            }, { status: 400 });
        }

        // 2. Dispatch based on type
        let result;
        const type = (body.type || 'text').toLowerCase();

        console.log(`[Cloud API Send] Dispatching ${type} to ${cleanTo}`);

        // Direct mapping of payload types to Cloud API functions
        switch (type) {
            case 'text':
                const textBody = (body.body || body.text || (typeof body.content === 'string' ? body.content : "")).trim();
                result = await cloudApi.sendTextMessage(cloudCredentials, cleanTo, textBody);
                break;
            case 'image':
            case 'video':
            case 'audio':
            case 'document':
                const mediaUrl = body.mediaUrl || body[type]?.url || body.url;
                const caption = (body.caption || (body[type]?.caption) || "").trim();
                result = await cloudApi.sendMediaMessage(cloudCredentials, cleanTo, type, mediaUrl, caption);
                break;
            case 'location':
                const loc = body.location;
                if (!loc) return NextResponse.json({ error: "Missing location data" }, { status: 400 });
                result = await cloudApi.sendLocationMessage(
                    cloudCredentials,
                    cleanTo,
                    loc.degreesLatitude || loc.latitude,
                    loc.degreesLongitude || loc.longitude,
                    loc.name,
                    loc.address
                );
                break;
            case 'interactive':
            case 'interactive-button':
            case 'interactive-group':
                console.log(`[Cloud API Send] Interactive Payload:`, JSON.stringify(body.interactive));
                result = await cloudApi.sendInteractiveMessage(cloudCredentials, cleanTo, body.interactive);
                break;
            case 'template':
                if (!body.template?.name) return NextResponse.json({ error: "Missing template name" }, { status: 400 });
                result = await cloudApi.sendTemplateMessage(
                    cloudCredentials,
                    cleanTo,
                    body.template.name,
                    body.template.language?.code || 'en_US',
                    body.template.components || []
                );
                break;
            default:
                return NextResponse.json({ error: `Unsupported message type: ${type}` }, { status: 400 });
        }

        console.log(`[Cloud API Send] Result:`, result);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        // 3. Log sent message to DB for history
        try {
            let logText = "";
            if (type === 'template') {
                try {
                    // Try to fetch template body to reconstruct the log text
                    const template = await db.messageTemplate.findFirst({
                        where: { 
                            userId,
                            OR: [
                                { name: body.template.name },
                                { templateName: body.template.name }
                            ]
                        }
                    });
                    
                    if (template) {
                        let fullText = template.body;
                        // Replace variables {{1}}, {{2}}, etc.
                        const bodyComp = body.template.components?.find(c => c.type?.toLowerCase() === 'body');
                        if (bodyComp?.parameters) {
                            bodyComp.parameters.forEach((param, idx) => {
                                fullText = fullText.replace(`{{${idx + 1}}}`, param.text || "");
                            });
                        }
                        logText = fullText;
                    } else {
                        logText = `[Template: ${body.template.name}]`;
                    }
                } catch (e) {
                    logText = `[Template: ${body.template.name}]`;
                }
            } else {
                switch (type) {
                    case 'text': logText = body.body || body.text || body.content || ""; break;
                    case 'interactive':
                    case 'interactive-button':
                    case 'interactive-group':
                        logText = "[Interactive Message]";
                        break;
                    default: logText = `[${type.toUpperCase()}] ${body.caption || ""}`;
                }
            }

            const waMessageId = result.data?.messages?.[0]?.id;

            await db.whatsAppMessage.create({
                data: {
                    userId,
                    waId: waMessageId || `local_${Date.now()}`,
                    jid: cleanTo,
                    text: logText,
                    fromMe: true,
                    timestamp: BigInt(Math.floor(Date.now() / 1000)),
                    status: "SENT",
                    metadata: { type, originalPayload: body }
                }
            });
            console.log(`[Cloud API Send] Logged message to DB for ${cleanTo}`);
        } catch (dbError) {
            console.error(`[Cloud API Send] Database logging failed (silent):`, dbError);
            // We don't fail the request if logging fails, but we log the error
        }

        return NextResponse.json({ success: true, data: result.data });

    } catch (error) {
        console.error('[SEND_CLOUD_API_ERROR]', error);
        return NextResponse.json({
            error: error.message || "Failed to send message via Cloud API",
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
