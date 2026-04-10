import { google } from 'googleapis';
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOAuth2Client } from "@/lib/gmail";

// Encryption helper (sync with accounts/route.js logic)
async function encryptTokens(dataObj) {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) return dataObj;
    
    try {
        const crypto = await import('crypto');
        const ALG = 'aes-256-cbc';
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALG, Buffer.from(key, 'hex'), iv);
        let encrypted = cipher.update(JSON.stringify(dataObj));
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return { enc: iv.toString('hex') + ':' + encrypted.toString('hex') };
    } catch (e) {
        console.error("[GMAIL_ENCRYPT_FAILED]", e.message);
        return dataObj;
    }
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');
        const workspaceId = searchParams.get('state'); // Retrieve workspaceId from state

        if (!code || !workspaceId) {
            return NextResponse.json({ message: "Missing code or state" }, { status: 400 });
        }

        const oauth2Client = getOAuth2Client(workspaceId);
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user info to identify the account
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        const email = userInfo.data.email;

        if (!email) {
            throw new Error("Could not retrieve email from Google");
        }

        const { getServerSession } = await import("next-auth/next");
        const { authOptions } = await import("@/app/api/auth/[...nextauth]/options");
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.userId) {
            return NextResponse.json({ message: "Unauthorized callback" }, { status: 401 });
        }

        const userId = session.user.userId;
        const encryptedTokens = await encryptTokens(tokens);

        // Check for existing Gmail/Google credential for this email (Global search)
        const existingCredential = await db.credentials.findFirst({
            where: { 
                platform: { in: ['GMAIL', 'GOOGLE'] }, 
                profile: email 
            }
        });

        if (existingCredential) {
            await db.credentials.update({
                where: { id: existingCredential.id },
                data: {
                    userId, // Update owner to the person who just connected it
                    credentials: encryptedTokens,
                    status: 'connected',
                    expired: false
                }
            });
        } else {
            await db.credentials.create({
                data: {
                    userId,
                    platform: 'GMAIL',
                    profile: email,
                    credentials: encryptedTokens,
                    status: 'connected'
                }
            });
        }

        // Redirect back to the mailbox page
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/workspace/${workspaceId}/productivity/mailbox?success=true`);
    } catch (error) {
        console.error("[GMAIL_OAUTH_CALLBACK_ERROR]", error);
        return NextResponse.json({ message: "Auth failed", error: error.message }, { status: 500 });
    }
}
