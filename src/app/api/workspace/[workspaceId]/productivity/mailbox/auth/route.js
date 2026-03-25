import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getOAuth2Client } from "@/lib/gmail";

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const oauth2Client = getOAuth2Client(workspaceId);

        const scopes = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/gmail.modify',
            'https://www.googleapis.com/auth/gmail.send'
        ];

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent select_account',
            state: workspaceId 
        });

        console.log(`[GMAIL_AUTH_DEBUG] Redirecting to: ${authUrl}`);
        console.log(`[GMAIL_AUTH_DEBUG] Using Client ID: ${process.env.GOOGLE_ID}`);
        
        return NextResponse.redirect(authUrl);
    } catch (error) {
        console.error("[GMAIL_AUTH_INIT]", error);
        return NextResponse.json({ message: "Failed to initiate auth" }, { status: 500 });
    }
}
