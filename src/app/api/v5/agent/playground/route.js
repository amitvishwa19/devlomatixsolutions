import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const API_BASE_URL = "https://openrouter.ai/api/v1";

export async function POST(req) {
    console.log('api agent playground hit')
    try {
        const body = await req.json();
        const { prompt } = body;

        if (!prompt) {
            return NextResponse.json({ status: 400, message: 'Prompt is required' });
        }

        if (!OPENROUTER_API_KEY) {
            console.error('OPENROUTER_API_KEY is not configured in .env');
            return NextResponse.json({ status: 500, message: 'OpenRouter API key not configured' });
        }

        const response = await fetch(`${API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': process.env.NEXT_PUBLIC_URL || 'https://dev.devlomatix.com',
                'X-Title': 'Devlomatix Agent Playground',
            },
            body: JSON.stringify({
                model: 'openrouter/auto',
                messages: [
                    { role: 'user', content: prompt }
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter Error:', errorText);
            throw new Error(`OpenRouter failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content || "No response from AI";

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
