import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req) {
    try {
        const body = await req.json();
        const { userId, contacts } = body;

        if (!userId || !contacts || !Array.isArray(contacts)) {
            return NextResponse.json({ error: 'User ID and contacts array are required' }, { status: 400 });
        }

        const results = [];
        
        // Process in batches or one-by-one with upsert to handle existing records
        // For larger imports, consider transaction or specialized bulk tools
        for (const contact of contacts) {
            const { name, phone, email, info, tags } = contact;
            
            if (!phone || !name) continue;

            // Clean phone
            const cleanPhone = phone.replace(/[^\d+]/g, '');

            const record = await db.contact.upsert({
                where: { phone: cleanPhone },
                update: {
                    name,
                    email,
                    info: info || undefined,
                    tags: tags || undefined,
                    userId // Ensure it belongs to the current user
                },
                create: {
                    name,
                    phone: cleanPhone,
                    email,
                    info: info || {},
                    tags: tags || [],
                    userId
                }
            });
            results.push(record);
        }

        return NextResponse.json({ success: true, count: results.length });
    } catch (error) {
        console.error('API Error (POST /api/wa/contacts/bulk):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
