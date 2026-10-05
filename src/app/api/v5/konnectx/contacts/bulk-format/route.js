import { db } from "@/lib/db";
import { created, fail, requireUserId } from "../../_lib/helpers";

export const dynamic = "force-dynamic";

function normalizePhone(phone) {
    return String(phone || "").replace(/[\s().-]/g, "");
}

/**
 * POST /api/v5/konnectx/contacts/bulk-format
 *
 * Strips formatting characters from phone numbers.
 *
 * Scoped by the verified caller: the previous version accepted any array of
 * contact ids and rewrote all of them, including other tenants' rows.
 */
export async function POST(request) {
    try {
        const userId = await requireUserId(request);
        const body = await request.json().catch(() => ({}));
        const ids = Array.isArray(body.ids) ? body.ids : [];

        if (!ids.length) {
            return fail("Contact IDs are required", 400);
        }

        const contacts = await db.contact.findMany({
            where: { id: { in: ids }, userId },
            select: { id: true, phone: true }
        });

        let formatted = 0;
        for (const contact of contacts) {
            const clean = normalizePhone(contact.phone);
            if (clean && clean !== contact.phone) {
                formatted += 1;
                await db.contact.update({ where: { id: contact.id }, data: { phone: clean } });
            }
        }

        return created({
            formatted,
            count: formatted,
            skipped: ids.length - contacts.length
        });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/contacts/bulk-format] POST failed:", error);
        return fail(error.message || "Failed to format contacts", 500);
    }
}