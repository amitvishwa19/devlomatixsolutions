import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// GET /api/workspace/[workspaceId]/mailer/files
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

        // Get unique templates
        const uniqueTemplates = new Map();
        for (const a of assignments) {
            if (!uniqueTemplates.has(a.templateName)) {
                uniqueTemplates.set(a.templateName, {
                    name: a.templateName,
                    size: a.content ? a.content.length : 0,
                    updatedAt: a.updatedAt
                });
            }
        }

        return NextResponse.json(Array.from(uniqueTemplates.values()));
    } catch (error) {
        console.error("[MAILER_FILES_GET]", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST /api/workspace/[workspaceId]/mailer/files
// Create a new template file (saves as an unassigned template in DB)
export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { name, content, cloneFrom } = await req.json();
        if (!name) {
            return NextResponse.json({ message: "File name is required" }, { status: 400 });
        }

        const filename = name.endsWith(".html") ? name : (name.endsWith(".jsx") ? name : `${name}.html`);

        // Check if template already exists
        const existing = await db.emailAssignment.findFirst({
            where: { workspaceId, templateName: filename }
        });

        if (existing) {
            return NextResponse.json({ message: "Template already exists" }, { status: 400 });
        }

        let defaultContent = content;

        // If cloneFrom is provided, fetch content from source
        if (cloneFrom) {
            const source = await db.emailAssignment.findFirst({
                where: { workspaceId, templateName: cloneFrom }
            });
            if (source) {
                defaultContent = source.content;
            }
        }

        if (!defaultContent) {
            defaultContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Template</title>
</head>
<body style="background-color: #f6f9fc; margin: 0; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <tr>
      <td style="padding: 40px;">
        <h2 style="color: #333333; margin-top: 0;">Welcome, {{name}}!</h2>
        <p style="color: #555555; font-size: 16px; line-height: 24px;">
          Thank you for joining us. We are excited to have you on board!
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
        }

        // Create a dummy assignment just to store the template
        await db.emailAssignment.create({
            data: {
                workspaceId,
                event: `UNASSIGNED_${Date.now()}`,
                templateName: filename,
                subject: 'New Template',
                content: defaultContent.trim(),
                isActive: false
            }
        });

        return NextResponse.json({ message: "Template created successfully", name: filename });
    } catch (error) {
        console.error("[MAILER_FILES_POST]", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
