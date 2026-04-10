import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../auth/[...nextauth]/options';

export const dynamic = 'force-dynamic';

async function getUserId() {
    const session = await getServerSession(authOptions);
    return session?.user?.userId || session?.user?.id;
}

export async function GET(request) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const groups = await db.contactGroup.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { contacts: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(groups);
    } catch (error) {
        console.error('API Error (GET /api/wa/groups):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { name, description } = body;

        if (!name) return NextResponse.json({ error: 'Group name is required' }, { status: 400 });

        const group = await db.contactGroup.create({
            data: {
                name,
                description,
                userId
            }
        });

        return NextResponse.json(group);
    } catch (error) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'A group with this name already exists' }, { status: 400 });
        }
        console.error('API Error (POST /api/wa/groups):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
