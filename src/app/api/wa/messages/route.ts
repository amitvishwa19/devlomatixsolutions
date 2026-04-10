import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const jid = searchParams.get('jid');
        const limit = parseInt(searchParams.get('limit') || '50');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const where: any = { userId };
        if (jid) {
            where.jid = jid;
        }

        const messages = await db.whatsAppMessage.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: limit
        });

        // Convert BigInt timestamp to number for JSON response
        const formattedMessages = messages.map((msg: any) => ({
            ...msg,
            timestamp: Number(msg.timestamp) * 1000 // Convert to JS timestamp (ms)
        })).reverse(); // Return in chronological order

        return NextResponse.json(formattedMessages);
    } catch (error) {
        console.error('API Error (GET /api/wa/messages):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
