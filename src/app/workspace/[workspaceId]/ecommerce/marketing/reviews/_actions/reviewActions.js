'use server'

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { revalidatePath } from "next/cache";

export async function getReviews(workspaceId) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const reviews = await db.eCommerceReview.findMany({
            where: {
                product: { user: { id: workspaceId } }
            },
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        imageUrls: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: reviews };
    } catch (error) {
        console.error("GET_REVIEWS_ERROR", error);
        return { success: false, error: "Failed to fetch reviews" };
    }
}

export async function updateReviewStatus(reviewId, status) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const review = await db.eCommerceReview.update({
            where: { id: reviewId },
            data: { status }
        });
        revalidatePath(`/workspace/${session.user.userId}/ecommerce/marketing/reviews`);
        return { success: true, data: review };
    } catch (error) {
        return { success: false, error: "Failed to update review status" };
    }
}

export async function deleteReview(reviewId) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        await db.eCommerceReview.delete({ where: { id: reviewId } });
        revalidatePath(`/workspace/${session.user.userId}/ecommerce/marketing/reviews`);
        return { success: true, message: "Review deleted" };
    } catch (error) {
        return { success: false, error: "Failed to delete review" };
    }
}
