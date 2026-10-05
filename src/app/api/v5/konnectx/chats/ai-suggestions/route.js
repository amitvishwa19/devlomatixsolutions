import { NextResponse } from "next/server";
import { requireUserId } from "../../_lib/helpers";
import { waAIService } from "../../../../../workspace/[workspaceId]/konnectx/_lib/ai-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/v5/konnectx/chats/ai-suggestions
 *
 * Reply suggestions cost a Gemini call each time, so the endpoint requires an
 * authenticated caller instead of being an open meter.
 */
export async function POST(request) {
  try {
    await requireUserId(request);
    const body = await request.json();
    const { messages } = body;

    if (!messages?.length) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    const result = await waAIService.generateReplySuggestions(messages);

    return NextResponse.json({ data: { suggestions: result.suggestions || [] } });
  } catch (error) {
    // `requireUserId` throws a 401 NextResponse; don't mask it as a 500.
    if (error?.status) throw error;
    return NextResponse.json({ error: error.message || "Failed to generate suggestions" }, { status: 500 });
  }
}
