import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export const dynamic = 'force-dynamic';

async function getUserId() {
    const session = await getServerSession(authOptions);
    return session?.user?.userId || session?.user?.id;
}

export async function POST(req, { params }) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { groupId, leads } = body;

        if (!leads || !Array.isArray(leads) || leads.length === 0) {
            return NextResponse.json({ error: 'Leads array is required' }, { status: 400 });
        }

        // 1. Verify the group belongs to the user (if groupId provided)
        if (groupId) {
          const group = await db.contactGroup.findUnique({
              where: { id: groupId, userId }
          });
          if (!group) return NextResponse.json({ error: 'Contact Group not found or unauthorized' }, { status: 404 });
        }

        const results = {
            saved: 0,
            updated: 0,
            skipped: 0,
            errors: []
        };

        // 2. Process leads in a semi-bulk fashion
        // We'll use a transaction for data consistency
        try {
            await db.$transaction(async (tx) => {
                for (const lead of leads) {
                    try {
                        if (!lead.phone) {
                            results.skipped++;
                            continue;
                        }

                        // Clean phone number (remove non-digits, keep +)
                        const cleanPhone = lead.phone.replace(/[^\d+]/g, '');
                        if (!cleanPhone || cleanPhone.length < 5) {
                            console.log(`[LEADS_SAVE_API] Skipping lead ${lead.name} due to invalid phone: ${lead.phone}`);
                            results.skipped++;
                            continue;
                        }

                        // Pre-calculate info JSON
                        const info = {
                          address: lead.address || "No address provided",
                          rating: lead.rating || 0,
                          reviews: lead.reviews || 0,
                          website: lead.website || null,
                          category: lead.category || "General",
                          source: 'LeadFinder'
                        };

                        // Upsert the contact based on phone number
                        // Note: upsert in Prisma is atomic. If phone is @unique, this is safe.
                        const contact = await tx.contact.upsert({
                            where: { phone: cleanPhone },
                            update: {
                                name: lead.name,
                                email: lead.email || undefined,
                                info: info,
                                userId: userId 
                            },
                            create: {
                                name: lead.name,
                                phone: cleanPhone,
                                email: lead.email || undefined,
                                info: info,
                                userId: userId
                            }
                        });

                        // If a group is selected, link the contact to it
                        if (groupId) {
                            await tx.contactGroup.update({
                                where: { id: groupId },
                                data: {
                                    contacts: {
                                        connect: { id: contact.id }
                                    }
                                }
                            });
                        }

                        results.saved++;
                    } catch (err) {
                        console.error(`[LEADS_SAVE_API] Error processing lead ${lead.name}:`, err);
                        results.errors.push({ name: lead.name, error: err.message });
                        // We don't re-throw here because we want to attempt the rest of the leads
                        // but if we want the transaction to proceed, we must handle it.
                    }
                }
            }, {
                timeout: 30000 // Increase timeout for bulk operations
            });
        } catch (txError) {
            console.error('[LEADS_SAVE_API] Transaction failed:', txError);
            throw txError; // Re-throw to be caught by the outer catch
        }

        return NextResponse.json({
            success: true,
            message: `Successfully processed ${results.saved} leads.`,
            stats: results
        });

    } catch (error) {
        console.error('API Error (POST /api/workspace/[workspaceId]/miscellaneous/leads/save):', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
