'use server'

import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from "zod";

const GetStoreApiKey = z.object({
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

        if (!store || !store.apiKey) {
            return { error: "Store not found" };
        }

        const decryptedApiKey = symmetricDecrypt(store.apiKey);

        return { 
            data: { 
                apiKey: decryptedApiKey,
                storeName: store.name,
                createdAt: store.metadata?.createdAt,
                regeneratedAt: store.metadata?.apiKeyRegeneratedAt,
            } 
        };
    } catch (error) {
        console.error("[GET_STORE_API_KEY_ERROR]", error);
        return { error: "Failed to get API key" };
    }
};

export async function getStoreApiKey(workspaceId, storeId) {
    return handler({ workspaceId, storeId });
}