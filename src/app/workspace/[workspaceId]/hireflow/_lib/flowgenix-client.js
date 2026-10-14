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

/**
 * Generate a Tailored AI Interview Kit with Competency Gaps, Question Rubrics, and Role-Play
 */
export async function generateInterviewKitAI({
    workspaceId,
    candidate,
    job,
    round = "Round 2: Competency & Objection Handling",
    difficulty = "In-Depth",
    weaknesses = [],
    focusAreas = [],
    customInstructions = ""
}) {
    const candidateName = candidate?.name || "Candidate";
    const jobTitle = job?.title || candidate?.applications?.[0]?.job?.title || "Target Position";
    const candidateSkills = Array.isArray(candidate?.skills) ? candidate.skills.join(", ") : (candidate?.skills || "N/A");
    const candidateSummary = candidate?.summary || candidate?.parsedData?.summary || "N/A";
    const candidateExperience = candidate?.experience || candidate?.parsedData?.experience || [];

    const systemPrompt = `You are an elite Talent Assessor and Executive Hiring Strategist.
Your goal is to generate a comprehensive, highly targeted, and rigorous "AI Interview Kit" for an interviewer conducting a high-stakes interview.
You must analyze the candidate's actual background, the job role, and any previously detected performance weaknesses or scorecard gaps.
Output MUST be valid, well-formed JSON conforming strictly to the requested schema. No conversational preamble.`;

    const weaknessesContext = weaknesses && weaknesses.length > 0 
        ? weaknesses.map(w => `- ${w.label || w.id}: Rated ${w.score || 2}/5 (${w.feedback || 'Weakness identified in previous scorecard'})`).join("\n")
        : "No previous scorecard gaps logged. Focus on role competency and stress-testing resume claims.";

    const userPrompt = `
Generate an AI Interview Kit for:
CANDIDATE: ${candidateName}
TARGET ROLE: ${jobTitle}
TARGET INTERVIEW ROUND: ${round}
RIGOR / DEPTH LEVEL: ${difficulty}

CANDIDATE SUMMARY & RESUME:
${candidateSummary}

KEY SKILLS:
${candidateSkills}

WORK EXPERIENCE:
${JSON.stringify(candidateExperience.slice(0, 4))}

PREVIOUS SCORECARD EVALUATION WEAKNESSES / GAPS:
${weaknessesContext}

SELECTED FOCUS COMPETENCIES:
${focusAreas && focusAreas.length > 0 ? focusAreas.join(", ") : "Communication, Sales Execution, Objection Handling, Technical Learning, Role-Play"}

SPECIAL INSTRUCTIONS:
${customInstructions || "Generate 5 high-signal questions specifically targeted at uncovering whether candidate can perform at the required standard."}

Respond ONLY with a JSON object in this exact structure:
{
  "kitTitle": "${jobTitle} — ${round} Kit",
  "generatedAt": "${new Date().toISOString()}",
  "candidateName": "${candidateName}",
  "targetRole": "${jobTitle}",
  "round": "${round}",
  "difficulty": "${difficulty}",
  "executiveBriefing": "2-3 sentences advising the interviewer on candidate's background, where their true strengths lie, and what critical gap this interview must confirm or dispel.",
  "flaggedGaps": [
    {
      "area": "Specific competency name",
      "concern": "Why this is a risk based on resume or previous scorecards",
      "suggestedProbeAngle": "The angle to pursue during this round"
    }
  ],
  "questions": [
    {
      "id": "q1",
      "category": "e.g. Practical Role-Play / Objection Handling / Technical Depth / Prospecting / Team Alignment",
      "competency": "e.g. Ability to convince customers",
      "question": "The exact, articulate question for the interviewer to speak aloud",
      "context": "Why ask this specifically to this candidate based on their history or previous low rating",
      "strongAnswerRubric": [
        "Concrete trait 1 of an exceptional 5/5 answer",
        "Concrete trait 2 of an exceptional 5/5 answer"
      ],
      "redFlags": [
        "Warning sign 1 indicating candidate is superficial or unpracticed (1-2/5)",
        "Warning sign 2 indicating lack of real depth"
      ],
      "probingFollowUp": "Follow-up question to ask if candidate gives a rehearsed or vague answer"
    }
  ],
  "practicalRolePlay": {
    "title": "Role-Play Scenario Title",
    "durationMinutes": 5,
    "scenario": "Detailed scenario setup (e.g. Sales pitch, objection navigation, technical outage)",
    "interviewerPersona": "The persona the interviewer should adopt (e.g. Skeptical CFO, hesitant prospect)",
    "candidateTask": "The specific objective candidate must accomplish in 3-5 minutes",
    "evaluationChecklist": [
      "Key execution factor 1",
      "Key execution factor 2",
      "Key execution factor 3"
    ]
  }
}`;

    const result = await executeHireFlowAiPrompt({
        workspaceId,
        systemPrompt,
        userPrompt,
        model: "auto",
        temperature: 0.3,
        responseFormat: "json",
        maxTokens: 3500
    });

    return result;
}
