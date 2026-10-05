import { db } from "@/lib/db";
import { created, fail, requireUserId } from "../../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/v5/konnectx/categories/[id]
 *
 * The route param is a category *name* (the `Contact.type` column). It used to
 * run an unscoped `updateMany`, so deleting a category reset the type of every
 * matching contact in the database, including other tenants'. Scoped now.
 */
export async function DELETE(request, { params }) {
    try {
        const userId = await requireUserId(request);
        const { id: categoryName } = await params;

        if (!categoryName) {
            return fail("Category name is required", 400);
        }

        const result = await db.contact.updateMany({
            where: { type: categoryName, userId },
            data: { type: "CONTACT" }
        });

        return created({
            category: categoryName,
            count: result.count,
            message: `Category "${categoryName}" removed from ${result.count} contacts`
        });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/categories/[id]] DELETE failed:", error);
        return fail(error.message || "Failed to delete category", 500);
    }
}