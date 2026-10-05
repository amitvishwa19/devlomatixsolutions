import { db } from "@/lib/db";
import { created, fail, requireUserId } from "../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * POST /api/v5/konnectx/bulk-sender
 *
 * Creates a broadcast campaign and enqueues its recipients.
 *
 * Scoping added after the original implementation ran fully unauthenticated:
 * the sender account and the group members are now resolved against the
 * verified caller, so a caller cannot broadcast as another tenant's account or
 * harvest the phone numbers behind a group id they do not own.
 */
export async function POST(request) {
    try {
        const userId = await requireUserId(request);
        const body = await request.json().catch(() => ({}));

        if (!body.name || !String(body.name).trim()) {
            return fail("Campaign name is required", 400);
        }

        if (!body.templateId && !body.messageTemplate) {
            return fail("Select a template or provide a message", 400);
        }

        const { searchParams } = new URL(request.url);
        const requestedCredentialId =
            body.credentialId ||
            body.credential_id ||
            searchParams.get("credentialId") ||
            searchParams.get("credential_id") ||
            null;

        // An explicit credential id that belongs to somebody else resolves to
        // the caller's own default instead of another tenant's account.
        const credential = await db.credentials.findFirst({
            where: {
                userId,
                platform: "WHATSAPP_CLOUD",
                ...(requestedCredentialId ? { id: requestedCredentialId } : {})
            },
            orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }]
        });

        const recipients = Array.isArray(body.recipients)
            ? body.recipients.filter((recipient) => recipient?.phone)
            : [];

        const groupIds = Array.isArray(body.groupIds) ? body.groupIds : [];

        // Group contacts are scoped to the caller — an unowned group id now
        // contributes nothing instead of leaking phone numbers.
        const groupContacts = groupIds.length
            ? await db.contact.findMany({
                where: {
                    userId,
                    groups: { some: { id: { in: groupIds } } }
                },
                select: { phone: true }
            })
            : [];

        const phones = new Map();
        for (const recipient of recipients) {
            phones.set(recipient.phone, {
                phone: recipient.phone,
                variables: recipient.variables || {},
                status: "PENDING"
            });
        }
        for (const contact of groupContacts) {
            if (contact.phone && !phones.has(contact.phone)) {
                phones.set(contact.phone, { phone: contact.phone, variables: {}, status: "PENDING" });
            }
        }

        const queued = [...phones.values()];
        if (queued.length === 0) {
            return fail("Select at least one contact or group", 400);
        }

        const campaign = await db.campaign.create({
            data: {
                userId,
                name: String(body.name).trim(),
                status: body.status || (body.scheduledAt ? "SCHEDULED" : "RUNNING"),
                messageType: body.messageType || "text",
                messageTemplate: body.messageTemplate || {},
                templateId: body.templateId || null,
                scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
                credentialId: credential?.id || null,
                recipients: {
                    create: queued
                }
            },
            include: { recipients: true }
        });

        return created({ campaign, queued: queued.length }, 201);
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/bulk-sender] POST failed:", error);
        return fail(error.message || "Failed to send broadcast", 500);
    }
}