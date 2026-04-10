import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../../../auth/[...nextauth]/options';

export const dynamic = 'force-dynamic';

async function getUserId() {
    const session = await getServerSession(authOptions);
    return session?.user?.userId || session?.user?.id;
}

export async function POST(request, { params }) {
    try {
        const { id } = await params;
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { contactIds } = body; // Array of contact IDs

        if (!Array.isArray(contactIds) || contactIds.length === 0) {
            return NextResponse.json({ error: 'No contact IDs provided' }, { status: 400 });
        }

        const group = await db.contactGroup.update({
            where: { id, userId },
            data: {
                contacts: {
                    connect: contactIds.map(cid => ({ id: cid }))
                }
            }
        });

        return NextResponse.json(group);
    } catch (error) {
        console.error('API Error (POST /api/wa/groups/[id]/contacts):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { contactIds } = body;

        if (!Array.isArray(contactIds) || contactIds.length === 0) {
            return NextResponse.json({ error: 'No contact IDs provided' }, { status: 400 });
        }

        const group = await db.contactGroup.update({
            where: { id, userId },
            data: {
                contacts: {
                    disconnect: contactIds.map(cid => ({ id: cid }))
                }
            }
        });

        return NextResponse.json(group);
    } catch (error) {
        console.error('API Error (DELETE /api/wa/groups/[id]/contacts):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
