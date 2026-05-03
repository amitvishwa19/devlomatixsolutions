'use server'

import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { symmetricEncrypt } from "@/lib/encryption";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import crypto from "crypto";

function generateApiKey() {
    return 'eco_' + crypto.randomBytes(24).toString('hex');
}

const RegenerateApiKey = z.object({
    workspaceId: z.string(),
    storeId: z.string(),
});

const handler = async (data) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return { error: "Unauthorized" };
        }

        const { workspaceId, storeId } = data;
        const userId = session.user.userId;

        const store = await db.eCommerceStore.findFirst({
            where: { id: storeId, userId }
        });

        if (!store) {
            return { error: "Store not found" };
        }

        const newApiKey = generateApiKey();
        const encryptedApiKey = symmetricEncrypt(newApiKey);

        await db.eCommerceStore.update({
            where: { id: storeId },
            data: {
                apiKey: encryptedApiKey,
                metadata: {
                    ...store.metadata,
                    apiKeyPublic: newApiKey.substring(0, 12) + '...',
                    apiKeyRegeneratedAt: new Date().toISOString()
                }
            }
        });

        revalidatePath(`/workspace/${workspaceId}/ecommerce/settings`);
        return { data: { apiKey: newApiKey } };
    } catch (error) {
        console.error("[REGENERATE_API_KEY_ERROR]", error);
        return { error: "Failed to regenerate API key" };
    }
};

export const regenerateApiKey = createSafeAction(RegenerateApiKey, handler);