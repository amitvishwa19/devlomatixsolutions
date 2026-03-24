import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const contacts = await db.contact.findMany({
            where: { userId },
            include: { groups: true },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(contacts);
    } catch (error) {
        console.error('API Error (GET /api/wa/contacts):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, phone, email, info, userId } = body;

        if (!name || !phone || !userId) {
            return NextResponse.json({ error: 'Missing required fields (name, phone, userId)' }, { status: 400 });
        }

        // Clean phone number (remove non-digits, but keep + if present)
        const cleanPhone = phone.replace(/[^\d+]/g, '');

        // Check if contact already exists (phone is unique in schema)
        const existingContact = await db.contact.findUnique({
            where: { phone: cleanPhone }
        });

        if (existingContact) {
            if (existingContact.userId !== userId) {
                return NextResponse.json({ error: 'Phone number already registered by another user' }, { status: 409 });
            }
            
            // Update existing if it's the same user
            const updated = await db.contact.update({
                where: { id: existingContact.id },
                data: { name, email, info: info ? info : undefined }
            });
            return NextResponse.json(updated);
        }

        const contact = await db.contact.create({
            data: {
                name,
                phone: cleanPhone,
                email,
                info: info ? info : undefined,
                userId
            }
        });

        return NextResponse.json(contact);
    } catch (error) {
        console.error('API Error (POST /api/wa/contacts):', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
