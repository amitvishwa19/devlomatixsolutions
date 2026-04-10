import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../../auth/[...nextauth]/options';

export const dynamic = 'force-dynamic';

async function getUserId() {
    const session = await getServerSession(authOptions);
    return session?.user?.userId || session?.user?.id;
}

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { name, description } = body;

        const group = await db.contactGroup.update({
            where: { id, userId },
            data: {
                name,
                description
            }
        });

        return NextResponse.json(group);
    } catch (error) {
        console.error('API Error (PATCH /api/wa/groups/[id]):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await db.contactGroup.delete({
            where: { id, userId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error (DELETE /api/wa/groups/[id]):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
