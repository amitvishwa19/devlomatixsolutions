import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { logger } from "@/lib/logger";
import { db } from "@/lib/db";
import crypto from 'node:crypto';

export async function POST(req, { params }) {
    let workspaceId = null;
    try {
        const resolvedParams = await params;
        workspaceId = resolvedParams.workspaceId;

        const session = await getServerSession(authOptions);
        const body = await req.json();
        const { prompt, mode, context } = body;

        if (!prompt && mode !== 'TAGS') {
            return NextResponse.json({ message: "Prompt is required" }, { status: 400 });
        }

        let apiKey = null;
        let aiModel = null;

        // 1. Fetch user's registered Gemini credential from DB
        if (session?.user?.userId) {
            const credential = await db.credentials.findFirst({
                where: {
                    userId: session.user.userId,
                    platform: 'GEMINI',
                    status: 'connected'
                },
                orderBy: { createdAt: 'desc' }
            });

            if (credential && credential.credentials) {
                let data = credential.credentials;

                // Decrypt if necessary
                if (data.enc && typeof data.enc === 'string') {
                    const encKey = process.env.ENCRYPTION_KEY;
                    if (encKey) {
                        try {
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

                apiKey = data.apiKey || data['api-key'] || data.api_key;
                aiModel = data.model; // Strictly use the model from DB
                
                if (apiKey) {
                    apiKey = apiKey.replace(/['"]/g, '').trim();
                    if (apiKey.includes('=')) {
                        apiKey = apiKey.split('=').pop().trim();
                    }
                }
            }
        }

        // 2. Fallback to system env ONLY if no credential was found at all
        if (!apiKey) {
            apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMENI_API_KEY;
        }
        
        const targetModel = aiModel || "gemini-1.5-flash";
        
        if (!apiKey) {
            return NextResponse.json({ message: "Gemini API key not configured" }, { status: 500 });
        }

        // --- Model Preparation ---
        let systemPrompt = "";
        let finalPrompt = "";

        switch (mode) {
            case 'IMPROVE':
                systemPrompt = "You are an expert social media manager. Your task is to improve the provided social media post content. Make it more engaging, professional, and optimized for social platforms. Maintain the original meaning but enhance the impact. Return only the improved content text, no other commentary.";
                finalPrompt = `Original Content: "${context}"\nUser Instructions: "${prompt}"`;
                break;
            case 'TAGS':
                systemPrompt = "You are a social media tagging expert. Generate 5-8 relevant, trending hashtags for the provided post content. Return ONLY a comma-separated list of tags without the '#' symbol. For example: marketing, tech, business. Do not include any other text.";
                finalPrompt = `Post Content: "${context || prompt}"`;
                break;
            case 'REPURPOSE':
                if (prompt === 'TWITTER_THREAD') {
                    systemPrompt = "You are a Twitter viral growth expert. Transform the provided article into a high-engagement Twitter thread (3-5 tweets). Each tweet should be under 280 characters. Use numbers (1/n) and threads-style formatting. Return the thread text with each tweet separated by a clear line break.";
                } else if (prompt === 'LINKEDIN_POST') {
                    systemPrompt = "You are a LinkedIn thought leader. Repurpose the provided article into a compelling LinkedIn post. Use professional formatting, line breaks for readability, and include a 'hook' at the beginning. Return only the post content.";
                } else if (prompt === 'INSTAGRAM') {
                    systemPrompt = "You are a top-tier Instagram growth expert. Repurpose the provided article into an engaging, visual-friendly Instagram caption. Include a highly relatable hook, conversational spacing, relevant emojis, and 5-10 optimized hashtags at the end. Return ONLY the caption text.";
                } else if (prompt === 'FACEBOOK') {
                    systemPrompt = "You are a Facebook community manager. Repurpose the provided article into a conversational and engaging Facebook post that encourages comments and shares. Use a friendly tone and appropriate spacing. Return ONLY the post text.";
                } else {
                    systemPrompt = `Repurpose the provided article into a compelling post specifically optimized for ${prompt}. Maintain the core message but adjust the tone, formatting, and length for this platform's optimal performance. limit to standard social media post length. Return ONLY the optimized content.`;
                }
                finalPrompt = `Article Content: "${context}"`;
                break;
            case 'SEO':
                systemPrompt = "You are a Semantic SEO expert. Analyze the provided content against the target keyword. Provide a score (0-100), identify top keywords used with their frequency, and list 3-5 high-impact recommendations for improvement. Return your response as a JSON object with this structure: { \"score\": number, \"keywords\": [ { \"word\": string, \"count\": number } ], \"recommendations\": [ string ] }. Return ONLY the JSON object, no other text.";
                finalPrompt = `Target Keyword: "${prompt}"\n\nArticle Content: "${context}"`;
                break;
            case 'GENERATE':
            default:
                systemPrompt = "You are an expert social media content creator. Generate a compelling social media post based on the user's prompt. Provide a short internal reference title and the full post body content. Format your response exactly as follows:\nTITLE: [The Title]\nCONTENT: [The Body]";
                finalPrompt = prompt;
                break;
        }

        const combinedPrompt = `${systemPrompt}\n\n${finalPrompt}`;

        // --- Generation Execution ---
        let responseText = "";
        let success = false;
        let lastGenerationError = null;
        let isQuotaError = false;

        // Direct Fetch Fallback Helper (Bypasses SDK initialization issues)
        const callDirectGeminiV1 = async (modelName, key, fullPrompt) => {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] })
            });
            const resData = await response.json();
            if (!response.ok) {
                const errorMsg = resData.error?.message || `HTTP ${response.status}`;
                if (resData.error?.status === 'RESOURCE_EXHAUSTED' || errorMsg.toLowerCase().includes('quota')) {
                    isQuotaError = true;
                }
                throw new Error(errorMsg);
            }
            return resData.candidates?.[0]?.content?.parts?.[0]?.text;
        };

        try {
            console.log(`[AI_GENERATE] Strictly utilizing model: ${targetModel}`);
            try {
                // Try SDK first
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: targetModel });
                const result = await model.generateContent(combinedPrompt);
                const sdkRes = await result.response;
                responseText = sdkRes.text();
            } catch (sdkErr) {
                // Detect quota error in SDK
                if (sdkErr.message?.toLowerCase().includes('quota') || sdkErr.message?.includes('429')) {
                    isQuotaError = true;
                }
                // Try Direct API fallback (same model)
                console.log(`[AI_GENERATE] SDK err, trying direct hit for ${targetModel}...`);
                responseText = await callDirectGeminiV1(targetModel, apiKey, combinedPrompt);
            }

            if (responseText) {
                success = true;
            }
        } catch (err) {
            lastGenerationError = err.message;
            if (lastGenerationError.toLowerCase().includes('quota') || lastGenerationError.includes('429')) {
                isQuotaError = true;
            }
            console.error(`[AI_GENERATE] Execution failed:`, lastGenerationError);
        }

        // --- Post-Generation Usage Tracking ---
        if (session?.user?.userId) {
            try {
                // Find the credential again to update usage (safest way to handle JSON merge)
                const cred = await db.credentials.findFirst({
                    where: { userId: session.user.userId, platform: 'GEMINI', status: 'connected' },
                    orderBy: { createdAt: 'desc' }
                });

                if (cred) {
                    let credJson = typeof cred.credentials === 'string' ? JSON.parse(cred.credentials) : (cred.credentials || {});
                    const today = new Date().toISOString().split('T')[0];
                    
                    if (!credJson.usage) credJson.usage = { dailyCount: 0, lastReset: today, quotaReached: false };
                    
                    // Reset if new day
                    if (credJson.usage.lastReset !== today) {
                        credJson.usage.dailyCount = 0;
                        credJson.usage.lastReset = today;
                        credJson.usage.quotaReached = false;
                    }

                    if (success) {
                        credJson.usage.dailyCount = (credJson.usage.dailyCount || 0) + 1;
                        credJson.usage.quotaReached = false; // Reset if it was previously flagged but now succeeds
                    } else if (isQuotaError) {
                        credJson.usage.quotaReached = true;
                    }

                    await db.credentials.update({
                        where: { id: cred.id },
                        data: { credentials: credJson }
                    });
                }
            } catch (uErr) {
                console.error("[USAGE_TRACK_ERR]", uErr.message);
            }
        }

        if (!success) {
            const errorMsg = isQuotaError ? `API Quota Exceeded: Your Gemini daily limit has been reached. ${lastGenerationError}` : (lastGenerationError || `AI model ${targetModel} failed to respond`);
            throw new Error(errorMsg);
        }

        // --- Response Formatting ---
        if (mode === 'GENERATE') {
            const titleMatch = responseText.match(/TITLE:\s*(.*)/i);
            const contentMatch = responseText.match(/CONTENT:\s*([\s\S]*)/i);

            return NextResponse.json({
                title: titleMatch ? titleMatch[1].trim() : "Generated Post",
                content: contentMatch ? contentMatch[1].trim() : responseText
            });
        }

        if (mode === 'TAGS') {
            const tagsList = responseText.split(',').map(tag => tag.trim().replace(/^#/, ''));
            return NextResponse.json({ tags: tagsList });
        }

        if (mode === 'SEO') {
            try {
                const cleanJson = responseText.replace(/```json|```/g, '').trim();
                const seoData = JSON.parse(cleanJson);
                return NextResponse.json(seoData);
            } catch (e) {
                console.error("[SEO_PARSE_ERROR]", e, responseText);
                return NextResponse.json({ score: 0, keywords: [], recommendations: ["Failed to parse SEO data"] });
            }
        }

        return NextResponse.json({ content: responseText });

    } catch (error) {
        if (workspaceId) {
            await logger.error(`AI Generation Failed: ${error.message}`, {
                workspaceId,
                type: 'AI',
                details: { stack: error.stack, error }
            });
        }
        console.error("[AI_GENERATE_ERROR]", error);
        return NextResponse.json({ message: error.message || "Failed to generate content" }, { status: 500 });
    }
}
