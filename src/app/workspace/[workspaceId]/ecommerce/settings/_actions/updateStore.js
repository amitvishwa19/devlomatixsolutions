'use server'

import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const UpdateStore = z.object({
    workspaceId: z.string(),
    storeId: z.string(),
    formData: z.object({
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        platform: z.string().optional(),
        storeUrl: z.string().optional(),
        logo: z.string().optional(),
        currency: z.string().optional(),
        timezone: z.string().optional(),
        isDefault: z.boolean().optional(),
        accessToken: z.string().optional(),
        apiKey: z.string().optional(),
        apiSecret: z.string().optional(),
        status: z.string().optional(),
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

        const { workspaceId, storeId, formData } = data;
        const userId = session.user.userId;

        const existingStore = await db.eCommerceStore.findFirst({
            where: { id: storeId, userId }
        });

        if (!existingStore) {
            return { error: "Store not found" };
        }

        if (formData.isDefault) {
            await db.eCommerceStore.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false }
            });
        }

        const updateData = {};
        if (formData.name !== undefined) {
            updateData.name = formData.name;
            if (existingStore.name !== formData.name) {
                // Sync the root store category name
                try {
                    await db.category.updateMany({
                        where: { storeId: storeId, type: "STORE" },
                        data: { name: formData.name }
                    });
                } catch (catErr) {
                    console.error("[SYNC_CATEGORY_NAME_ERROR]", catErr);
                }
            }
        }
        if (formData.slug !== undefined) updateData.slug = formData.slug.toLowerCase().trim();
        if (formData.description !== undefined) updateData.description = formData.description || null;
        if (formData.platform !== undefined) updateData.platform = formData.platform;
        if (formData.storeUrl !== undefined) updateData.storeUrl = formData.storeUrl;
        if (formData.logo !== undefined) updateData.logo = formData.logo || null;
        if (formData.currency !== undefined) updateData.currency = formData.currency;
        if (formData.timezone !== undefined) updateData.timezone = formData.timezone;
        if (formData.isDefault !== undefined) updateData.isDefault = formData.isDefault;
        if (formData.accessToken !== undefined) updateData.accessToken = formData.accessToken || null;
        if (formData.apiKey !== undefined) updateData.apiKey = formData.apiKey || null;
        if (formData.apiSecret !== undefined) updateData.apiSecret = formData.apiSecret || null;
        if (formData.status !== undefined) updateData.status = formData.status;
        if (formData.paymentOptions !== undefined) updateData.paymentOptions = formData.paymentOptions;
        if (formData.codMinAmount !== undefined) updateData.codMinAmount = formData.codMinAmount;
        if (formData.codMaxAmount !== undefined) updateData.codMaxAmount = formData.codMaxAmount;
        
        // Shipping
        if (formData.defaultShippingCost !== undefined) updateData.defaultShippingCost = formData.defaultShippingCost;
        if (formData.freeShippingThreshold !== undefined) updateData.freeShippingThreshold = formData.freeShippingThreshold;
        if (formData.shippingMethod !== undefined) updateData.shippingMethod = formData.shippingMethod;
        
        // Tax
        if (formData.taxPercentage !== undefined) updateData.taxPercentage = formData.taxPercentage;
        if (formData.taxInclusive !== undefined) updateData.taxInclusive = formData.taxInclusive;
        
        // Order
        if (formData.autoFulfillOrders !== undefined) updateData.autoFulfillOrders = formData.autoFulfillOrders;
        if (formData.orderPrefix !== undefined) updateData.orderPrefix = formData.orderPrefix;
        if (formData.sendConfirmationEmail !== undefined) updateData.sendConfirmationEmail = formData.sendConfirmationEmail;
        
        // Inventory
        if (formData.trackInventory !== undefined) updateData.trackInventory = formData.trackInventory;
        if (formData.lowStockThreshold !== undefined) updateData.lowStockThreshold = formData.lowStockThreshold;
        
        // Checkout
        if (formData.guestCheckout !== undefined) updateData.guestCheckout = formData.guestCheckout;
        if (formData.requirePhone !== undefined) updateData.requirePhone = formData.requirePhone;
        if (formData.requireAddress !== undefined) updateData.requireAddress = formData.requireAddress;
        
        // Notifications
        if (formData.orderEmailAlerts !== undefined) updateData.orderEmailAlerts = formData.orderEmailAlerts;
        if (formData.lowStockAlerts !== undefined) updateData.lowStockAlerts = formData.lowStockAlerts;
        
        // Sync
        if (formData.syncInterval !== undefined) updateData.syncInterval = formData.syncInterval;
        if (formData.webhooksEnabled !== undefined) updateData.webhooksEnabled = formData.webhooksEnabled;

        const store = await db.eCommerceStore.update({
            where: { id: storeId },
            data: updateData
        });

        revalidatePath(`/workspace/${workspaceId}/ecommerce/settings`);
        return { data: { store } };
    } catch (error) {
        console.error("[UPDATE_STORE_ERROR]", error);
        return { error: error.message || "Failed to update store" };
    }
};

export const updateStore = createSafeAction(UpdateStore, handler);