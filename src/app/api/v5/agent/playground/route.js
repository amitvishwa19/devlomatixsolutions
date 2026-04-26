import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const API_BASE_URL = "https://openrouter.ai/api/v1";

export async function POST(req) {
    console.log('api agent playground hit')
    try {
        const body = await req.json();
        const { prompt, hashtag } = body;

        if (!prompt) {
            return NextResponse.json({ status: 400, message: 'Prompt is required' });
        }

        if (!OPENROUTER_API_KEY) {
            console.error('OPENROUTER_API_KEY is not configured in .env');
            return NextResponse.json({ status: 500, message: 'OpenRouter API key not configured' });
        }

        let systemPrompt = "You are a helpful assistant.";
        let userContent = prompt;

        if (hashtag) {
            systemPrompt = "You must respond in JSON format with exactly two keys: 'promptresponse' (the answer to the user's prompt) and 'hashtags' (a string of relevant hashtags).";
            userContent = `Respond to this prompt in the required JSON format: ${prompt}`;
        }

        // Model fallback logic
        const models = [
            "openrouter/auto",
            "qwen/qwen3-next-80b-a3b-instruct:free",
            "stepfun/step-3.5-flash"
        ];

        let lastError = null;
        let successfulResponse = null;

        for (const model of models) {
            try {
                console.log(`Attempting request with model: ${model}`);
                const response = await fetch(`${API_BASE_URL}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                        'HTTP-Referer': process.env.NEXT_PUBLIC_URL || 'https://dev.devlomatix.com',
                        'X-Title': 'Devlomatix Agent Playground',
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userContent }
                        ],
                        response_format: hashtag ? { type: 'json_object' } : undefined
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorText = errorData.error?.message || response.statusText;
                    console.warn(`Model ${model} failed: ${response.status} ${errorText}`);
                    lastError = `OpenRouter failed (${model}): ${response.status} ${errorText}`;
                    continue; // Try next model
                }

                successfulResponse = await response.json();
                break; // Success!
            } catch (err) {
                console.error(`Error with model ${model}:`, err.message);
                lastError = err.message;
            }
        }

        if (!successfulResponse) {
            throw new Error(lastError || "All models failed to respond");
        }

        const data = successfulResponse;
        const aiResponse = data.choices[0]?.message?.content || "";

        if (hashtag) {
            try {
                const parsed = JSON.parse(aiResponse);
                return NextResponse.json({
                    status: 200,
                    promptresponse: parsed.promptresponse || aiResponse,
                    hashtags: parsed.hashtags || "",
                    model: data.model
                });
            } catch (e) {
                console.error('Failed to parse AI JSON response:', aiResponse);
                return NextResponse.json({
                    status: 200,
                    promptresponse: aiResponse,
                    hashtags: "",
                    model: data.model
                });
            }
        }

        return NextResponse.json({
            status: 200,
            response: aiResponse,
            model: data.model
        });
    } catch (error) {
        console.error('Playground Error:', error);
        return NextResponse.json({ status: 500, message: error.message || 'Internal server Error' });
    }
}
