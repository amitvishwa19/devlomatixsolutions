"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getAgentConfig(workspaceId) {
    try {
        const config = await db.agentConfig.findFirst({
            where: { workspaceId }
        });
        return config;
    } catch (error) {
        console.error("getAgentConfig error:", error);
        return null;
    }
}

export async function saveAgentConfig(workspaceId, userId, data) {
    try {
        const { id, createdAt, updatedAt, models, ...payload } = data;
        const config = await db.agentConfig.upsert({
            where: { id: id || "temp-id" },
            update: { ...payload, workspaceId, userId },
            create: { ...payload, workspaceId, userId }
        });
        revalidatePath(`/workspace/${workspaceId}/flowgenix`);
        return config;
    } catch (error) {
        console.error("saveAgentConfig error:", error);
        throw error;
    }
}

export async function listAgentModels(workspaceId) {
    try {
        return await db.agentModel.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("listAgentModels error:", error);
        return [];
    }
}

export async function upsertAgentModel(workspaceId, userId, data) {
    try {
        const { id, createdAt, updatedAt, model, baseURL, ...payload } = data;
        
        // Map UI field names to Prisma schema field names
        const dbPayload = {
            ...payload,
            name: model || payload.name || "missing",
            baseUrl: baseURL || payload.baseUrl,
            workspaceId,
            userId
        };

        const result = await db.agentModel.upsert({
            where: { id: id || "temp-id" },
            update: dbPayload,
            create: dbPayload
        });

        revalidatePath(`/workspace/${workspaceId}/flowgenix`);
        
        // Map back to UI format to maintain consistency in frontend
        return {
            ...result,
            model: result.name,
            baseURL: result.baseUrl
        };
    } catch (error) {
        console.error("upsertAgentModel error:", error);
        throw error;
    }
}

export async function deleteAgentModel(workspaceId, modelId) {
    try {
        await db.agentModel.delete({
            where: { id: modelId }
        });
        revalidatePath(`/workspace/${workspaceId}/flowgenix`);
        return { success: true };
    } catch (error) {
        console.error("deleteAgentModel error:", error);
        throw error;
    }
}

export async function listRagDocs(workspaceId) {
    try {
        return await db.ragDoc.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("listRagDocs error:", error);
        return [];
    }
}

export async function upsertRagDoc(workspaceId, userId, data) {
    try {
        const { id, createdAt, ...payload } = data;
        const doc = await db.ragDoc.upsert({
            where: { id: id || "temp-id" },
            update: { ...payload, workspaceId, userId },
            create: { ...payload, workspaceId, userId }
        });
        revalidatePath(`/workspace/${workspaceId}/flowgenix`);
        return doc;
    } catch (error) {
        console.error("upsertRagDoc error:", error);
        throw error;
    }
}

export async function deleteRagDoc(workspaceId, docId) {
    try {
        await db.ragDoc.delete({
            where: { id: docId }
        });
        revalidatePath(`/workspace/${workspaceId}/flowgenix`);
        return { success: true };
    } catch (error) {
        console.error("deleteRagDoc error:", error);
        throw error;
    }
}
