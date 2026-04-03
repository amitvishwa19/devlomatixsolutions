import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.userId || session.user.id;
        const templates = await db.messageTemplate.findMany({
            where: {
                OR: [
                    { isDefault: true },
                    { userId }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ success: true, templates });
    } catch (error) {
        console.error("Error fetching templates:", error);
        return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
    }
}

export async function POST(req) {
    // Reuse existing POST logic from singular route if needed
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.userId || session.user.id;
        const body = await req.json();
        const { id, name, category, language, type, body: msgBody, footer, buttons, metadata, status } = body;
        if (!name || !msgBody) {
            return NextResponse.json({ error: "Name and body are required fields." }, { status: 400 });
        }
        const cleanName = name;
        let template;
        if (id) {
            const existing = await db.messageTemplate.findUnique({ where: { id } });
            if (!existing || existing.userId !== userId) {
                return NextResponse.json({ error: "Template not found or unauthorized" }, { status: 403 });
            }
            template = await db.messageTemplate.update({
                where: { id },
                data: {
                    name: cleanName,
                    category: category || "UTILITY",
                    language: language || "en_US",
                    type: type || "TEXT",
                    body: msgBody,
                    footer: footer || null,
                    buttons: buttons || [],
                    metadata: metadata || null,
                    status: status || "DRAFT"
                }
            });
        } else {
            const existingName = await db.messageTemplate.findFirst({ where: { userId, name: cleanName } });
            if (existingName) {
                return NextResponse.json({ error: "A template with this name already exists." }, { status: 400 });
            }
            template = await db.messageTemplate.create({
                data: {
                    userId,
                    name: cleanName,
                    category: category || "UTILITY",
                    language: language || "en_US",
                    type: type || "TEXT",
                    body: msgBody,
                    footer: footer || null,
                    buttons: buttons || [],
                    metadata: metadata || null,
                    status: "PENDING"
                }
            });
        }
        return NextResponse.json({ success: true, template });
    } catch (error) {
        console.error("Error saving template:", error);
        return NextResponse.json({ error: error?.message || "Failed to save template" }, { status: 500 });
    }
}
