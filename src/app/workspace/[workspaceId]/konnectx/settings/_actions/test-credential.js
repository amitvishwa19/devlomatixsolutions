'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { symmetricDecrypt } from "@/lib/encryption";

const TestCredentialSchema = z.object({
    workspaceId: z.string(),
    id: z.string(),
    testNumber: z.string().optional(),
});

const handler = async (data) => {
    const { workspaceId, id, testNumber } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 1. Fetch Credential
        const credential = await db.credentials.findUnique({
            where: { id, userId }
        });

        if (!credential) return { error: "Credential not found" };

        let cloudCreds = null;
        const stored = credential.credentials;
        if (stored) {
            if (typeof stored === 'string' && stored.includes(':')) {
                try { cloudCreds = JSON.parse(symmetricDecrypt(stored)); } catch (e) { }
            } else if (typeof stored === 'object' && stored.enc && typeof stored.enc === 'string' && stored.enc.includes(':')) {
                try { cloudCreds = JSON.parse(symmetricDecrypt(stored.enc)); } catch (e) { }
            } else if (typeof stored === 'object') {
                cloudCreds = stored;
            } else {
                try { cloudCreds = JSON.parse(stored); } catch (e) { }
            }
        }

        if (!cloudCreds || !cloudCreds.accessToken) return { error: "Failed to decrypt or find access token" };

        // 2. If testNumber is provided, send a test message (Hello World)
        if (testNumber) {
            const response = await fetch(
                `https://graph.facebook.com/v17.0/${cloudCreds.phoneNumberId}/messages`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${cloudCreds.accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        messaging_product: "whatsapp",
                        to: testNumber.replace(/\D/g, ''),
                        type: "template",
                        template: {
                            name: "hello_world",
                            language: { code: "en_US" }
                        }
                    })
                }
            );

            const result = await response.json();
            if (!response.ok) {
                return { error: result.error?.message || "Failed to send test message" };
            }
        } else {
            // Just verify the token by fetching WABA info
            const response = await fetch(
                `https://graph.facebook.com/v17.0/${cloudCreds.wabaId}`,
                {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${cloudCreds.accessToken}` }
                }
            );
            if (!response.ok) return { error: "Invalid access token or account info" };
        }

        // 3. Update verified status in database
        await db.credentials.update({
            where: { id },
            data: { verified: true }
        });

        return { success: true };
    } catch (error) {
        return { error: error.message || "Test failed" };
    }
};

export const testCredential = createSafeAction(TestCredentialSchema, handler);
