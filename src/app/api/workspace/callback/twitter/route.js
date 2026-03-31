import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

// Encryption helper (sync with accounts/route.js logic)
async function encryptTokens(dataObj) {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) return dataObj;

    try {
        const ALG = 'aes-256-cbc';
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALG, Buffer.from(key, 'hex'), iv);
        let encrypted = cipher.update(JSON.stringify(dataObj));
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return { enc: iv.toString('hex') + ':' + encrypted.toString('hex') };
    } catch (e) {
        console.error("[TWITTER_ENCRYPT_FAILED]", e.message);
        return dataObj;
    }
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const cookieStore = await cookies();
    const code_verifier = cookieStore.get('twitter_oauth_verifier')?.value;
    
    // state usually contains workspaceId:userId or similar
    const [workspaceId, userId] = (state || "").split(':');

    try {
        const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const baseUrl = `${protocol}://${host}`;

        console.log('[TWITTER_CALLBACK] Received code:', code, 'workspaceId:', workspaceId, 'baseUrl:', baseUrl);

        if (!code || !workspaceId) {
            throw new Error("Missing code or workspaceId in callback");
        }

        if (!code_verifier) {
            throw new Error("Missing PKCE code verifier (cookie expired)");
        }

        // 1. Fetch the credential from DB to get clientId and clientSecret
        const credential = await db.credentials.findFirst({
            where: {
                platform: { in: ['TWITTER', 'X'] },
                // If we don't have userId in state, we might need to rely on workspace or current session
                ...(userId ? { userId } : {})
            },
            orderBy: { updatedAt: 'desc' }
        });

        if (!credential) {
            throw new Error("Twitter credentials (Client ID/Secret) not found in database. Please add them in Credential Manager first.");
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

        const { clientId, clientSecret } = decrypted;
        if (!clientId || !clientSecret) {
            throw new Error("Saved credentials are missing Client ID or Client Secret");
        }

        // 2. Exchange code for tokens
        // Twitter OAuth 2.0 requires Basic Auth header with clientId:clientSecret
        const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        
        const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                grant_type: 'authorization_code',
                client_id: clientId,
                redirect_uri: `${baseUrl}/api/workspace/callback/twitter`,
                code_verifier: code_verifier, 
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('[TWITTER_TOKEN_EXCHANGE_ERROR]', tokenData);
            throw new Error(tokenData.error_description || tokenData.error || "Failed to exchange code for tokens");
        }

        // 3. Update the credential record with the new tokens
        const updatedCredentials = {
            ...decrypted,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: Date.now() + (tokenData.expires_in * 1000),
            token_type: tokenData.token_type,
            scope: tokenData.scope
        };

        const encryptedData = await encryptTokens(updatedCredentials);

        await db.credentials.update({
            where: { id: credential.id },
            data: {
                credentials: encryptedData,
                status: 'connected',
                expired: false
            }
        });

        return NextResponse.redirect(`${baseUrl}/workspace/${workspaceId}/system/credential?success=true`);
    } catch (error) {
        console.error("[TWITTER_OAUTH_CALLBACK_ERROR]", error);
        // We need to re-detect baseUrl here in case error happened before detection
        const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const baseUrl = `${protocol}://${host}`;

        // Redirect back with error
        const redirectUrl = workspaceId 
            ? `${baseUrl}/workspace/${workspaceId}/system/credential?error=${encodeURIComponent(error.message)}`
            : `${baseUrl}/?error=twitter_auth_failed`;
            
        return NextResponse.redirect(redirectUrl);
    }
}
