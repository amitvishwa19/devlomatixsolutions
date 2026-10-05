import { db } from "@/lib/db";
import { created, fail, requireUserId } from "../../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * POST /api/v5/konnectx/contacts/bulk-category
 *
 * Recategorises contacts. Scoped to the verified caller so a caller cannot
 * rewrite another tenant's contacts by passing their ids.
 */
export async function POST(request) {
    try {
        const userId = await requireUserId(request);
        const body = await request.json().catch(() => ({}));

        const contactIds = Array.isArray(body.contactIds) ? body.contactIds : [];
        const category = body.category;

        if (!contactIds.length || !category) {
            return fail("Contact IDs and category are required", 400);
        }

        const result = await db.contact.updateMany({
            where: { id: { in: contactIds }, userId },
            data: { type: category }
        });

        return created({ count: result.count });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/contacts/bulk-category] POST failed:", error);
        return fail(error.message || "Failed to update category", 500);
    }
}