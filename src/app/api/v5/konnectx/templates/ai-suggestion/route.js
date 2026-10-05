import { ok, fail, requireUserId } from "../../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * POST /api/v5/konnectx/templates/ai-suggestion
 *
 * Body: `{ type: "generate" | "translate", prompt?, text?, targetLanguage? }`.
 *
 * Uses the workspace Gemini service when a key is configured. The web action
 * this mirrors returns hard-coded placeholder copy; here the suggestion is
 * real, but a missing API key degrades to an explicit error rather than
 * pretending a canned string is AI output.
 */
export async function POST(request) {
    try {
        await requireUserId(request);

        const body = await request.json().catch(() => ({}));

        if (!process.env.GEMINI_API_KEY) {
            return fail("AI suggestions are not configured on this server", 501);
        }

        const { WhatsAppAIService } = await import(
            "@/app/workspace/[workspaceId]/konnectx/_lib/ai-service"
        );
        const ai = WhatsAppAIService.getInstance();

        if (body.type === "translate") {
            if (!body.text) return fail("text is required to translate", 400);
            if (!body.targetLanguage) return fail("targetLanguage is required", 400);

            const translatedText = await ai.translateTemplate(body.text, body.targetLanguage);
            return ok({ translatedText });
        }

        if (!body.prompt) return fail("prompt is required", 400);

        const suggestion = await ai.generateTemplateSuggestion(body.prompt);

        return ok({
            suggestion: {
                name: suggestion?.name,
                displayName: suggestion?.displayName,
                category: suggestion?.category || "MARKETING",
                body: suggestion?.body,
                footer: suggestion?.footer,
                buttons: suggestion?.buttons
            }
        });
    } catch (error) {
        if (error?.status) throw error;
        console.error("[konnectx/templates/ai-suggestion] POST failed:", error);
        return fail(error.message || "Failed to generate a suggestion", 502);
    }
}