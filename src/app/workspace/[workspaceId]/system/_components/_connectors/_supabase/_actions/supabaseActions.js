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
 * Test Supabase Connection
 */
export async function testSupabaseAction(workspaceId, accountId, formData) {
    try {
        await getUserId(); 
        const result = await testConnection('SUPABASE', formData);

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
 * Save Supabase Credentials
 */
export async function saveSupabaseAction(workspaceId, accountId, formData) {
    try {
        const userId = await getUserId();
        const { profileName, ...details } = formData;
        
        // Use service-role name if available to distinguish in lists
        const finalProfileName = profileName || (details.supabaseServiceKey ? 'Supabase (Admin)' : 'Supabase (Public)');
        
        const credentialsToStore = encryptCredentials(details);

        const data = {
            platform: 'SUPABASE',
            userId,
            workspaceId,
            profile: finalProfileName,
            type: 'cloud',
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
 * Delete Supabase Credentials
 */
export async function deleteSupabaseAction(workspaceId, accountId) {
    try {
        await getUserId();
        await db.credentials.delete({ where: { id: accountId } });
        revalidatePath(`/workspace/${workspaceId}/system`);
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}
