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

        // 1. Fetch Gemini Credentials
        const extractGeminiData = async () => {
            // Priority 1: User's own connected Gemini credential
            let credential = await db.credentials.findFirst({
                where: {
                    userId: session.user.userId,
                    platform: 'GEMINI',
                    status: 'connected'
                },
                orderBy: { createdAt: 'desc' }
            });

            // Priority 2: Workspace-wide connected Gemini credential (if user's one not found)
            if (!credential && workspaceId) {
                credential = await db.credentials.findFirst({
                    where: {
                        workspaceId: workspaceId,
                        platform: 'GEMINI',
                        status: 'connected'
                    },
                    orderBy: { createdAt: 'desc' }
                });
            }

            // Priority 3: Any Gemini credential for this user (even if not 'connected' status, just try)
            if (!credential) {
                credential = await db.credentials.findFirst({
                    where: {
                        userId: session.user.userId,
                        platform: 'GEMINI'
                    },
                    orderBy: { createdAt: 'desc' }
                });
            }

            if (credential && credential.credentials) {
                let data = credential.credentials;
                
                // Decrypt if necessary (AES-256-CBC)
                if (data.enc && typeof data.enc === 'string') {
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
                        } catch (e) {
                            console.error("[DECRYPT_FAILED]", e.message);
                        }
                    }
                }

                let apiKey = data.apiKey || data['api-key'] || data.api_key;
                const userSelectedModel = data.model;
                
                if (apiKey) {
                    apiKey = apiKey.replace(/['"]/g, '').trim();
                    if (apiKey.includes('=')) {
                        apiKey = apiKey.split('=').pop().trim();
                    }
                }
                return { apiKey, userSelectedModel };
            }
            return { apiKey: null, userSelectedModel: null };
        };

        const { apiKey: credApiKey, userSelectedModel } = await extractGeminiData();
        
        let finalApiKey = credApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        if (!finalApiKey) {
            return NextResponse.json({ 
                message: "Gemini API key not found. Please connect your Gemini account in System -> Credentials." 
            }, { status: 404 });
        }

        // 2. Initialize Gemini AI Engine (Stable v1 Focus)
        console.log(`[AI_DESCRIPTION] Initiating stable v1 Discovery for task: "${title}" (User Model: ${userSelectedModel || 'default'})`);
        
        const systemPrompt = `You are a professional project manager. Draft a clear, actionable, and professional description for a Kanban task.
Context:
- Task Title: "${title}"
- Task Type: "${type || 'General Task'}"

Instructions:
- Provide a concise description (max 2 paragraphs or a short bullet list).
- Focus on objectives and expected outcomes.
- Keep the tone professional but accessible.
- Output ONLY the description text. No titles, introductions, or pleasantries.`;

        const modelsToTry = [
            ...(userSelectedModel ? [userSelectedModel] : []),
            "gemini-2.0-flash",
            "gemini-1.5-flash", 
            "gemini-1.5-pro", 
            "gemini-pro", 
        ];
        
        let text = "";
        let success = false;
        let lastError = null;

        // Ultimate Fallback: Direct Fetch to v1beta API (more robust for newer models than v1)
        const callDirectGeminiV1 = async (modelName, key, prompt) => {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`);
            return data.candidates?.[0]?.content?.parts?.[0]?.text;
        };

        for (const modelName of modelsToTry) {
            try {
                console.log(`[AI_DESCRIPTION] Deep Probe: Attempting ${modelName} via v1 endpoint...`);
                
                // Try SDK first with standard identifier
                try {
                    const genAI = new GoogleGenerativeAI(finalApiKey);
                    const model = genAI.getGenerativeModel({ model: modelName });
                    const result = await model.generateContent(systemPrompt);
                    const response = await result.response;
                    text = response.text().trim();
                } catch (sdkErr) {
                    console.warn(`[AI_DESCRIPTION] SDK v1beta failed for ${modelName}, switching to Direct v1...`);
                    // Immediate Direct Fallback to v1
                    text = await callDirectGeminiV1(modelName, finalApiKey, systemPrompt);
                }

                if (text) {
                    text = text.trim();
                    success = true;
                    console.log(`[AI_DESCRIPTION] SUCCESS: Model ${modelName} responded via stable v1.`);
                    break;
                }
            } catch (err) {
                console.warn(`[AI_DESCRIPTION] Model ${modelName} unavailable:`, err.message);
                lastError = err;
                continue;
            }
        }

        if (success) {
            return NextResponse.json({ description: text });
        } else {
            console.error("[GEMINI_FATAL_ERROR] All connectivity paths failed.", lastError);
            return NextResponse.json({ 
                message: `Gemini AI Error: Persistent 404 across all versions. (Last tried: ${modelsToTry.join(', ')}). Error: ${lastError?.message}. Please verify your API key access in Google AI Studio.` 
            }, { status: 500 });
        }

    } catch (error) {
        console.error("[AI_DESCRIPTION_ERROR]", error);
        return NextResponse.json({ 
            message: error.message || "Failed to generate description" 
        }, { status: 500 });
    }
}
