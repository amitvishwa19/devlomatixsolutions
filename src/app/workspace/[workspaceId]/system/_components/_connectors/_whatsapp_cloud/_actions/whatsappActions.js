'use server';

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { testConnection } from "@/lib/cred-manager";
import { symmetricEncrypt } from "@/lib/encryption";
import { revalidatePath } from "next/cache";

/**
 * Helper to get the current user ID
 */
async function getUserId() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.userId) {
        throw new Error("Unauthorized");
    }
    return session.user.userId;
}

/**
 * Helper to encrypt credentials
 */
function encryptCredentials(data) {
    try {
        const encrypted = symmetricEncrypt(JSON.stringify(data));
        return { enc: encrypted };
    } catch (e) {
        return data;
    }
}

/**
 * Test WhatsApp Cloud Connection
 */
export async function testWhatsAppCloudAction(workspaceId, accountId, formData) {
    try {
        await getUserId(); 

        const result = await testConnection('WHATSAPP', formData);

        if (accountId && accountId !== 'new') {
            const newStatus = result.success ? 'connected' : 'error';
            const newExpired = !result.success && result.message?.toLowerCase().includes('expired');

            const updateData = {
                status: newStatus,
                expired: newExpired,
            };

            if (result.success && result.data) {
                if (result.data.profileName) updateData.profile = result.data.profileName;
                if (result.data.profileImage) updateData.avatar = result.data.profileImage;
                updateData.userInfo = JSON.parse(JSON.stringify(result.data));
            }

            await db.credentials.update({
                where: { id: accountId },
                data: updateData
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
 * Save WhatsApp Cloud Credentials
 */
export async function saveWhatsAppCloudAction(workspaceId, accountId, formData) {
    try {
        const userId = await getUserId();

        const { profileName, ...details } = formData;
        const credentialsToStore = encryptCredentials({ ...details, profileName });

        const data = {
            platform: 'WHATSAPP_CLOUD',
            userId,
            workspaceId,
            profile: profileName || 'WHATSAPP_CLOUD',
            type: 'other',
            status: 'connected',
            credentials: credentialsToStore,
        };

        let result;
        if (accountId && accountId !== 'new' && accountId) {
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
 * Delete WhatsApp Cloud Credentials
 */
export async function deleteWhatsAppCloudAction(workspaceId, accountId) {
    try {
        await getUserId();

        await db.credentials.delete({
            where: { id: accountId }
        });

        revalidatePath(`/workspace/${workspaceId}/system`);
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}
