import { executeGatewayRequest } from "@/app/workspace/[workspaceId]/flowgenix/_lib/combo-router";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Execute a structured AI prompt through FlowGenix Gateway with cascading failover,
 * token compression, and automatic fallback to Gemini direct if gateway keys are unconfigured.
 */
export async function executeHireFlowAiPrompt({
    workspaceId,
    systemPrompt,
    userPrompt,
    model = "auto",
    temperature = 0.2,
    responseFormat = "json",
    maxTokens = 3000
}) {
    const startTime = Date.now();

    try {
        const messages = [];
        if (systemPrompt) {
            messages.push({ role: "system", content: systemPrompt });
        }
        messages.push({ role: "user", content: userPrompt });

        // 1. Attempt execution through FlowGenix Gateway
        let gatewayRes = await executeGatewayRequest({
            workspaceId,
            model,
            messages,
            stream: false,
            temperature,
            max_tokens: maxTokens
        });

        // If requested model was not "auto" and initial attempt failed, auto-fallback to "auto"
        if ((!gatewayRes?.success || !gatewayRes.response) && model !== "auto") {
            console.log(`[FlowGenix Client] Model ${model} failed. Retrying with FlowGenix 'auto'...`);
            gatewayRes = await executeGatewayRequest({
                workspaceId,
                model: "auto",
                messages,
                stream: false,
                temperature,
                max_tokens: maxTokens
            });
        }

        if (gatewayRes?.success && gatewayRes.response) {
            const data = await gatewayRes.response.json();
            const rawContent = data.choices?.[0]?.message?.content || "";

            if (responseFormat === "json") {
                const parsedJson = parseJsonFromText(rawContent);
                if (parsedJson) {
                    return {
                        success: true,
                        data: parsedJson,
                        raw: rawContent,
                        resolvedModel: gatewayRes.resolvedModel || model,
                        resolvedProvider: gatewayRes.resolvedProvider || "flowgenix",
                        latencyMs: gatewayRes.latencyMs || (Date.now() - startTime),
                        source: "flowgenix"
                    };
                }
            } else {
                return {
                    success: true,
                    data: rawContent,
                    raw: rawContent,
                    resolvedModel: gatewayRes.resolvedModel || model,
                    resolvedProvider: gatewayRes.resolvedProvider || "flowgenix",
                    latencyMs: gatewayRes.latencyMs || (Date.now() - startTime),
                    source: "flowgenix"
                };
            }
        }

        console.warn("[HIREFLOW_FLOWGENIX_FALLBACK] Gateway returned unsuccessful, trying Gemini direct fallback...", gatewayRes?.error);
    } catch (flowgenixErr) {
        console.warn("[HIREFLOW_FLOWGENIX_GATEWAY_WARN] Gateway invocation encountered error:", flowgenixErr.message);
    }

    // 2. Fallback to direct Google Gemini if FlowGenix gateway fails or has no active workspace keys
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMENI_API_KEY;
        if (!apiKey) {
            throw new Error("FlowGenix gateway failed and no fallback GEMINI_API_KEY is configured.");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const geminiModel = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: responseFormat === "json" ? "application/json" : "text/plain",
                temperature
            }
        });

        const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${userPrompt}` : userPrompt;
        const result = await geminiModel.generateContent(fullPrompt);
        const rawContent = result.response.text();

        let parsedData = rawContent;
        if (responseFormat === "json") {
            parsedData = parseJsonFromText(rawContent);
            if (!parsedData) {
                throw new Error("Gemini fallback returned non-parseable JSON");
            }
        }

        return {
            success: true,
            data: parsedData,
            raw: rawContent,
            resolvedModel: "gemini-1.5-flash",
            resolvedProvider: "google-direct-fallback",
            latencyMs: Date.now() - startTime,
            source: "gemini_fallback"
        };
    } catch (fallbackErr) {
        console.error("[HIREFLOW_AI_CRITICAL_FAILURE]", fallbackErr);
        return {
            success: false,
            error: fallbackErr.message || "Failed to process AI request across FlowGenix and Fallback"
        };
    }
}

/**
 * Interactive Copilot Chat Engine for Candidate Evaluation
 */
export async function executeCandidateCopilotChat({
    workspaceId,
    candidate,
    job,
    messages = [],
    model = "auto"
}) {
    const startTime = Date.now();

    const candidateContext = `
Candidate Profile:
- Full Name: ${candidate.name}
- Email: ${candidate.email}
- Phone: ${candidate.phone || "N/A"}
- Location: ${candidate.location || "N/A"}
- Current Pipeline Stage: ${candidate.applications?.[0]?.stage || candidate.status || "APPLIED"}
- Applied Job Position: ${job?.title || candidate.applications?.[0]?.job?.title || "Requisition"}
- Job Department: ${job?.department?.name || "General"}
- Job Requirements: ${(job?.requirements || []).join(", ") || "Standard requirements"}
- Job Description: ${job?.description || "Not provided"}

Parsed Skills & Background:
- Key Skills: ${(candidate.skills || []).join(", ") || "None recorded"}
- AI Match Score: ${candidate.score || candidate.aiMatchScore || "Unscored"}%
- Seniority: ${candidate.seniorityLevel || "N/A"}
- Estimated Experience: ${candidate.experienceYears || "N/A"}
- Executive Summary: ${candidate.summary || candidate.aiSummary || "N/A"}
- Strengths / Pros: ${(candidate.pros || []).join("; ") || "None"}
- Gaps / Cons: ${(candidate.cons || []).join("; ") || "None"}
- Interviewer Scorecards Count: ${candidate.scorecards?.length || 0}
- Internal Recruiter Notes Count: ${candidate.notes?.length || 0}
`;

    const systemPrompt = `You are the FlowGenix AI Recruiter Copilot, embedded directly inside HireFlow ATS.
Your job is to assist hiring managers and recruiters in evaluating this specific candidate with objective, high-signal intelligence.

${candidateContext}

Guidelines:
1. Be concise, actionable, and precise. Avoid generic fluff.
2. When asked to evaluate skills or match, explicitly highlight both alignments and red flags / gaps.
3. When drafting messages (WhatsApp or Email), adopt a friendly, respectful, and professional tone tailored to the candidate's seniority.
4. When suggesting interview questions, provide the question, what competency it probes, and what a strong vs weak answer sounds like.
5. Format your answers using clean markdown (bold key terms, bullet points, headers).`;

    try {
        const fullMessages = [
            { role: "system", content: systemPrompt },
            ...messages
        ];

        let gatewayRes = await executeGatewayRequest({
            workspaceId,
            model,
            messages: fullMessages,
            stream: false,
            temperature: 0.4,
            max_tokens: 2500
        });

        if ((!gatewayRes?.success || !gatewayRes.response) && model !== "auto") {
            gatewayRes = await executeGatewayRequest({
                workspaceId,
                model: "auto",
                messages: fullMessages,
                stream: false,
                temperature: 0.4,
                max_tokens: 2500
            });
        }

        if (gatewayRes?.success && gatewayRes.response) {
            const data = await gatewayRes.response.json();
            const content = data.choices?.[0]?.message?.content || "";
            return {
                success: true,
                content,
                resolvedModel: gatewayRes.resolvedModel || model,
                resolvedProvider: gatewayRes.resolvedProvider || "flowgenix",
                latencyMs: gatewayRes.latencyMs || (Date.now() - startTime),
                source: "flowgenix"
            };
        }
    } catch (err) {
        console.warn("[COPILOT_GATEWAY_WARN]", err.message);
    }

    // Direct Gemini fallback for Copilot
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMENI_API_KEY;
        if (!apiKey) throw new Error("AI credentials not available");

        const genAI = new GoogleGenerativeAI(apiKey);
        const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const conversationHistory = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
        const prompt = `${systemPrompt}\n\n--- Conversation ---\n${conversationHistory}\n\nASSISTANT:`;

        const result = await geminiModel.generateContent(prompt);
        return {
            success: true,
            content: result.response.text(),
            resolvedModel: "gemini-1.5-flash",
            resolvedProvider: "google-direct",
            latencyMs: Date.now() - startTime,
            source: "gemini_fallback"
        };
    } catch (error) {
        return {
            success: false,
            error: error.message || "Failed to get copilot response"
        };
    }
}

/**
 * Robust JSON parser that handles markdown codeblocks, stray backticks, and whitespace
 */
function parseJsonFromText(text) {
    if (!text || typeof text !== "string") return null;

    try {
        // Direct parse
        return JSON.parse(text);
    } catch (_) {
        // Strip markdown ```json ... ``` blocks
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
            try {
                return JSON.parse(codeBlockMatch[1]);
            } catch (_) {}
        }

        // Bracket scan
        const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (_) {}
        }
    }

    return null;
}
