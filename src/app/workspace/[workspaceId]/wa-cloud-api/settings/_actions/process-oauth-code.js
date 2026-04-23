'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { symmetricEncrypt } from "@/lib/encryption";

const ProcessOauthCodeSchema = z.object({
    workspaceId: z.string(),
    code: z.string(),
});

const handler = async (data) => {
    const { workspaceId, code } = data;

    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appId || !appSecret) {
        return { error: "Facebook App ID or Secret missing in environment variables" };
    }

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 1. Exchange Code for Access Token
        const tokenRes = await fetch(
            `https://graph.facebook.com/v17.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}`,
            { method: 'GET' }
        );
        
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok) {
            return { error: tokenData.error?.message || "Failed to exchange OAuth code" };
        }

        const accessToken = tokenData.access_token;

        // 2. Fetch User's WhatsApp Business Accounts
        // After Embedded Signup, the user's business should be linked.
        // We'll fetch the first available WABA for this user token.
        const debugRes = await fetch(
            `https://graph.facebook.com/v17.0/me/whatsapp_business_accounts?access_token=${accessToken}`,
            { method: 'GET' }
        );
        const debugData = await debugRes.json();

        if (!debugRes.ok || !debugData.data || debugData.data.length === 0) {
            return { error: "No WhatsApp Business Account found for this user account" };
        }

        const waba = debugData.data[0];
        const wabaId = waba.id;

        // 3. Fetch Phone Numbers for this WABA
        const phoneRes = await fetch(
            `https://graph.facebook.com/v17.0/${wabaId}/phone_numbers?access_token=${accessToken}`,
            { method: 'GET' }
        );
        const phoneData = await phoneRes.json();

        if (!phoneRes.ok || !phoneData.data || phoneData.data.length === 0) {
            return { error: "No verified phone numbers found in the selected WhatsApp Business Account" };
        }

        const phone = phoneData.data[0];
        const phoneNumberId = phone.id;

        // 4. Save into Database
        const credentials = {
            accessToken,
            wabaId,
            phoneNumberId
        };
        const encrypted = symmetricEncrypt(JSON.stringify(credentials));

        const account = await db.credentials.upsert({
            where: {
                userId_platform: {
                    userId,
                    platform: 'WHATSAPP_CLOUD'
                }
            },
            update: {
                profileName: 'Auto Setup via Meta',
                credentials: encrypted,
                status: 'connected'
            },
            create: {
                userId,
                platform: 'WHATSAPP_CLOUD',
                profileName: 'Auto Setup via Meta',
                credentials: encrypted,
                status: 'connected'
            }
        });

        return { 
            success: true, 
            accountId: account.id,
            wabaId,
            phoneNumberId
        };

    } catch (error) {
        console.error("[OAuth Process Error]", error);
        return { error: error.message || "Failed to process onboarding" };
    }
};

export const processOauthCode = createSafeAction(ProcessOauthCodeSchema, handler);
