"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { runAgent } from "../../_lib/agent-runtime";

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

export async function renameThread(threadId, title) {
    try {
        return await db.agentChatThread.update({
            where: { id: threadId },
            data: { title }
        });
    } catch (error) {
        console.error("renameThread error:", error);
        throw error;
    }
}

export async function deleteThread(threadId) {
    try {
        await db.agentChatMessage.deleteMany({ where: { threadId } });
        return await db.agentChatThread.delete({ where: { id: threadId } });
    } catch (error) {
        console.error("deleteThread error:", error);
        throw error;
    }
}

export async function clearThreadMessages(threadId) {
    try {
        return await db.agentChatMessage.deleteMany({ where: { threadId } });
    } catch (error) {
        console.error("clearThreadMessages error:", error);
        throw error;
    }
}

export async function deleteLastAssistantMessage(threadId) {
    try {
        const last = await db.agentChatMessage.findFirst({
            where: { threadId, role: 'assistant' },
            orderBy: { createdAt: 'desc' }
        });
        if (last) {
            await db.agentChatMessage.delete({ where: { id: last.id } });
        }
    } catch (error) {
        console.error("deleteLastAssistantMessage error:", error);
    }
}

function generate(wordCount = 500) {
    const words = [
        "lorem", "ipsum", "dolor", "sit", "amet",
        "consectetur", "adipiscing", "elit", "sed", "do",
        "eiusmod", "tempor", "incididunt", "ut", "labore",
        "et", "dolore", "magna", "aliqua", "enim",
        "minim", "veniam", "quis", "nostrud", "exercitation",
        "ullamco", "laboris", "nisi", "aliquip", "commodo",
        "consequat", "duis", "aute", "irure", "reprehenderit",
        "voluptate", "velit", "esse", "cillum", "fugiat"
    ];

    let result = [];

    for (let i = 0; i < wordCount; i++) {
        result.push(words[Math.floor(Math.random() * words.length)]);
    }

    // First letter capital + end with period
    let text = result.join(" ");
    return text.charAt(0).toUpperCase() + text.slice(1) + ".";
}

export async function getChatResponse({ config, history, userInput, ragDocs, workspaceId }) {
    try {
        let tavilyKey = "";
        if (config.enableWebSearch) {
            const cred = await db.nodeCredential.findFirst({
                where: { workspaceId, kind: "tavily" }
            });
            if (cred && cred.config) {
                const cfg = typeof cred.config === "string" ? JSON.parse(cred.config) : cred.config;
                tavilyKey = cfg.apiKey || "";
            }
        }

        let fullText = "";
        await runAgent(
            config,
            history,
            userInput,
            ragDocs,
            (update) => {
                if (update.partial) fullText = update.partial;
            },
            null,
            tavilyKey
        );

        return {
            success: true,
            response: fullText,
        };
    } catch (err) {
        console.error(`[FlowgenixAction] Chat Error:`, err.message);
        return { success: false, error: err.message };
    }
}
