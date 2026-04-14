import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req) {
    try {
        const body = await req.json();
        const { ids, categoryId } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Contact IDs are required' }, { status: 400 });
        }

        // Update all contacts to the new category
        // If categoryId is empty/null, it effectively un-categorizes them
        await db.contact.updateMany({
            where: {
                id: { in: ids }
            },
            data: {
                categoryId: categoryId || null
            }
        });

        return NextResponse.json({ success: true, count: ids.length, categoryId });
    } catch (error) {
        console.error('API Error (POST /api/wa/contacts/bulk-category):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
