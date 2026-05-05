'use server'

import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { symmetricEncrypt } from "@/lib/encryption";
import crypto from "crypto";

function generateApiKey() {
    return 'eco_' + crypto.randomBytes(24).toString('hex');
}

const CreateStore = z.object({
    workspaceId: z.string(),
    formData: z.object({
        name: z.string().min(1, "Name is required"),
        slug: z.string().min(1, "Slug is required"),
        description: z.string().optional(),
        platform: z.string().min(1, "Platform is required"),
        storeUrl: z.string().min(1, "Store URL is required"),
        logo: z.string().optional(),
        currency: z.string().optional(),
        timezone: z.string().optional(),
        accessToken: z.string().optional(),
        apiKey: z.string().optional(),
        apiSecret: z.string().optional(),
        paymentOptions: z.object({
            card: z.boolean().optional(),
            upi: z.boolean().optional(),
            netbanking: z.boolean().optional(),
            cod: z.boolean().optional(),
        }).optional(),
        codMinAmount: z.number().optional(),
        codMaxAmount: z.number().optional(),

        // Shipping
        defaultShippingCost: z.number().optional(),
        freeShippingThreshold: z.number().nullable().optional(),
        shippingMethod: z.string().optional(),

        // Tax
        taxPercentage: z.number().optional(),
        taxInclusive: z.boolean().optional(),

        // Order
        autoFulfillOrders: z.boolean().optional(),
        orderPrefix: z.string().optional(),
        sendConfirmationEmail: z.boolean().optional(),

        // Inventory
        trackInventory: z.boolean().optional(),
        lowStockThreshold: z.number().optional(),

        // Checkout
        guestCheckout: z.boolean().optional(),
        requirePhone: z.boolean().optional(),
        requireAddress: z.boolean().optional(),

        // Notifications
        orderEmailAlerts: z.boolean().optional(),
        lowStockAlerts: z.boolean().optional(),

        // Sync
        syncInterval: z.number().optional(),
        webhooksEnabled: z.boolean().optional(),
    }),
});

const handler = async (data) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return { error: "Unauthorized" };
        }

        const { workspaceId, formData } = data;
        const userId = session.user.userId;

        if (!userId) {
            console.error("[CREATE_STORE] userId missing from session");
            return { error: "User session incomplete. Please log in again." };
        }

        // Diagnostic check: Verify user exists in DB to prevent P2003
        const userExists = await db.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });

        if (!userExists) {
            console.error(`[CREATE_STORE] User ID ${userId} not found in database. This will cause a foreign key violation.`);
            return { error: "User account not found. Please try logging out and back in." };
        }

        const existingDefault = await db.eCommerceStore.findFirst({
            where: { userId, isDefault: true }
        });

        const apiKey = generateApiKey();
        const encryptedApiKey = symmetricEncrypt(apiKey);

        const store = await db.eCommerceStore.create({
            data: {
                userId,
                name: formData.name,
                slug: formData.slug.toLowerCase().trim(),
                description: formData.description || null,
                platform: formData.platform,
                storeUrl: formData.storeUrl,
                logo: formData.logo || null,
                currency: formData.currency || "INR",
                timezone: formData.timezone || "Asia/Kolkata",
                isDefault: !existingDefault,
                accessToken: formData.accessToken || null,
                apiKey: formData.apiKey || encryptedApiKey,
                apiSecret: formData.apiSecret || null,
                status: "connected",
                paymentOptions: formData.paymentOptions || { card: true, upi: true, netbanking: true, cod: true },
                codMinAmount: formData.codMinAmount || 0,
                codMaxAmount: formData.codMaxAmount || 5000,

                // Shipping
                defaultShippingCost: formData.defaultShippingCost ?? 0,
                freeShippingThreshold: formData.freeShippingThreshold ?? null,
                shippingMethod: formData.shippingMethod || "flat",

                // Tax
                taxPercentage: formData.taxPercentage ?? 0,
                taxInclusive: formData.taxInclusive ?? false,

                // Order
                autoFulfillOrders: formData.autoFulfillOrders ?? false,
                orderPrefix: formData.orderPrefix || "ORD",
                sendConfirmationEmail: formData.sendConfirmationEmail ?? true,

                // Inventory
                trackInventory: formData.trackInventory ?? true,
                lowStockThreshold: formData.lowStockThreshold ?? 10,

                // Checkout
                guestCheckout: formData.guestCheckout ?? true,
                requirePhone: formData.requirePhone ?? true,
                requireAddress: formData.requireAddress ?? true,

                // Notifications
                orderEmailAlerts: formData.orderEmailAlerts ?? true,
                lowStockAlerts: formData.lowStockAlerts ?? false,

                // Sync
                syncInterval: formData.syncInterval ?? 30,
                webhooksEnabled: formData.webhooksEnabled ?? true,

                metadata: {
                    apiKeyPublic: apiKey.substring(0, 12) + '...',
                    createdAt: new Date().toISOString()
                }
            }
        });

        let category = null;
        try {
            category = await db.category.create({
                data: {
                    name: formData.name,
                    slug: `${formData.slug.toLowerCase().trim()}`,
                    type: "GENERAL",
                    color: "#3b82f6",
                    workspaceId,
                    storeId: store.id
                }
            });
        } catch (catError) {
            console.error("[CREATE_CATEGORY_ERROR]", catError);
        }

        revalidatePath(`/workspace/${workspaceId}/ecommerce/settings`);
        return { data: { store, category, apiKey } };
    } catch (error) {
        console.error("[CREATE_STORE_ERROR]", error);
        return { error: error.message || "Failed to create store" };
    }
};

export const createStore = createSafeAction(CreateStore, handler);