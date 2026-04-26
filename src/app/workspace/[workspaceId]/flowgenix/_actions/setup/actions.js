"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getOrCreateAgentConfig(workspaceId, userId) {
    try {
        let config = await db.agentConfig.findFirst({
            where: { workspaceId }
        });

        if (!config) {
            config = await db.agentConfig.create({
                data: {
                    workspaceId,
                    userId,
                    name: "New Agent",
                    systemPrompt: "You are a helpful assistant.",
                    temperature: 0.7,
                    streamDelayMs: 0,
                    enableRouter: false,
                    enableCalculator: true,
                    enableWebSearch: true,
                }
            });
            revalidatePath(`/workspace/${workspaceId}/flowgenix`);
        }

        // Include models in the returned config
        const models = await listAgentModels(workspaceId);
        return { ...config, models };
    } catch (error) {
        console.error("getOrCreateAgentConfig error:", error);
        throw error;
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
        const { 
            id, 
            createdAt, 
            updatedAt, 
            model, 
            baseURL, 
            lastTestOk, 
            lastTestAt, 
            lastTestMessage, 
            lastLatencyMs, 
            capabilities,
            ...rest 
        } = data;
        
        // Strictly pick only fields defined in the Prisma schema
        const dbPayload = {
            workspaceId,
            userId,
            provider: rest.provider,
            name: model || rest.name || "missing",
            label: rest.label,
            apiKey: rest.apiKey,
            description: rest.description,
            healthStatus: rest.healthStatus,
            latency: rest.latency,
            successRate: rest.successRate,
            capability: rest.capability,
            strengths: rest.strengths,
            bestFor: rest.bestFor,
            baseUrl: baseURL || rest.baseUrl,
            isDefault: rest.isDefault,
            isActive: rest.isActive,
            metadata: rest.metadata,
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
            baseURL: result.baseUrl,
            lastTestOk,
            lastTestAt,
            lastTestMessage,
            lastLatencyMs,
            capabilities
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
