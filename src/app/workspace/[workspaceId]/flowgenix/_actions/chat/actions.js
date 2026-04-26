"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function listThreads(workspaceId, userId) {
    try {
        return await db.agentChatThread.findMany({
            where: { workspaceId, userId },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("listThreads error:", error);
        return [];
    }
}

export async function createThread(workspaceId, userId, title) {
    try {
        const thread = await db.agentChatThread.create({
            data: { workspaceId, userId, title }
        });
        revalidatePath(`/workspace/${workspaceId}/flowgenix`);
        return thread;
    } catch (error) {
        console.error("createThread error:", error);
        throw error;
    }
}

export async function getThreadMessages(workspaceId, threadId) {
    try {
        return await db.agentChatMessage.findMany({
            where: { workspaceId, threadId },
            orderBy: { createdAt: 'asc' }
        });
    } catch (error) {
        console.error("getThreadMessages error:", error);
        return [];
    }
}

export async function saveChatMessage(workspaceId, userId, data) {
    try {
        const message = await db.agentChatMessage.create({
            data: {
                ...data,
                workspaceId,
                userId
            }
        });
        return message;
    } catch (error) {
        console.error("saveChatMessage error:", error);
        throw error;
    }
}
