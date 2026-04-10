import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const { searchParams } = new URL(req.url);
        const credentialId = searchParams.get('credentialId');

        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId;

        // 1. Fetch the credential to get clientId
        const credential = await db.credentials.findUnique({
            where: { id: credentialId }
        });

        if (!credential || credential.userId !== userId) {
            return NextResponse.json({ message: "Credential not found or unauthorized" }, { status: 404 });
        }

        // Helper to decrypt
        let decrypted = credential.credentials;
        const key = process.env.ENCRYPTION_KEY;
        if (decrypted?.enc && key) {
             const parts = decrypted.enc.split(':');
             const ivBuffer = Buffer.from(parts[0], 'hex');
             const encText = Buffer.from(parts.slice(1).join(':'), 'hex');
             const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), ivBuffer);
             let dec = decipher.update(encText);
             dec = Buffer.concat([dec, decipher.final()]);
             decrypted = JSON.parse(dec.toString());
        }

        const { clientId } = decrypted;
        if (!clientId) {
            return NextResponse.json({ message: "Client ID not found in credentials" }, { status: 400 });
        }

        // 2. PKCE Setup
        const code_verifier = crypto.randomBytes(32).toString('base64url');
        const code_challenge = crypto
            .createHash('sha256')
            .update(code_verifier)
            .digest('base64url');

        // Store verifier in cookie for the callback
        const cookieStore = await cookies();
        cookieStore.set('twitter_oauth_verifier', code_verifier, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 10, // 10 minutes
            sameSite: 'lax',
        });

        // 3. Construct Twitter Authorize URL dynamically based on current host
        const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const baseUrl = `${protocol}://${host}`;
        
        const scope = 'tweet.read tweet.write users.read offline.access';
        const redirect_uri = `${baseUrl}/api/workspace/callback/twitter`;
        const state = `${workspaceId}:${userId}`;

        const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('client_id', clientId);
        authUrl.searchParams.append('redirect_uri', redirect_uri);
        authUrl.searchParams.append('scope', scope);
        authUrl.searchParams.append('state', state);
        authUrl.searchParams.append('code_challenge', code_challenge);
        authUrl.searchParams.append('code_challenge_method', 'S256');

        return NextResponse.redirect(authUrl.toString());
    } catch (error) {
        console.error("[TWITTER_CONNECT_ERROR]", error);
        return NextResponse.json({ message: "Failed to initiate Twitter connection", error: error.message }, { status: 500 });
    }
}
