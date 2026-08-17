'use server';

import { db } from "@/lib/db";
import { ensureAdmin } from "@/lib/auth-utils";

/**
 * Fetch all chat threads for a workspace
 */
export async function getThreadsAction(workspaceId) {
    try {
        if (!workspaceId) return { success: false, error: "Workspace ID is required" };

        const session = await ensureAdmin();
        const userId = session?.user?.userId;

        const threads = await db.agentChatThread.findMany({
            where: {
                workspaceId,
                ...(userId ? { userId } : {})
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, data: threads };
    } catch (error) {
        console.error("getThreadsAction Error:", error);
        return { success: false, error: error.message || "Failed to fetch threads" };
    }
}

/**
 * Create a new chat thread
 */
export async function createThreadAction({ workspaceId, title = "New Conversation" }) {
    try {
        if (!workspaceId) return { success: false, error: "Workspace ID is required" };

        const session = await ensureAdmin();
        const userId = session?.user?.userId;
        if (!userId) return { success: false, error: "Unauthorized user" };

        const thread = await db.agentChatThread.create({
            data: {
                workspaceId,
                userId,
                title: title.slice(0, 80)
            }
        });

        return { success: true, data: thread };
    } catch (error) {
        console.error("createThreadAction Error:", error);
        return { success: false, error: error.message || "Failed to create thread" };
    }
}

/**
 * Rename an existing chat thread
 */
export async function renameThreadAction({ threadId, title }) {
    try {
        if (!threadId || !title) return { success: false, error: "Thread ID and title are required" };
        await ensureAdmin();

        const updated = await db.agentChatThread.update({
            where: { id: threadId },
            data: { title: title.slice(0, 80) }
        });

        return { success: true, data: updated };
    } catch (error) {
        console.error("renameThreadAction Error:", error);
        return { success: false, error: error.message || "Failed to rename thread" };
    }
}

/**
 * Delete a chat thread and all associated messages
 */
export async function deleteThreadAction(threadId) {
    try {
        if (!threadId) return { success: false, error: "Thread ID is required" };
        await ensureAdmin();

        await db.agentChatThread.delete({
            where: { id: threadId }
        });

        return { success: true };
    } catch (error) {
        console.error("deleteThreadAction Error:", error);
        return { success: false, error: error.message || "Failed to delete thread" };
    }
}

/**
 * Fetch messages for a specific chat thread
 */
export async function getThreadMessagesAction(threadId) {
    try {
        if (!threadId) return { success: false, error: "Thread ID is required" };
        await ensureAdmin();

        const messages = await db.agentChatMessage.findMany({
            where: { threadId },
            orderBy: { createdAt: 'asc' }
        });

        return {
            success: true,
            data: messages.map(m => ({
                id: m.id,
                role: m.role,
                content: m.content,
                meta: m.meta,
                createdAt: m.createdAt
            }))
        };
    } catch (error) {
        console.error("getThreadMessagesAction Error:", error);
        return { success: false, error: error.message || "Failed to fetch messages" };
    }
}

/**
 * Append a message to a thread
 */
export async function saveMessageAction({ workspaceId, threadId, role, content, meta = null }) {
    try {
        if (!workspaceId || !role || !content) {
            return { success: false, error: "Missing required fields" };
        }

        const session = await ensureAdmin();
        const userId = session?.user?.userId;
        if (!userId) return { success: false, error: "Unauthorized user" };

        let finalThreadId = threadId;

        // Auto-create thread if threadId not specified
        if (!finalThreadId) {
            const firstLine = content.split('\n')[0].slice(0, 30);
            const newThread = await db.agentChatThread.create({
                data: {
                    workspaceId,
                    userId,
                    title: firstLine || "New Chat"
                }
            });
            finalThreadId = newThread.id;
        }

        const message = await db.agentChatMessage.create({
            data: {
                workspaceId,
                userId,
                threadId: finalThreadId,
                role,
                content,
                meta: meta || {}
            }
        });

        return { success: true, data: message, threadId: finalThreadId };
    } catch (error) {
        console.error("saveMessageAction Error:", error);
        return { success: false, error: error.message || "Failed to save message" };
    }
}
