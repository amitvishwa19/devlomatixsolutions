import { NextResponse } from "next/server";
import { waAIService } from "../../../../../workspace/[workspaceId]/konnectx/_lib/ai-service";

export async function POST(request) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages?.length) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    const result = await waAIService.generateReplySuggestions(messages);

    return NextResponse.json({ data: { suggestions: result.suggestions || [] } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to generate suggestions" }, { status: 500 });
  }
}
