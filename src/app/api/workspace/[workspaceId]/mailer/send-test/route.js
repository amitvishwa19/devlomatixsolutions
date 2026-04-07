import { NextResponse } from "next/server";
import { AppMailer } from "@/utils/AppMailer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// POST /api/workspace/[workspaceId]/mailer/send-test
export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { to, subject, templateName, templateData } = await req.json();

        if (!to || !templateName) {
            return NextResponse.json({ message: "Recipient and template name are required" }, { status: 400 });
        }

        const result = await AppMailer(workspaceId, {
            to,
            subject: subject || "Test Email from Mailer Library",
            templateName,
            templateData: templateData || {}
        });

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error("[MAILER_SEND_TEST_ERROR]", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
