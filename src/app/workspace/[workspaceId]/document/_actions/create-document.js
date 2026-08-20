'use server';

import { db } from "@/lib/db";
import { getAuthUser } from "./auth-helper";
import { revalidatePath } from "next/cache";
import mime from "mime-types";
import path from "path";

/**
 * Create Document, Note, or Folder
 */
export async function createDocument(workspaceId, data) {
    try {
        const currentUserId = await getAuthUser();
        const {
            name,
            description,
            fileUrl,
            fileKey,
            fileType,
            extension,
            fileSize,
            category = "GENERAL",
            content,
            isFolder = false,
            parentId = null,
            tags = [],
            status = "APPROVED"
        } = data;

        if (!name || !name.trim()) {
            throw new Error("Document or Folder name is required");
        }

        let calculatedExt = extension;
        let calculatedType = fileType;

        if (!isFolder) {
            if (fileUrl && !calculatedExt) {
                calculatedExt = path.extname(fileUrl).replace(".", "");
            }
            if (calculatedExt && !calculatedType) {
                calculatedType = mime.lookup(calculatedExt) || "application/octet-stream";
            }
            if (!fileUrl && content !== undefined) {
                calculatedType = "application/vnd.devlomatix.note";
                calculatedExt = "doc";
            }
        }

        // Validate parent folder if specified
        let validParentId = null;
        if (parentId && parentId !== "root") {
            const parentDoc = await db.workspaceDocument.findUnique({
                where: { id: parentId, workspaceId, isFolder: true, deletedAt: null }
            });
            if (parentDoc) {
                validParentId = parentDoc.id;
            }
        }

        const document = await db.workspaceDocument.create({
            data: {
                name: name.trim(),
                description: description ? description.trim() : null,
                fileUrl: isFolder ? null : fileUrl,
                fileKey: isFolder ? null : fileKey,
                fileType: isFolder ? null : calculatedType,
                extension: isFolder ? null : calculatedExt,
                fileSize: isFolder ? null : (fileSize || 0),
                category: category || "GENERAL",
                content: isFolder ? null : content,
                isFolder: Boolean(isFolder),
                parentId: validParentId,
                workspaceId,
                userId: currentUserId,
                tags: Array.isArray(tags) ? tags : [],
                status: status || "APPROVED",
            }
        });

        revalidatePath(`/workspace/${workspaceId}/document`);
        return { success: true, data: document };
    } catch (error) {
        console.error("[SERVER_ACTION_CREATE_DOCUMENT]", error);
        return { success: false, error: error.message || "Failed to create document" };
    }
}
