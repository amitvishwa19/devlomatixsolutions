"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function listCredentials(workspaceId) {
    try {
        return await db.nodeCredential.findMany({
            where: { workspaceId },
            orderBy: { updatedAt: 'desc' }
        });
    } catch (error) {
        console.error("listCredentials error:", error);
        return [];
    }
}

export async function upsertCredential(workspaceId, userId, data) {
    try {
        const { id, createdAt, updatedAt, ...payload } = data;
        const cred = await db.nodeCredential.upsert({
            where: { id: id || "temp-id" },
            update: { ...payload, workspaceId, userId },
            create: { ...payload, workspaceId, userId }
        });
        revalidatePath(`/workspace/${workspaceId}/flowgenix`);
        return cred;
    } catch (error) {
        console.error("upsertCredential error:", error);
        throw error;
    }
}

export async function deleteCredential(workspaceId, credId) {
    try {
        await db.nodeCredential.delete({
            where: { id: credId }
        });
        revalidatePath(`/workspace/${workspaceId}/flowgenix`);
        return { success: true };
    } catch (error) {
        console.error("deleteCredential error:", error);
        throw error;
    }
}
