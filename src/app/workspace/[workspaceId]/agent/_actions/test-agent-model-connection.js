'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { OpenAI } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const TestAgentModelConnection = z.object({
    id: z.optional(z.string()),
    provider: z.string(),
    name: z.string(),
    apiKey: z.string(),
    baseUrl: z.optional(z.string()),
});

const handler = async (data) => {
    const { id, provider, name, apiKey, baseUrl } = data;
    
    let isSuccessful = false;
    let feedback = "";

    try {
        switch (provider.toLowerCase()) {
            case 'openai': {
                const openai = new OpenAI({
                    apiKey,
                    baseURL: baseUrl || undefined,
                });

                await openai.models.list();
                isSuccessful = true;
                feedback = "Handshake successful with OpenAI gateway.";
                break;
            }

            case 'openrouter': {
                const openai = new OpenAI({
                    apiKey,
                    baseURL: baseUrl || 'https://openrouter.ai/api/v1',
                    defaultHeaders: {
                        "HTTP-Referer": "https://devlomatix.com",
                        "X-Title": "Devlomatix Agent Mission Control",
                    }
                });

                await openai.models.list();
                isSuccessful = true;
                feedback = "Handshake successful with OpenRouter bridge.";
                break;
            }

            case 'google': {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: name });
                
                await model.generateContent({
                   contents: [{ role: 'user', parts: [{ text: 'hi' }] }],
                   generationConfig: { maxOutputTokens: 1 }
                });
                isSuccessful = true;
                feedback = "Handshake successful with Google AI cluster.";
                break;
            }

            default: {
                const endpoint = baseUrl || (provider === 'anthropic' ? 'https://api.anthropic.com/v1/messages' : null);
                
                if (!endpoint) {
                    return { error: "Base URL is required for custom or unrecognized providers." };
                }

                const response = await fetch(endpoint.endsWith('/chat/completions') ? endpoint : `${endpoint.replace(/\/$/, '')}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: name,
                        messages: [{ role: 'user', content: 'hi' }],
                        max_tokens: 1
                    })
                });

                if (response.ok) {
                    isSuccessful = true;
                    feedback = `Handshake successful via dynamic endpoint [${provider}].`;
                } else {
                    const errData = await response.json().catch(() => ({}));
                    feedback = `Connection failed (${response.status}): ${errData.error?.message || response.statusText}`;
                    isSuccessful = false;
                }
                break;
            }
        }

        // --- Persistence Logic ---
        if (id) {
            await db.agentModel.update({
                where: { id },
                data: {
                    healthStatus: isSuccessful ? "Excellent" : "Offline",
                    updatedAt: new Date()
                }
            });
            feedback += " Health cluster status synced.";
        }

        if (isSuccessful) {
            return { data: { success: true, message: feedback } };
        } else {
            return { error: feedback };
        }

    } catch (error) {
        console.error("Connectivity Test Error:", error);
        
        // Update to Offline if we have an ID even on caught error
        if (id) {
            try {
                await db.agentModel.update({
                    where: { id },
                    data: { healthStatus: "Offline", updatedAt: new Date() }
                });
            } catch (dbErr) {
                console.error("Failed to sync offline status:", dbErr);
            }
        }

        return {
            error: error.message || "Failed to establish handshake with AI provider."
        };
    }
}

export const testAgentModelConnection = createSafeAction(TestAgentModelConnection, handler);
