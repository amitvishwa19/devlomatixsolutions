'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetWorkspaceImagesSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        await ensureWorkspaceAccess(workspaceId);

        const images = await db.workspaceDocument.findMany({
            where: {
                workspaceId,
                isFolder: false,
                deletedAt: null,
                OR: [
                    { category: 'IMAGE' },
                    { fileType: { startsWith: 'image/' } },
                    { extension: { in: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'] } }
                ],
                fileUrl: { not: null }
            },
            orderBy: { updatedAt: 'desc' },
            take: 40,
            select: {
                id: true,
                name: true,
                fileUrl: true,
                fileSize: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return {
            data: {
                success: true,
                images: JSON.parse(JSON.stringify(images))
            }
        };
    } catch (error) {
        console.error("[getWorkspaceImages] Error:", error);
        return { error: error.message || "Failed to fetch workspace images" };
    }
};

export const getWorkspaceImages = createSafeAction(GetWorkspaceImagesSchema, handler);
