'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetAiSuggestionsSchema = z.object({
    workspaceId: z.string(),
    messages: z.array(z.any()),
});

const handler = async (data) => {
    const { workspaceId, messages } = data;

    try {
        await ensureWorkspaceAccess(workspaceId);

        // This is a placeholder for actual AI logic.
        // In the original /api/wa/ai-suggest, it might have called OpenAI or similar.
        // For now, I'll return some generic helpful responses based on the context.
        
        const lastMessage = messages[messages.length - 1];
        const text = lastMessage?.text?.toLowerCase() || "";

        let suggestions = [
            "How can I help you today?",
            "Thank you for contacting us.",
            "I'll look into this for you right away."
        ];

        if (text.includes("hello") || text.includes("hi")) {
            suggestions = ["Hi there! How can I assist you?", "Hello! Hope you're having a great day.", "Greetings! What brings you here?"];
        } else if (text.includes("price") || text.includes("cost")) {
            suggestions = ["I can send you our price list.", "Our pricing depends on your requirements. Can we hop on a call?", "Let me check our current offers for you."];
        }

        return { 
            data: {
                success: true, 
                suggestions 
            }
        };
    } catch (error) {
        return { error: error.message || "Failed to get AI suggestions" };
    }
};

export const getAiSuggestions = createSafeAction(GetAiSuggestionsSchema, handler);
