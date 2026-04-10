import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { title, type } = await req.json();

        if (!title) {
            return NextResponse.json({ message: "Task title is required" }, { status: 400 });
        }

        // 1. Fetch AI Credentials (Gemini or OpenRouter)
        const fetchAIConfig = async () => {
            // Find any AI-capable credential (GEMINI or OPENROUTER)
            const credentials = await db.credentials.findMany({
                where: {
                    OR: [
                        { userId: session.user.userId, platform: { in: ['GEMINI', 'OPENROUTER'] } },
                        { workspaceId: workspaceId, platform: { in: ['GEMINI', 'OPENROUTER'] } }
                    ]
                },
                orderBy: { updatedAt: 'desc' }
            });

            if (!credentials.length) {
                return { platform: 'GEMINI', apiKey: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY, model: 'gemini-2.0-flash' };
            }

            // Find first connected one, or just the latest one
            const cred = credentials.find(c => c.status === 'connected') || credentials[0];
            let data = cred.credentials;
            
            // Decrypt...
            if (data?.enc && typeof data.enc === 'string') {
                const encKey = process.env.ENCRYPTION_KEY;
                if (encKey) {
                    try {
                        const crypto = require('crypto');
                        const parts = data.enc.split(':');
                        const ivBuffer = Buffer.from(parts[0], 'hex');
                        const encText = Buffer.from(parts.slice(1).join(':'), 'hex');
                        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encKey, 'hex'), ivBuffer);
                        let decrypted = decipher.update(encText);
                        decrypted = Buffer.concat([decrypted, decipher.final()]);
                        data = JSON.parse(decrypted.toString());
                    } catch (e) {}
                }
            }

            return {
                platform: cred.platform,
                apiKey: (data.apiKey || data['api-key'] || data.api_key || '').replace(/['"]/g, '').trim(),
                model: data.model
            };
        };

        const aiConfig = await fetchAIConfig();
        
        if (!aiConfig.apiKey && aiConfig.platform === 'GEMINI') {
            aiConfig.apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        }

        if (!aiConfig.apiKey) {
            return NextResponse.json({ message: "No AI API key found. Please connect GEMINI or OPENROUTER in Credentials." }, { status: 404 });
        }

        // Direct Fallback: Direct Fetch to v1beta API (more robust for newer models than v1)
        const callDirectGeminiV1 = async (modelName, key, prompt) => {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`);
            return data.candidates?.[0]?.content?.parts?.[0]?.text;
        };

        // OpenRouter Fallback: OpenAI-compatible API
        const callOpenRouter = async (modelName, key, prompt) => {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${key}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://devlomatix.solutions",
                    "X-Title": "Devlomatix Solutions"
                },
                body: JSON.stringify({
                    "model": modelName,
                    "messages": [{ "role": "user", "content": prompt }]
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`);
            return data.choices?.[0]?.message?.content;
        };

        const systemPrompt = `You are a professional project manager. Draft a clear, actionable, and professional description for a Kanban task.
Context:
- Task Title: "${title}"
- Task Type: "${type || 'General Task'}"

Instructions:
- Provide a concise description (max 2 paragraphs or a short bullet list).
- Focus on objectives and expected outcomes.
- Keep the tone professional but accessible.
- Output ONLY the description text. No titles, introductions, or pleasantries.`;

        let text = "";
        let success = false;
        let lastError = null;

        // Execute Generation
        if (aiConfig.platform === 'OPENROUTER') {
            const modelToUse = aiConfig.model || "google/gemini-2.0-flash-exp:free";
            console.log(`[AI_DESCRIPTION] Using OpenRouter with model: ${modelToUse}`);
            try {
                text = await callOpenRouter(modelToUse, aiConfig.apiKey, systemPrompt);
                success = !!text;
            } catch (err) {
                console.error("[AI_DESCRIPTION] OpenRouter failed:", err.message);
                lastError = err.message;
            }
        } else {
            const modelsToTry = [
                ...(aiConfig.model ? [aiConfig.model] : []),
                "gemini-2.0-flash",
                "gemini-1.5-flash",
                "gemini-1.5-pro",
                "gemini-pro",
            ];

            for (const modelName of modelsToTry) {
                try {
                    console.log(`[AI_DESCRIPTION] Attempting ${modelName} via Gemini SDK/Direct...`);
                    try {
                        const genAI = new GoogleGenerativeAI(aiConfig.apiKey);
                        const model = genAI.getGenerativeModel({ model: modelName });
                        const result = await model.generateContent(systemPrompt);
                        const response = await result.response;
                        text = response.text().trim();
                    } catch (sdkErr) {
                        text = await callDirectGeminiV1(modelName, aiConfig.apiKey, systemPrompt);
                    }

                    if (text) {
                        text = text.trim();
                        success = true;
                        break;
                    }
                } catch (err) {
                    lastError = err.message;
                }
            }
        }

        if (success) {
            return NextResponse.json({ description: text });
        } else {
            console.error("[AI_DESCRIPTION_FATAL_ERROR] All connectivity paths failed.", lastError);
            return NextResponse.json({ 
                message: `AI Generation Error: ${lastError || "Unknown error"}. Please verify your API key and model selection in System -> Credentials.` 
            }, { status: 500 });
        }

    } catch (error) {
        console.error("[AI_DESCRIPTION_ERROR]", error);
        return NextResponse.json({ 
            message: error.message || "Failed to generate description" 
        }, { status: 500 });
    }
}
