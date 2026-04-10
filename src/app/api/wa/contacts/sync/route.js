import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { waManager } from '@/lib/whatsapp-v2';

export async function POST(req) {
    try {
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        if (waManager.getState() !== 'open') {
            return NextResponse.json({ error: 'WhatsApp is not connected' }, { status: 400 });
        }

        const waContacts = waManager.getContacts();
        console.log(`[Sync] Found ${waContacts?.length || 0} total contacts in manager`);
        
        if (!waContacts || !Array.isArray(waContacts) || waContacts.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: 'No contacts found on WhatsApp' });
        }

        let count = 0;

        // Process in batches
        for (const contact of waContacts) {
            try {
                if (!contact || !contact.id) continue;
                
                const jid = contact.id;
                // Only process individual contacts, skip groups and broadcasts
                if (jid.includes('@g.us') || jid.includes('@broadcast') || jid.includes('newsletter')) continue;
                if (!jid.endsWith('@s.whatsapp.net')) continue;

                const phone = jid.split('@')[0];
                if (!phone) continue;

                // Clean phone: keep only digits and +
                const cleanPhone = phone.replace(/[^\d+]/g, '');
                if (!cleanPhone || cleanPhone.length < 5) continue; // Skip too short numbers

                const name = contact.name || contact.notify || contact.verifiedName || phone;
                
                console.log(`[Sync] Syncing ${name} (${cleanPhone})`);

                await db.contact.upsert({
                    where: { phone: cleanPhone },
                    update: {
                        name,
                        userId,
                        updatedAt: new Date()
                    },
                    create: {
                        name,
                        phone: cleanPhone,
                        userId,
                        info: { source: 'WhatsApp Sync' }
                    }
                });
                count++;
            } catch (err) {
                console.error(`[Sync] Failed to process contact ${contact?.id}:`, err);
            }
        }

        console.log(`[Sync] Successfully processed ${count} contacts`);

        return NextResponse.json({ 
            success: true, 
            count, 
            message: `Successfully synchronized ${count} contacts from WhatsApp` 
        });
    } catch (error) {
        console.error('API Error (POST /api/wa/contacts/sync):', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
