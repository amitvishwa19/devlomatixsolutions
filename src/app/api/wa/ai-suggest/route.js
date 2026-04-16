import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { waAIService } from '@/app/workspace/[workspaceId]/wa/_lib/ai-service';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { messages } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Messages history is required" }, { status: 400 });
        }

        const suggestions = await waAIService.generateReplySuggestions(messages);

        return NextResponse.json({ success: true, suggestions: suggestions.suggestions });
    } catch (error) {
        console.error('[AI_SUGGEST_ERROR]', error);
        return NextResponse.json({ error: "Failed to generate AI suggestions" }, { status: 500 });
    }
}
