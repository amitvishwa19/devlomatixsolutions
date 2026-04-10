import { NextResponse } from 'next/server';
import { waManager } from '@/lib/whatsapp-v2';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        await waManager.disconnect();
        return NextResponse.json({ success: true, message: 'Disconnected successfully' });
    } catch (error: unknown) {
        console.error('Failed to disconnect WA', error);
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message || 'Unknown error' }, { status: 500 });
    }
}
