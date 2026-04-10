import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const { workspaceId, contactId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const contact = await db.contact.findUnique({
            where: { id: contactId, workspaceId },
            include: { 
                groups: true,
                category: true
            }
        });

        if (!contact) {
            return NextResponse.json({ message: "Contact not found" }, { status: 404 });
        }

        return NextResponse.json(contact);
    } catch (error) {
        console.error("[CONTACT_GET]", error.message);
        return NextResponse.json({ message: "Failed to fetch contact" }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const { workspaceId, contactId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, phone, email, info, tags, groupIds, categoryId, type } = body;

        // Clean phone if provided
        let cleanPhone = undefined;
        if (phone) {
            cleanPhone = phone.replace(/[^\d+]/g, '');
        }

        const contact = await db.contact.update({
            where: { id: contactId, workspaceId },
            data: {
                name,
                phone: cleanPhone,
                email,
                info: info !== undefined ? info : undefined,
                tags: tags !== undefined ? tags : undefined,
                type: type !== undefined ? type : undefined,
                categoryId: categoryId !== undefined ? categoryId : undefined,
                groups: groupIds ? {
                    set: groupIds.map(id => ({ id }))
                } : undefined
            },
            include: {
                groups: true,
                category: true
            }
        });

        return NextResponse.json(contact);
    } catch (error) {
        console.error("[CONTACT_PATCH]", error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { workspaceId, contactId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await db.contact.delete({
            where: { id: contactId, workspaceId }
        });

        return NextResponse.json({ message: "Contact deleted successfully" });
    } catch (error) {
        console.error("[CONTACT_DELETE]", error.message);
        return NextResponse.json({ message: "Failed to delete contact" }, { status: 500 });
    }
}
