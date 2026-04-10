import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req) {
    try {
        const body = await req.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Contact IDs are required' }, { status: 400 });
        }

        // Fetch contacts
        const contacts = await db.contact.findMany({
            where: { id: { in: ids } },
            select: { id: true, phone: true }
        });

        let formattedCount = 0;

        // Perform updates in a transaction for atomicity, or individually if preferred
        // Using a loop here to handle individual logic for each number
        const updates = contacts.map(async (contact) => {
            let phone = contact.phone.trim();
            
            // 1. Basic cleaning: remove spaces, hyphens, and everything except digits and '+'
            phone = phone.replace(/[^\d+]/g, '');

            // 2. Logic Check
            let newPhone = phone;

            if (phone.startsWith('+')) {
                // Already has a country code plus, assume it's valid
                return;
            } else if (phone.length === 10) {
                // Standard 10-digit Indian number
                newPhone = `+91${phone}`;
            } else if (phone.length === 12 && phone.startsWith('91')) {
                // 12-digit starting with 91, just missing the '+'
                newPhone = `+${phone}`;
            } else if (phone.length === 11 && phone.startsWith('0')) {
                // 11-digit starting with 0, replace 0 with +91
                newPhone = `+91${phone.substring(1)}`;
            } else {
                // Unknown format, don't touch it to avoid corruption
                return;
            }

            if (newPhone !== contact.phone) {
                await db.contact.update({
                    where: { id: contact.id },
                    data: { phone: newPhone }
                });
                formattedCount++;
            }
        });

        await Promise.all(updates);

        return NextResponse.json({ 
            success: true, 
            message: `Successfully formatted ${formattedCount} contacts.`,
            count: formattedCount
        });

    } catch (error) {
        console.error('API Error (POST /api/wa/contacts/bulk-format):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
