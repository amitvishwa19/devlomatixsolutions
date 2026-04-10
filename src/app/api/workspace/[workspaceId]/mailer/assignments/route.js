import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// GET /api/workspace/[workspaceId]/mailer/assignments
export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const assignments = await db.emailAssignment.findMany({
            where: { workspaceId }
        });

        return NextResponse.json(assignments);
    } catch (error) {
        console.error("[MAILER_ASSIGNMENTS_GET]", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST /api/workspace/[workspaceId]/mailer/assignments
export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { event, templateName, subject, fromEmail, isActive } = await req.json();

        if (!event || !templateName) {
            return NextResponse.json({ message: "Event and template name are required" }, { status: 400 });
        }

        const assignment = await db.emailAssignment.upsert({
            where: {
                workspaceId_event: {
                    workspaceId,
                    event
                }
            },
            update: {
                templateName,
                subject,
                fromEmail,
                isActive: isActive !== undefined ? isActive : true
            },
            create: {
                workspaceId,
                event,
                templateName,
                subject,
                fromEmail,
                isActive: isActive !== undefined ? isActive : true
            }
        });

        return NextResponse.json(assignment);
    } catch (error) {
        console.error("[MAILER_ASSIGNMENTS_POST]", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
