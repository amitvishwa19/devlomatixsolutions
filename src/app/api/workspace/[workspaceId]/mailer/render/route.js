import { NextResponse } from "next/server";
import Handlebars from "handlebars";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { filename, data } = await req.json();
        if (!filename) {
            return NextResponse.json({ message: "Filename is required" }, { status: 400 });
        }

        // 1. Fetch template HTML string from Database
        const assignment = await db.emailAssignment.findFirst({
            where: {
                workspaceId,
                templateName: filename
            }
        });

        if (!assignment || !assignment.content) {
            return NextResponse.json({ message: "Template not found in database or has no content" }, { status: 404 });
        }

        // 2. Compile HTML dynamically using Handlebars
        try {
            const template = Handlebars.compile(assignment.content);
            const html = template(data || {});
            
            return NextResponse.json({ html });
        } catch (engineError) {
            console.error("[HANDLEBARS_ERROR]", engineError);
            return NextResponse.json({ message: `Template compilation error: ${engineError.message}` }, { status: 500 });
        }

    } catch (error) {
        console.error("[MAILER_RENDER_POST]", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
