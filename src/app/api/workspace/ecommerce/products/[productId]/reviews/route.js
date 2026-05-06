import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/workspace/ecommerce/products/[productId]/reviews
export async function GET(req, { params }) {
    try {
        const { productId } = await params;
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 50;

        const reviews = await db.eCommerceReview.findMany({
            where: {
                productId,
                status: "approved" // Only fetch approved reviews for the storefront
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit
        });

        // Calculate average rating
        const allReviews = await db.eCommerceReview.findMany({
            where: { productId, status: "approved" },
            select: { rating: true }
        });

        let averageRating = 0;
        if (allReviews.length > 0) {
            averageRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
        }

        return NextResponse.json({
            success: true,
            reviews,
            totalReviews: allReviews.length,
            averageRating: parseFloat(averageRating.toFixed(1))
        });
    } catch (error) {
        console.error("[GET_REVIEWS_ERROR]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// POST /api/workspace/ecommerce/products/[productId]/reviews
export async function POST(req, { params }) {
    try {
        const { productId } = await params;
        const body = await req.json();
        const { rating, title, comment, customerName, customerEmail } = body;

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ message: "Valid rating between 1 and 5 is required" }, { status: 400 });
        }

        const review = await db.eCommerceReview.create({
            data: {
                productId,
                rating,
                title: title || null,
                comment: comment || null,
                customerName: customerName || "Anonymous",
                customerEmail: customerEmail || null,
                status: "pending" // Requires manual approval by default to prevent spam
            }
        });

        return NextResponse.json({ success: true, review });
    } catch (error) {
        console.error("[POST_REVIEW_ERROR]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
