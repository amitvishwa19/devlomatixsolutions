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
 * Test Google Connection
 */
export async function testGoogleAction(workspaceId, accountId, formData) {
    try {
        await getUserId(); 
        const result = await testConnection('GOOGLE', formData);

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
 * Save Google Credentials
 */
export async function saveGoogleAction(workspaceId, accountId, formData) {
    try {
        const userId = await getUserId();
        const { profileName, ...details } = formData;
        
        const credentialsToStore = encryptCredentials(details);

        const data = {
            platform: 'GOOGLE',
            userId,
            workspaceId,
            profile: profileName || 'Google Account',
            type: 'cloud',
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
 * Delete Google Credentials
 */
export async function deleteGoogleAction(workspaceId, accountId) {
    try {
        await getUserId();
        await db.credentials.delete({ where: { id: accountId } });
        revalidatePath(`/workspace/${workspaceId}/system`);
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}
