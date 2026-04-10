import { NextResponse } from "next/server";
import { AppMailer } from "@/utils/AppMailer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { templateName, testEmail, testFromEmail } = await req.json();
        
        if (!templateName) {
            return NextResponse.json({ message: "Template name is required" }, { status: 400 });
        }

        const targetEmail = testEmail || session.user.email;

        // Dummy data for test rendering
        const dummyData = {
            name: session.user.name || "Test User",
            userName: session.user.name || "Test User",
            boardTitle: "Test Board Alpha",
            type: "create",
            boardUrl: "https://devlomatix.online",
            workspaceName: "My Awesome Workspace",
            inviteUrl: "https://devlomatix.online/invite",
            jobTitle: "Senior Developer",
            companyName: "Devlomatix",
            location: "Remote",
            subject: "Test Broadcast from System"
        };

        const result = await AppMailer(workspaceId, {
            to: targetEmail,
            subject: "[TEST] Email Template Verification",
            templateName: templateName,
            templateData: dummyData,
            from: testFromEmail || null
        });

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error("[MAILER_TEST_POST]", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
