'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { symmetricDecrypt } from "@/lib/encryption";
import * as cloudApi from '../../_lib/whatsapp-cloud-api';
import { revalidatePath } from "next/cache";

const DeleteProductSchema = z.object({
    workspaceId: z.string(),
    id: z.string(),
});

const handler = async (data) => {
    const { workspaceId, id } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const product = await db.eCommerceProduct.findUnique({
            where: { id }
        });

        if (!product) throw new Error("Product not found");

        // If synced with Meta, delete from Meta
        if (product.externalProductId) {
            const cred = await db.credentials.findFirst({
                where: { userId, platform: 'WHATSAPP_CLOUD' },
                orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }]
            }).catch(() => null);

            if (cred?.credentials) {
                let decrypted = null;
                const stored = cred.credentials;
                if (typeof stored === 'string' && stored.includes(':')) {
                    try { decrypted = JSON.parse(symmetricDecrypt(stored)); } catch (e) { }
                } else if (typeof stored === 'string') {
                    try { decrypted = JSON.parse(stored); } catch (e) { }
                } else {
                    decrypted = stored;
                }

                if (decrypted?.accessToken) {
                    await cloudApi.deleteCatalogProductMeta(decrypted, product.externalProductId).catch(err => {
                        console.warn("[deleteProduct] Meta delete failed:", err);
                    });
                }
            }
        }

        await db.eCommerceProduct.delete({
            where: { id }
        });

        revalidatePath(`/workspace/${workspaceId}/konnectx/catalog`);
        return { data: { success: true } };

    } catch (error) {
        console.error("[deleteProduct] Error:", error);
        return { error: error.message || "Failed to delete product" };
    }
};

export const deleteProduct = createSafeAction(DeleteProductSchema, handler);
