'use server'

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { revalidatePath } from "next/cache";

export async function getCoupons(workspaceId) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const coupons = await db.eCommerceCoupon.findMany({
            where: {
                store: { userId: workspaceId }
            },
            include: {
                store: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: coupons };
    } catch (error) {
        return { success: false, error: "Failed to fetch coupons" };
    }
}

export async function createCoupon(data) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const coupon = await db.eCommerceCoupon.create({
            data: {
                ...data,
                code: data.code.toUpperCase()
            }
        });
        revalidatePath(`/workspace/${session.user.userId}/ecommerce/marketing/coupons`);
        return { success: true, data: coupon };
    } catch (error) {
        console.error("CREATE_COUPON_ERROR", error);
        return { success: false, error: "Failed to create coupon. Code might already exist for this store." };
    }
}

export async function updateCoupon(couponId, data) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const coupon = await db.eCommerceCoupon.update({
            where: { id: couponId },
            data: {
                ...data,
                code: data.code?.toUpperCase()
            }
        });
        revalidatePath(`/workspace/${session.user.userId}/ecommerce/marketing/coupons`);
        return { success: true, data: coupon };
    } catch (error) {
        return { success: false, error: "Failed to update coupon" };
    }
}

export async function deleteCoupon(couponId) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        await db.eCommerceCoupon.delete({ where: { id: couponId } });
        revalidatePath(`/workspace/${session.user.userId}/ecommerce/marketing/coupons`);
        return { success: true, message: "Coupon deleted" };
    } catch (error) {
        return { success: false, error: "Failed to delete coupon" };
    }
}
