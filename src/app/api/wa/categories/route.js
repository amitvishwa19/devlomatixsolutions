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

        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspaceId');
        const type = searchParams.get('type') || 'CONTACT';

        if (!workspaceId) {
            return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
        }

        const categories = await db.category.findMany({
            where: { 
                workspaceId,
                type: type.toUpperCase()
            },
            include: {
                _count: {
                    select: { contacts: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('API Error (GET /api/wa/categories):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { name, description, color, type, slug, workspaceId } = body;

        if (!name || !workspaceId) {
            return NextResponse.json({ error: 'Name and Workspace ID are required' }, { status: 400 });
        }

        // Generate slug if not provided
        const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const category = await db.category.create({
            data: {
                name,
                slug: finalSlug,
                description,
                color: color || '#888888',
                type: type || 'GENERAL',
                workspaceId,
                userId
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 });
        }
        console.error('API Error (POST /api/wa/categories):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
