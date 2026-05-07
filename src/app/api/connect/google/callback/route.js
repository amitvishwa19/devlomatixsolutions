import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { symmetricEncrypt } from "@/lib/encryption";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const stateBase64 = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
        console.error("[GOOGLE_CONNECT_ERROR]", error);
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/error?message=Google connection failed`);
    }

    if (!code || !stateBase64) {
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/error?message=Invalid request`);
    }

    try {
        const state = JSON.parse(Buffer.from(stateBase64, 'base64').toString());
        const { workspaceId, userId, returnTo } = state;

        const redirectUri = `${process.env.NEXTAUTH_URL}/api/connect/google/callback`;

        // 1. Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_ID,
                client_secret: process.env.GOOGLE_SECRET,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        const tokens = await tokenResponse.json();
        if (!tokenResponse.ok) {
            throw new Error(tokens.error_description || 'Failed to exchange code for tokens');
        }

        // 2. Fetch user profile info
        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const profile = await profileResponse.json();

        // 3. Encrypt and Save to Database
        const details = {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresIn: tokens.expires_in,
            tokenType: tokens.token_type,
            scope: tokens.scope,
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
            email: profile.email,
            name: profile.name,
            picture: profile.picture
        };

        const encryptedDetails = symmetricEncrypt(JSON.stringify(details));

        await db.credentials.upsert({
            where: {
                id: (await db.credentials.findFirst({
                    where: {
                        platform: 'GOOGLE',
                        workspaceId,
                        profile: `Google-${profile.email}`
                    }
                }))?.id || 'placeholder-id-that-wont-match'
            },
            update: {
                credentials: { enc: encryptedDetails },
                status: 'connected',
                userInfo: profile
            },
            create: {
                platform: 'GOOGLE',
                userId,
                workspaceId,
                profile: `Google-${profile.email}`,
                type: 'cloud',
                status: 'connected',
                credentials: { enc: encryptedDetails },
                userInfo: profile
            },
        });

        // 4. Redirect back to the original page with success flag
        const finalRedirect = new URL(`${process.env.NEXTAUTH_URL}${returnTo}`);
        finalRedirect.searchParams.append('googleConnect', 'success');
        return NextResponse.redirect(finalRedirect.toString());

    } catch (error) {
        console.error("[GOOGLE_CALLBACK_EXCEPTION]", error);
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/error?message=${encodeURIComponent(error.message)}`);
    }
}
