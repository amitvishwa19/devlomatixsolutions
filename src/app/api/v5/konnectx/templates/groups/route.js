import { db } from "@/lib/db";
import { ok, created, fail, requireUserId } from "../../_lib/helpers";
import { requireWorkspaceMembership } from "../../_lib/workspace";
import {
    parseMetadata,
    loadVisibleTemplates,
    uniqueCategorySlug,
    requireGroup,
    syncGroupMetadata,
    detachGroupFromTemplates
} from "../../_lib/template-groups";

export const dynamic = "force-dynamic";

/**
 * GET /api/v5/konnectx/templates/groups
 *
 * Template groups are `Category` rows with `type: "TEMPLATE"`. Membership is
 * denormalised onto each template's `metadata.groupId`, so the counts come
 * from the caller's visible templates rather than a join.
 */
export async function GET(request) {
    try {
        const userId = await requireUserId(request);
        const { workspaceId } = await requireWorkspaceMembership(request, userId);

        const [groups, templates] = await Promise.all([
            db.category.findMany({
                where: { workspaceId, type: "TEMPLATE" },
                orderBy: { name: "asc" }
            }),
            loadVisibleTemplates(userId)
        ]);

        const counts = new Map();
        for (const template of templates) {
            const groupId = parseMetadata(template.metadata)?.groupId;
            if (groupId) counts.set(groupId, (counts.get(groupId) || 0) + 1);
        }

        return ok({
            groups: groups.map((group) => ({
                ...group,
                templateCount: counts.get(group.id) || 0
            }))
        });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/templates/groups] GET failed:", error);
        return fail(error.message || "Failed to load template groups", 500);
    }
}

/**
 * POST /api/v5/konnectx/templates/groups
 *
 * Creates a group, or updates the one named by `id`.
 */
export async function POST(request) {
    try {
        const userId = await requireUserId(request);
        const body = await request.json().catch(() => ({}));
        const { workspaceId } = await requireWorkspaceMembership(request, userId, body);

        const { id, name, description, color = "#3b82f6" } = body;

        if (!name || !String(name).trim()) return fail("Group name is required", 400);

        const baseSlug =
            String(name)
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "") || "group";

        if (id) {
            await requireGroup(workspaceId, id);

            const slug = await uniqueCategorySlug(workspaceId, `${baseSlug}-tpl`, id);

            const group = await db.category.update({
                where: { id },
                data: {
                    name: String(name).trim(),
                    slug,
                    description: description || null,
                    color,
                    type: "TEMPLATE",
                    workspaceId
                }
            });

            const synced = await syncGroupMetadata(group, userId);

            return created({ group, syncedTemplates: synced });
        }

        const duplicate = await db.category.findFirst({
            where: {
                workspaceId,
                type: "TEMPLATE",
                name: { equals: name, mode: "insensitive" }
            },
            select: { id: true }
        });
        if (duplicate) return fail("A template group with this name already exists", 409);

        const slug = await uniqueCategorySlug(workspaceId, `${baseSlug}-tpl`);

        const group = await db.category.create({
            data: {
                name: String(name).trim(),
                slug,
                description: description || null,
                color,
                type: "TEMPLATE",
                workspaceId
            }
        });

        return created({ group });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/templates/groups] POST failed:", error);
        return fail(error.message || "Failed to save template group", 500);
    }
}

/**
 * DELETE /api/v5/konnectx/templates/groups?id=...
 *
 * Detaches the group from its templates, then deletes it.
 */
export async function DELETE(request) {
    try {
        const userId = await requireUserId(request);
        const { workspaceId } = await requireWorkspaceMembership(request, userId);

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) return fail("Group id is required", 400);

        await requireGroup(workspaceId, id);

        const detached = await detachGroupFromTemplates(id, userId);
        await db.category.delete({ where: { id } });

        return created({ id, detachedTemplates: detached });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/templates/groups] DELETE failed:", error);
        return fail(error.message || "Failed to delete template group", 500);
    }
}