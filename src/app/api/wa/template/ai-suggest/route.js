import { NextResponse } from 'next/server';
import { waAIService } from '@/app/workspace/[workspaceId]/wa/_lib/ai-service';

export async function POST(req) {
    try {
        const { prompt, type, text, targetLanguage } = await req.json();

        if (type === 'translate') {
            const translatedText = await waAIService.translateTemplate(text, targetLanguage);
            return NextResponse.json({ success: true, translatedText });
        }

        if (!prompt) {
            return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
        }

        const suggestion = await waAIService.generateTemplateSuggestion(prompt);

        return NextResponse.json({
            success: true,
            suggestion
        });

    } catch (error) {
        console.error("[AI_SUGGEST_ROUTE] Error:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || "Failed to generate AI suggestion" 
        }, { status: 500 });
    }
}
