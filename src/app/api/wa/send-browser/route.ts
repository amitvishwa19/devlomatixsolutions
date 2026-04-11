import { NextResponse } from 'next/server';
import { waManager } from '@/app/workspace/[workspaceId]/wa/_lib/whatsapp-v2';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { to, text } = body;

        if (!to || !text) {
            return NextResponse.json({ error: 'Missing "to" (phone number) or "text" fields.' }, { status: 400 });
        }

        // Format phone number to JID
        let jid = to;
        // Remove all non-numeric characters
        jid = jid.replace(/\D/g, '');

        // Basic validation: Append @s.whatsapp.net if missing
        if (!jid.endsWith('@s.whatsapp.net')) {
            jid = `${jid}@s.whatsapp.net`;
        }

        // Attempt to send message
        let sendPayload: any = { text };
        
        if (body.interactive) sendPayload.interactive = body.interactive;
        if (body.image) sendPayload.image = body.image;
        if (body.video) sendPayload.video = body.video;
        if (body.audio) sendPayload.audio = body.audio;
        if (body.document) sendPayload.document = body.document;
        if (body.location) sendPayload.location = body.location;
        if (body.caption) sendPayload.caption = body.caption;

        const result = await waManager.sendMessage(jid, sendPayload);

        return NextResponse.json({ success: true, result });
    } catch (error: unknown) {
        console.error('Failed to send WA message:', error);
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message || 'Unknown error' }, { status: 500 });
    }
}
