import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req) {
    try {
        const body = await req.json();
        const { ids, tag } = body;

        if (!ids || !Array.isArray(ids) || !tag) {
            return NextResponse.json({ error: 'Contact IDs and tag are required' }, { status: 400 });
        }

        // Fetch existing contacts to append tags
        const contacts = await db.contact.findMany({
            where: { id: { in: ids } },
            select: { id: true, tags: true }
        });

        for (const contact of contacts) {
            const currentTags = contact.tags || [];
            if (!currentTags.includes(tag)) {
                await db.contact.update({
                    where: { id: contact.id },
                    data: {
                        tags: {
                            push: tag
                        }
                    }
                });
            }
        }

        return NextResponse.json({ success: true, count: ids.length });
    } catch (error) {
        console.error('API Error (POST /api/wa/contacts/bulk-tag):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
