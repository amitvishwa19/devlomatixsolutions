import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { testConnection } from "@/lib/cred-manager";

// POST /api/workspace/[workspaceId]/social/accounts/[accountId]/test
export async function POST(req, { params }) {
    try {
        const { workspaceId, accountId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Check if credentials were provided in the body (for testing before saving)
        const body = await req.json().catch(() => ({}));
        let decryptedCredentials = body.credentials;

        if (!decryptedCredentials) {
            // Fetch the credential from DB
            const credential = await db.credentials.findUnique({
                where: { id: accountId }
            });

            if (!credential) {
                return NextResponse.json({ message: "Credential not found" }, { status: 404 });
            }

            decryptedCredentials = credential.credentials;

            // Decrypt the credentials if encrypted
            if (decryptedCredentials?.enc && typeof decryptedCredentials.enc === 'string') {
                const key = process.env.ENCRYPTION_KEY;
                if (key) {
                    try {
                        const crypto = require('crypto');
                        const parts = decryptedCredentials.enc.split(':');
                        const ivBuffer = Buffer.from(parts[0], 'hex');
                        const encText = Buffer.from(parts.slice(1).join(':'), 'hex');
                        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), ivBuffer);
                        let decrypted = decipher.update(encText);
                        decrypted = Buffer.concat([decrypted, decipher.final()]);
                        decryptedCredentials = JSON.parse(decrypted.toString());
                    } catch (e) {
                        console.error("[TEST_DECRYPT_FAILED]", e.message);
                    }
                }
            }
        }

        // Run the platform-specific test
        // Use either the provided accountId's platform from DB, or a platform passed in the body
        const targetPlatform = body.platform || (await db.credentials.findUnique({ where: { id: accountId } }))?.platform;
        const result = await testConnection(targetPlatform, decryptedCredentials || {});

        // Update the credential status in DB based on result
        const newStatus = result.success ? 'connected' : 'error';
        const newExpired = !result.success && result.message?.toLowerCase().includes('expired');

        await db.credentials.update({
            where: { id: accountId },
            data: {
                status: newStatus,
                expired: newExpired,
            }
        });

        return NextResponse.json({
            success: result.success,
            message: result.message,
            status: newStatus,
            expired: newExpired,
            data: result.data // Include raw error data for debugging
        });
    } catch (error) {
        console.error("[TEST_CONNECTION_ERROR]", error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
