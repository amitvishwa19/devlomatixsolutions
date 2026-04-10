import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req) {
    try {
        const body = await req.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Contact IDs are required' }, { status: 400 });
        }

        await db.contact.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });

        return NextResponse.json({ success: true, count: ids.length });
    } catch (error) {
        console.error('API Error (POST /api/wa/contacts/bulk-delete):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
