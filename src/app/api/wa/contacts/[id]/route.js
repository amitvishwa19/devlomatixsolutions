import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(req, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
        }

        await db.contact.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error (DELETE /api/wa/contacts/[id]):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, phone, email, info } = body;

        if (!id) {
            return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
        }

        // Clean phone number
        const cleanPhone = phone ? phone.replace(/[^\d+]/g, '') : undefined;

        const updated = await db.contact.update({
            where: { id },
            data: { 
                name,
                phone: cleanPhone,
                email, 
                info: info ? info : undefined 
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('API Error (PATCH /api/wa/contacts/[id]):', error);
        
        // Handle unique constraint error (P2002) for phone
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Phone number already exists' }, { status: 409 });
        }

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
