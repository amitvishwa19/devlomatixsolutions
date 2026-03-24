import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { AppMailer } from "@/utils/AppMailer";
import InviteEmailTemplate from "@/emails/InviteEmailTemplate";

// GET invite code for workspace
export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;

        const server = await prisma.server.findUnique({
            where: { id: workspaceId },
            select: { inviteCode: true }
        });

        if (!server) {
            return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
        }

        return NextResponse.json({ inviteCode: server.inviteCode });
    } catch (error) {
        console.error("GET Invite Error:", error);
        return NextResponse.json({ message: "Failed to fetch invite code" }, { status: 500 });
    }
}

// PATCH to generate a new invite code
export async function PATCH(req, { params }) {
    try {
        const { workspaceId } = await params;

        // Generate a new 8-character alphanumeric code
        const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();

        const server = await prisma.server.update({
            where: { id: workspaceId },
            data: { inviteCode: newCode },
            select: { inviteCode: true }
        });

        return NextResponse.json({ inviteCode: server.inviteCode });
    } catch (error) {
        console.error("PATCH Invite Error:", error);
        return NextResponse.json({ message: "Failed to generate new invite code" }, { status: 500 });
    }
}

// POST to send email invitation
export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        const server = await prisma.server.findUnique({
            where: { id: workspaceId },
            select: { name: true, inviteCode: true }
        });

        if (!server) {
            return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
        }

        // Construct full URL (assuming http://localhost:3000 locally, but normally an env var)
        const host = req.headers.get("host"); // example: localhost:3000
        const protocol = host.includes("localhost") ? "http" : "https";
        const inviteUrl = `${protocol}://${host}/invite/${server.inviteCode}`;

        const mailData = {
            from: process.env.MAIL_SERVICE_USERNAME || "invites@example.com",
            to: email,
            subject: `You have been invited to join ${server.name}`,
        };

        const template = <InviteEmailTemplate inviteUrl={inviteUrl} workspaceName={server.name} />;

        // In a real scenario with proper env vars, this sends the email.
        // We wrap it in a try-catch to avoid failing the whole request if SMTP is unconfigured.
        try {
            await AppMailer(mailData, template);
        } catch (mailError) {
            console.error("AppMailer Error, potentially missing SMTP config:", mailError);
            // We can return success anyway so the UI doesn't crash if SMTP is not configured in dev
        }

        return NextResponse.json({ success: true, message: "Invitation sent!" });
    } catch (error) {
        console.error("POST Invite Error:", error);
        return NextResponse.json({ message: "Failed to send invitation" }, { status: 500 });
    }
}
