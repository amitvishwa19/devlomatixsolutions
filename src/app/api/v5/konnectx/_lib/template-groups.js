import { db } from "@/lib/db";
import { HttpError } from "./workspace";

/**
 * Shared helpers for template groups.
 *
 * A group is a `Category` row with `type: "TEMPLATE"` and a `workspaceId`.
 * Membership has no join table — it is denormalised onto each template's
 * `metadata.groupId` / `groupName` / `groupColor`.
 */

/** Metadata columns are Json but older rows may hold a JSON string. */
export function parseMetadata(value) {
    if (!value) return {};
    if (typeof value === "object") return value;
    if (typeof value === "string" && value.trim().startsWith("{")) {
        try {
            return JSON.parse(value);
        } catch {
            return {};
        }
    }
    return {};
}

/** Templates the caller owns, was shared, or that are system defaults. */
export function visibleTemplatesWhere(userId) {
    return {
        OR: [
            { userId },
            { sharedWith: { some: { sharedWithUserId: userId } } },
            { isDefault: true }
        ]
    };
}

/** Loads the caller's visible templates, metadata only. */
export function loadVisibleTemplates(userId) {
    return db.messageTemplate.findMany({
        where: visibleTemplatesWhere(userId),
        select: { id: true, metadata: true }
    });
}

/**
 * Picks a slug that is free inside the workspace, ignoring `excludeId` so a
 * rename that keeps the same slug does not collide with itself.
 */
export async function uniqueCategorySlug(workspaceId, base, excludeId) {
    let candidate = base;
    let counter = 1;

    // Bounded so a pathological data set cannot spin forever.
    while (counter < 100) {
        const existing = await db.category.findUnique({
            where: { workspaceId_slug: { workspaceId, slug: candidate } },
            select: { id: true }
        });
        if (!existing || existing.id === excludeId) return candidate;
        candidate = `${base}-${counter++}`;
    }

    return `${base}-${Date.now().toString(36)}`;
}

/** Throws 404 unless `id` is a TEMPLATE category inside `workspaceId`. */
export async function requireGroup(workspaceId, id) {
    const group = await db.category.findFirst({
        where: { id, workspaceId, type: "TEMPLATE" }
    });
    if (!group) throw new HttpError("Group not found", 404);
    return group;
}

/**
 * Sets or clears `groupId`/`groupName`/`groupColor` on the given templates.
 * Pass `group: null` to unassign. Only templates visible to `userId` are
 * touched, so a crafted templateId list cannot rewrite someone else's rows.
 */
export async function applyGroupToTemplates({ userId, templateIds, group }) {
    const uniqueIds = [...new Set(templateIds.filter(Boolean))];
    if (!uniqueIds.length) return { count: 0 };

    const templates = await loadVisibleTemplates(userId);
    const byId = new Map(templates.map((t) => [t.id, t]));

    const updates = [];
    for (const templateId of uniqueIds) {
        const template = byId.get(templateId);
        if (!template) continue;

        const meta = parseMetadata(template.metadata);
        if (group) {
            meta.groupId = group.id;
            meta.groupName = group.name;
            meta.groupColor = group.color || "#3b82f6";
        } else {
            delete meta.groupId;
            delete meta.groupName;
            delete meta.groupColor;
        }

        updates.push(
            db.messageTemplate.update({
                where: { id: templateId },
                data: { metadata: meta }
            })
        );
    }

    if (updates.length) await db.$transaction(updates);
    return { count: updates.length };
}

/** Rewrites the cached group name/colour on templates that point at `group`. */
export async function syncGroupMetadata(group, userId) {
    const templates = await loadVisibleTemplates(userId);

    const updates = [];
    for (const template of templates) {
        const meta = parseMetadata(template.metadata);
        if (meta.groupId !== group.id) continue;
        meta.groupName = group.name;
        meta.groupColor = group.color || "#3b82f6";
        updates.push(
            db.messageTemplate.update({
                where: { id: template.id },
                data: { metadata: meta }
            })
        );
    }

    if (updates.length) await db.$transaction(updates);
    return updates.length;
}

/** Strips the group keys from every template that points at `groupId`. */
export async function detachGroupFromTemplates(groupId, userId) {
    const templates = await loadVisibleTemplates(userId);

    const updates = [];
    for (const template of templates) {
        const meta = parseMetadata(template.metadata);
        if (meta.groupId !== groupId) continue;
        delete meta.groupId;
        delete meta.groupName;
        delete meta.groupColor;
        updates.push(
            db.messageTemplate.update({
                where: { id: template.id },
                data: { metadata: meta }
            })
        );
    }

    if (updates.length) await db.$transaction(updates);
    return updates.length;
}