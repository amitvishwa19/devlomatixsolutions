import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const groupId = searchParams.get("groupId");

        const contacts = await db.contact.findMany({
            where: {
                workspaceId,
                AND: [
                    groupId ? { groups: { some: { id: groupId } } } : {},
                    search ? {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { phone: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } },
                        ]
                    } : {}
                ]
            },
            include: {
                groups: true,
                category: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(contacts);
    } catch (error) {
        console.error("[CONTACTS_GET]", error.message);
        return NextResponse.json({ message: "Failed to fetch contacts" }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId;
        const body = await req.json();
        const { name, phone, email, info, tags, groupIds, categoryId, type } = body;

        if (!name || !phone) {
            return NextResponse.json({ message: "Name and phone are required" }, { status: 400 });
        }

        // Clean phone number
        const cleanPhone = phone.replace(/[^\d+]/g, '');

        // Check for duplicate in workspace
        const existing = await db.contact.findFirst({
            where: { workspaceId, phone: cleanPhone }
        });

        if (existing) {
            return NextResponse.json({ message: "Contact with this phone already exists in workspace" }, { status: 409 });
        }

        const contact = await db.contact.create({
            data: {
                name,
                phone: cleanPhone,
                email,
                info: info || {},
                tags: tags || [],
                type: type || 'CONTACT',
                workspaceId,
                userId,
                categoryId: categoryId || null,
                groups: groupIds ? {
                    connect: groupIds.map(id => ({ id }))
                } : undefined
            },
            include: {
                groups: true,
                category: true
            }
        });

        return NextResponse.json(contact);
    } catch (error) {
        console.error("[CONTACTS_POST]", error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
