'use server';

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { symmetricDecrypt } from "@/lib/encryption";

async function getUserId() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.userId) {
        throw new Error("Unauthorized");
    }
    return session.user.userId;
}

/**
 * Fetch all credentials for the current workspace
 */
export async function fetchCredentialsAction(workspaceId) {
    try {
        const userId = await getUserId();

        const credentials = await db.credentials.findMany({
            where: {
                workspaceId,
                OR: [
                    { userId },
                    { platform: { in: ['GMAIL', 'gmail', 'Gmail', 'GOOGLE', 'google', 'Google'] } }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        return credentials.map(c => {
            let decryptedData = c.credentials;
            if (c.credentials?.enc) {
                try {
                    decryptedData = JSON.parse(symmetricDecrypt(c.credentials.enc));
                } catch (e) {
                    console.error("[DECRYPT_FAILED]", e.message);
                }
            }

            return {
                id: c.id,
                platform: c.platform,
                type: c.type,
                profileName: c.profile || decryptedData?.profileName || `${c.platform} Account`,
                profileImage: c.avatar || null,
                avatar: c.avatar,
                userInfo: c.userInfo,
                status: c.status,
                expired: c.expired,
                expiresAt: c.expiresAt,
                environment: c.environment,
                details: decryptedData
            };
        });
    } catch (error) {
        console.error("[FETCH_CREDENTIALS_ERROR]", error.message);
        return [];
    }
}
export async function deleteCredentialAction(workspaceId, credentialId) {
    try {
        const userId = await getUserId();
        
        await db.credentials.delete({
            where: {
                id: credentialId,
                workspaceId,
                // userId // Optional: restricted to owner or workspace admin
            }
        });

        return { success: true };
    } catch (error) {
        console.error("[DELETE_CREDENTIAL_ERROR]", error.message);
        return { success: false, message: error.message };
    }
}
