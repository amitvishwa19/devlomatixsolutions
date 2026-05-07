'use server';

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { testConnection } from "@/lib/cred-manager";
import { symmetricEncrypt } from "@/lib/encryption";
import { revalidatePath } from "next/cache";

async function getUserId() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.userId) {
        throw new Error("Unauthorized");
    }
    return session.user.userId;
}

function encryptCredentials(data) {
    try {
        const encrypted = symmetricEncrypt(JSON.stringify(data));
        return { enc: encrypted };
    } catch (e) {
        return data;
    }
}

/**
 * Test Social Media Connection
 */
export async function testSocialAction(workspaceId, accountId, platform, formData) {
    try {
        await getUserId(); 
        const result = await testConnection(platform, formData);

        if (accountId && accountId !== 'new') {
            await db.credentials.update({
                where: { id: accountId },
                data: {
                    status: result.success ? 'connected' : 'error',
                    userInfo: result.success ? JSON.parse(JSON.stringify(result.data)) : undefined
                }
            });
        }

        return {
            success: result.success,
            message: result.message,
            data: result.data
        };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

/**
 * Save Social Media Credentials
 */
export async function saveSocialAction(workspaceId, accountId, platform, formData) {
    try {
        const userId = await getUserId();
        const { profileName, ...details } = formData;
        
        const credentialsToStore = encryptCredentials(details);

        const data = {
            platform: platform.toUpperCase(),
            userId,
            workspaceId,
            profile: profileName || `${platform} Account`,
            type: 'social',
            status: 'connected',
            credentials: credentialsToStore,
        };

        let result;
        if (accountId && accountId !== 'new') {
            result = await db.credentials.update({
                where: { id: accountId },
                data
            });
        } else {
            result = await db.credentials.create({ data });
        }

        revalidatePath(`/workspace/${workspaceId}/system`);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

/**
 * Delete Social Media Credentials
 */
export async function deleteSocialAction(workspaceId, accountId) {
    try {
        await getUserId();
        await db.credentials.delete({ where: { id: accountId } });
        revalidatePath(`/workspace/${workspaceId}/system`);
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}
