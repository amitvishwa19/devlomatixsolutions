'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { OpenAI } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";

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
        let discoveredMetadata = {
            capability: "",
            description: ""
        };

        switch (provider.toLowerCase()) {
            case 'openai': {
                const openai = new OpenAI({
                    apiKey,
                    baseURL: baseUrl || undefined,
                });

                const modelsList = await openai.models.list();
                const modelInfo = modelsList.data.find(m => m.id === name);
                
                if (modelInfo) {
                    discoveredMetadata.description = `Managed by ${modelInfo.owned_by}`;
                    // OpenAI doesn't expose context length via /v1/models easily, 
                    // so we'll just confirm existence for now.
                    discoveredMetadata.capability = "Verified Node";
                }

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

                const modelsList = await openai.models.list();
                // OpenRouter uses the format 'provider/model'
                const modelInfo = modelsList.data.find(m => m.id === name);

                if (modelInfo) {
                    const ctx = modelInfo.context_length ? `${Math.floor(modelInfo.context_length / 1000)}k Context` : "";
                    const modality = modelInfo.architecture?.modality || "";
                    const isVision = modality.includes('image') ? "Vision" : "";
                    
                    discoveredMetadata.capability = [isVision, ctx].filter(Boolean).join(", ") || "General Logic";
                    discoveredMetadata.description = modelInfo.description || "";
                }

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
                discoveredMetadata.capability = "Google Multimodal";
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
                    discoveredMetadata.capability = "Verified Dynamic Node";
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
                    capability: isSuccessful && discoveredMetadata.capability ? discoveredMetadata.capability : undefined,
                    description: isSuccessful && discoveredMetadata.description ? discoveredMetadata.description : undefined,
                    updatedAt: new Date()
                }
            });
            feedback += " Health and Metadata cluster status synced.";
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
