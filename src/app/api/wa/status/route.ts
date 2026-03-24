import { NextResponse } from 'next/server';
import { waManager } from '@/lib/whatsapp-v2';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Attempt to connect if not already connected
        waManager.connect();

        // Slight delay to allow state changes if this is the very first connect trigger
        // await new Promise(resolve => setTimeout(resolve, 500));

        return NextResponse.json({
            status: waManager.getState(),
            qr: waManager.getQrCodeString(),
            messages: waManager.getMessages()
        });
    } catch (error: unknown) {
        console.error('Failed to get WA status', error);
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message || 'Unknown error' }, { status: 500 });
    }
}
