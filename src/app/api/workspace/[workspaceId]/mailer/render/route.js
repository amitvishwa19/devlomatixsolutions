import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import path from "path";
import fs from "fs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";

// IMPORTANT: We need to import the component dynamically.
// This is challenging with raw strings. For now, we render SAVED files.

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

        // 1. Fetch template content from Database
        const assignment = await db.emailAssignment.findFirst({
            where: {
                workspaceId,
                templateName: filename
            }
        });

        if (!assignment || !assignment.content) {
            return NextResponse.json({ message: "Template not found in database or has no content" }, { status: 404 });
        }

        // 2. Re-create physical file for Next.js compilation
        const targetDir = path.join(process.cwd(), 'src', 'emails');
        
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const filePath = path.join(targetDir, filename);
        fs.writeFileSync(filePath, assignment.content, 'utf8');

        let html = '';
        try {
            await new Promise(resolve => setTimeout(resolve, 300)); // allow webpack watcher to catch up
            
            // Standard dynamic import (Turbopack strictly requires predictable literals)
            const module = await import(`@/emails/${filename}`);
            const EmailComponent = module.default;
            
            if (!EmailComponent) {
                return NextResponse.json({ message: "Template has no default export" }, { status: 400 });
            }

            html = await render(<EmailComponent {...(data || {})} />);
        } catch (importError) {
            console.error("[RENDER_IMPORT_ERROR]", importError);
            return NextResponse.json({ message: `Import error: ${importError.message}` }, { status: 500 });
        }

        return NextResponse.json({ html });

    } catch (error) {
        console.error("[MAILER_RENDER_POST]", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
