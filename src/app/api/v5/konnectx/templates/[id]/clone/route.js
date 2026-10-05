import { db } from "@/lib/db";
import { ok, fail, requireUserId } from "../../../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * POST /api/v5/konnectx/templates/[id]/clone
 *
 * Duplicates a template into the caller's library as an editable DRAFT.
 *
 * The copy deliberately drops approval state and Meta identifiers: a clone is
 * a starting point for a new submission, and reusing the source's Meta ID
 * would collide on the next sync.
 */
export async function POST(request, { params }) {
    try {
        const userId = await requireUserId(request);
        const { id } = await params;

        if (!id) return fail("Template id is required", 400);

        const source = await db.messageTemplate.findFirst({
            where: {
                id,
                OR: [
                    { userId },
                    { sharedWith: { some: { sharedWithUserId: userId } } },
                    { isDefault: true }
                ]
            }
        });

        if (!source) return fail("Template not found", 404);

        const copyName = `${source.name}_copy`.slice(0, 240);

        const clone = await db.messageTemplate.create({
            data: {
                userId,
                name: copyName,
                templateId: null,
                approved: false,
                category: source.category,
                language: source.language,
                type: source.type,
                body: source.body,
                header: source.header,
                footer: source.footer,
                buttons: source.buttons ?? undefined,
                status: "DRAFT",
                isDefault: false,
                platform: source.platform,
                phoneNumberId: source.phoneNumberId,
                // Carry the group across so a clone lands in the same folder,
                // but never the source's Meta ids or approval flags.
                metadata: (() => {
                    const meta =
                        source.metadata && typeof source.metadata === "object"
                            ? { ...source.metadata }
                            : {};
                    delete meta.templateId;
                    delete meta.status;
                    delete meta.rejectedReason;
                    meta.clonedFrom = source.id;
                    return meta;
                })()
            }
        });

        return ok({ template: clone });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/templates/[id]/clone] POST failed:", error);
        return fail(error.message || "Failed to clone template", 500);
    }
}