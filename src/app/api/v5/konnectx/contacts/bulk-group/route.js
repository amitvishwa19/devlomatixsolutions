import { db } from "@/lib/db";
import { created, fail, requireUserId } from "../../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * POST /api/v5/konnectx/contacts/bulk-group
 *
 * Adds contacts to a contact group.
 *
 * Both sides are verified: the caller must own every contact being moved and
 * own the target group. The previous version took a bare list of ids, so any
 * caller could attach another tenant's contacts to any group id.
 */
export async function POST(request) {
    try {
        const userId = await requireUserId(request);
        const body = await request.json().catch(() => ({}));

        const contactIds = Array.isArray(body.contactIds) ? body.contactIds : [];
        const groupId = body.groupId;

        if (!contactIds.length || !groupId) {
            return fail("Contact IDs and group ID are required", 400);
        }

        const group = await db.contactGroup.findFirst({
            where: { id: groupId, userId },
            select: { id: true }
        });
        if (!group) return fail("Group not found", 404);

        const contacts = await db.contact.findMany({
            where: { id: { in: contactIds }, userId },
            select: { id: true }
        });

        if (!contacts.length) {
            return fail("No contacts found", 404);
        }

        await db.contact.updateMany({
            where: { id: { in: contacts.map((contact) => contact.id) } },
            data: { groups: { connect: { id: group.id } } }
        });

        return created({
            count: contacts.length,
            skipped: contactIds.length - contacts.length
        });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/contacts/bulk-group] POST failed:", error);
        return fail(error.message || "Failed to add contacts to group", 500);
    }
}