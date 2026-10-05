'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { executeGatewayRequest } from "@/app/workspace/[workspaceId]/flowgenix/_lib/combo-router";

/**
 * 1. AI Deal Health & Win Probability Intelligence
 */
export async function analyzeDealAiHealthAction(workspaceId, dealId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const deal = await prisma.deal.findFirst({
            where: { id: dealId, workspaceId },
            include: {
                stage: true,
                pipeline: { include: { stages: { orderBy: { order: 'asc' } } } },
                contact: true,
                account: true,
                activities: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });

        if (!deal) {
            return { success: false, error: "Deal not found" };
        }

        // 1. Calculate timing metrics
        const now = new Date();
        const daysSinceCreated = Math.max(1, Math.floor((now - new Date(deal.createdAt)) / (1000 * 60 * 60 * 24)));
        const daysSinceUpdated = Math.max(0, Math.floor((now - new Date(deal.updatedAt)) / (1000 * 60 * 60 * 24)));
        const isOverdue = deal.expectedClose && new Date(deal.expectedClose) < now;

        // 2. Fetch recent WhatsApp communication if contact phone exists
        let recentWaCount = 0;
        let lastWaSnippet = "";
        if (deal.contact?.phone) {
            const cleanPhone = deal.contact.phone.replace(/[^0-9]/g, '');
            const waMsgs = await prisma.whatsAppMessage.findMany({
                where: {
                    OR: [
                        { jid: { contains: cleanPhone } },
                        { jid: `${cleanPhone}@s.whatsapp.net` }
                    ]
                },
                take: 5,
                orderBy: { timestamp: 'desc' }
            });
            recentWaCount = waMsgs.length;
            if (waMsgs.length > 0) {
                lastWaSnippet = waMsgs[0].text;
            }
        }

        // 3. Build AI Context Prompt for FlowGenix Agent
        const promptContext = `
You are the FlowGenix AI Sales Intelligence Copilot. Analyze this CRM deal and provide precise, actionable sales advice.

Deal Details:
- Title: "${deal.title}"
- Value: ${deal.currency} ${deal.value}
- Current Stage: "${deal.stage?.name}" (Base Stage Probability: ${deal.stage?.probability}%)
- Priority: ${deal.priority}
- Age: ${daysSinceCreated} days old
- Days since last update/activity: ${daysSinceUpdated} days
- Overdue: ${isOverdue ? "YES (Past expected close date)" : "No"}
- Client Contact: ${deal.contact ? `${deal.contact.name} (${deal.contact.phone || 'No phone'})` : "None"}
- Organization: ${deal.account ? `${deal.account.name} (Industry: ${deal.account.industry || 'General'}, Rating: ${deal.account.rating || 'Standard'})` : "Independent"}
- Logged Activities Count: ${deal.activities.length}
- Recent Activities: ${deal.activities.map(a => `[${a.type}] ${a.title}`).join(", ") || "None"}
- Recent WhatsApp Messages Count: ${recentWaCount}
${lastWaSnippet ? `- Last WhatsApp Message: "${lastWaSnippet}"` : ""}

Respond ONLY with a valid, raw JSON object (without markdown code blocks, backticks, or other text) adhering to this schema:
{
  "healthScore": number, // 0 to 100
  "status": "HEALTHY" | "STALLED" | "AT_RISK",
  "predictedWinRate": number, // 0 to 100
  "summary": "Concise 1-2 sentence assessment of this deal's current momentum.",
  "riskFactors": ["risk item 1", "risk item 2"],
  "nextBestActions": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "recommendedWhatsAppDraft": "A personalized, ready-to-send WhatsApp follow-up message tailored for this contact."
}
`;

        let aiResult = null;

        // Try FlowGenix Gateway
        try {
            const gatewayRes = await executeGatewayRequest({
                workspaceId,
                model: "auto/smart",
                messages: [
                    { role: "system", content: "You are an expert enterprise sales AI analyst. Output strictly valid JSON." },
                    { role: "user", content: promptContext }
                ],
                stream: false
            });

            if (gatewayRes?.success && gatewayRes?.content) {
                const rawText = gatewayRes.content.trim();
                const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    aiResult = JSON.parse(jsonMatch[0]);
                }
            }
        } catch (gatewayErr) {
            console.warn("[FLOWGENIX_AI_GATEWAY_CRM_FALLBACK]", gatewayErr.message);
        }

        // Heuristic fallback if FlowGenix LLM is unconfigured
        if (!aiResult) {
            let score = 75;
            const risks = [];
            const actions = [];

            if (daysSinceUpdated > 7) {
                score -= 30;
                risks.push(`No activity recorded in the last ${daysSinceUpdated} days`);
                actions.push(`Send an immediate re-engagement touchpoint via WhatsApp to ${deal.contact?.name || 'the client'}`);
            } else if (daysSinceUpdated > 3) {
                score -= 10;
                risks.push(`Communication gap: ${daysSinceUpdated} days since last interaction`);
                actions.push(`Schedule a 10-minute check-in call to maintain momentum`);
            }

            if (isOverdue) {
                score -= 25;
                risks.push(`Deal is past its expected close target date (${new Date(deal.expectedClose).toLocaleDateString()})`);
                actions.push(`Review commercial terms and update expected close milestone`);
            }

            if (!deal.contact) {
                score -= 20;
                risks.push("No key stakeholder contact is linked to this deal");
                actions.push("Map the primary decision-maker or sponsor to this deal");
            }

            if (deal.value > 100000 && deal.stage?.order < 2) {
                actions.push("Executive sponsor check-in recommended due to high deal value");
            }

            score = Math.max(10, Math.min(95, score));
            const status = score >= 70 ? "HEALTHY" : score >= 45 ? "STALLED" : "AT_RISK";

            aiResult = {
                healthScore: score,
                status,
                predictedWinRate: Math.round((deal.stage?.probability || 50) * (score / 100)),
                summary: status === "HEALTHY"
                    ? `Deal has positive momentum in stage "${deal.stage?.name}".`
                    : `Deal momentum is slowing down due to inactivity or missing timeline milestones.`,
                riskFactors: risks.length > 0 ? risks : ["No critical risks detected; keep active communication frequency."],
                nextBestActions: actions.length > 0 ? actions : [
                    `Send proposal walkthrough or schedule discovery review`,
                    `Confirm key decision timeline with ${deal.contact?.name || 'the client'}`
                ],
                recommendedWhatsAppDraft: `Hi ${deal.contact?.name || 'there'}, just following up regarding ${deal.title}. We'd love to assist with any questions you might have on our proposal. Let us know if you're free for a quick call this week!`
            };
        }

        return {
            success: true,
            data: {
                dealId,
                dealTitle: deal.title,
                dealValue: deal.value,
                currency: deal.currency,
                stageName: deal.stage?.name,
                ...aiResult,
                analyzedAt: new Date().toISOString()
            }
        };
    } catch (error) {
        console.error("[ANALYZE_DEAL_AI_HEALTH_ERROR]", error);
        return { success: false, error: error.message || "Failed to analyze deal health" };
    }
}

/**
 * 2. AI WhatsApp Outreach & Objection Handling Drafter
 */
export async function generateAiWhatsAppDraftAction(workspaceId, { dealId, contactId, objective, tone = "professional" }) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        let contextInfo = "";
        let contactName = "there";

        if (dealId) {
            const deal = await prisma.deal.findFirst({
                where: { id: dealId, workspaceId },
                include: { contact: true, account: true, stage: true }
            });
            if (deal) {
                contextInfo += `Deal: "${deal.title}" | Value: ${deal.currency} ${deal.value} | Current Stage: "${deal.stage?.name}"\n`;
                if (deal.contact) contactName = deal.contact.name || contactName;
                if (deal.account) contextInfo += `Company: ${deal.account.name} (${deal.account.industry || 'Industry'})\n`;
            }
        }

        if (contactId && !contextInfo) {
            const contact = await prisma.contact.findFirst({
                where: { id: contactId, workspaceId },
                include: { account: true }
            });
            if (contact) {
                contactName = contact.name || contactName;
                if (contact.account) contextInfo += `Company: ${contact.account.name}\n`;
            }
        }

        const prompt = `
You are the FlowGenix AI Sales Copilot.
Draft a concise, high-converting WhatsApp message to a sales prospect.
- Prospect Name: ${contactName}
- Goal / Objective: "${objective}"
- Tone: ${tone} (Options: professional, friendly, urgent, consultative)
- Context:
${contextInfo}

Guidelines:
- Keep it concise for WhatsApp (under 4-5 sentences).
- Use natural conversational formatting with clear call-to-action (CTA).
- Do not use placeholders like "[Insert Date]"; write a natural, ready-to-dispatch message.
- Return ONLY the exact message text without quotes or explanations.
`;

        let draftText = "";
        try {
            const gatewayRes = await executeGatewayRequest({
                workspaceId,
                model: "auto/fast",
                messages: [
                    { role: "system", content: "You are an elite sales copywriter crafting WhatsApp outreach." },
                    { role: "user", content: prompt }
                ]
            });
            if (gatewayRes?.success && gatewayRes?.content) {
                draftText = gatewayRes.content.trim().replace(/^["']|["']$/g, '');
            }
        } catch (e) {
            console.warn("[AI_WHATSAPP_DRAFT_FALLBACK]", e.message);
        }

        if (!draftText) {
            // Intelligent template fallback
            if (objective.toLowerCase().includes("pricing") || objective.toLowerCase().includes("discount")) {
                draftText = `Hi ${contactName}, I reviewed your note regarding pricing. We have tailored flexible options that match your budget requirements while delivering maximum value. Would you be open to a quick 5-minute call today to review?`;
            } else if (objective.toLowerCase().includes("followup") || objective.toLowerCase().includes("check")) {
                draftText = `Hello ${contactName}, hope you are doing well! Just checking in on our discussion. Let me know if you have any questions or need further clarifications on the proposal.`;
            } else {
                draftText = `Hi ${contactName}, this is regarding our recent conversation. We are excited about moving forward and would love to schedule our next walkthrough. Let me know what time works best for you!`;
            }
        }

        return { success: true, data: { draft: draftText } };
    } catch (error) {
        console.error("[GENERATE_AI_WHATSAPP_DRAFT_ERROR]", error);
        return { success: false, error: error.message || "Failed to generate AI WhatsApp draft" };
    }
}

/**
 * 3. Smart Sales Call & Meeting Transcript Summarizer
 */
export async function summarizeSalesCallNotesAction(workspaceId, { rawNotes, contactId, dealId }) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        if (!rawNotes?.trim()) {
            return { success: false, error: "Raw notes or transcript cannot be empty." };
        }

        const prompt = `
You are the FlowGenix AI Meeting Summarizer.
Analyze these unstructured sales notes/transcript and extract key CRM intelligence.

Raw Notes:
"""
${rawNotes}
"""

Return ONLY a valid JSON object matching this schema (no code fences, no extra text):
{
  "title": "A crisp, descriptive subject line for this meeting/call",
  "summary": "2-3 sentence overview of the conversation",
  "keyPoints": ["Key point 1", "Key point 2"],
  "objections": ["Objection or concern 1 if any"],
  "budgetOrCommercials": "Any budget, pricing, or timeline mentioned (or 'Not discussed')",
  "nextSteps": ["Action item 1", "Action item 2"]
}
`;

        let summaryData = null;
        try {
            const gatewayRes = await executeGatewayRequest({
                workspaceId,
                model: "auto/smart",
                messages: [
                    { role: "system", content: "You extract structured CRM meeting notes. Return JSON only." },
                    { role: "user", content: prompt }
                ]
            });
            if (gatewayRes?.success && gatewayRes?.content) {
                const match = gatewayRes.content.match(/\{[\s\S]*\}/);
                if (match) summaryData = JSON.parse(match[0]);
            }
        } catch (e) {
            console.warn("[SUMMARIZE_NOTES_AI_FALLBACK]", e.message);
        }

        if (!summaryData) {
            const lines = rawNotes.split('\n').map(l => l.trim()).filter(Boolean);
            summaryData = {
                title: lines[0]?.slice(0, 60) || "Sales Touchpoint Note",
                summary: lines.slice(0, 3).join(". "),
                keyPoints: lines.slice(0, 4),
                objections: [],
                budgetOrCommercials: "Reviewed during meeting",
                nextSteps: ["Follow up with client on agreed deliverables"]
            };
        }

        return { success: true, data: summaryData };
    } catch (error) {
        console.error("[SUMMARIZE_SALES_CALL_ERROR]", error);
        return { success: false, error: error.message || "Failed to summarize notes" };
    }
}

/**
 * 4. Pipeline-Wide AI Risk Radar
 * Identifies deals that require immediate intervention across all stages
 */
export async function getPipelineAiRiskRadarAction(workspaceId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const openDeals = await prisma.deal.findMany({
            where: {
                workspaceId,
                stage: { isWon: false, isLost: false }
            },
            include: {
                stage: true,
                contact: true,
                account: true,
                activities: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { value: 'desc' }
        });

        const now = new Date();
        const analyzedDeals = openDeals.map(deal => {
            const lastActivityDate = deal.activities[0]?.createdAt || deal.createdAt;
            const daysInactive = Math.floor((now - new Date(lastActivityDate)) / (1000 * 60 * 60 * 24));
            const isOverdue = deal.expectedClose && new Date(deal.expectedClose) < now;

            let riskScore = 0; // 0 to 100
            const riskReasons = [];

            if (daysInactive >= 7) {
                riskScore += 45;
                riskReasons.push(`${daysInactive} days without interaction`);
            } else if (daysInactive >= 3) {
                riskScore += 20;
                riskReasons.push(`${daysInactive} days since last touchpoint`);
            }

            if (isOverdue) {
                riskScore += 35;
                riskReasons.push("Target close date passed");
            }

            if (!deal.contactId && !deal.accountId) {
                riskScore += 25;
                riskReasons.push("No linked contact or organization");
            }

            const riskLevel = riskScore >= 50 ? "HIGH" : riskScore >= 25 ? "MEDIUM" : "LOW";
            const healthScore = Math.max(10, 100 - riskScore);

            return {
                id: deal.id,
                title: deal.title,
                value: deal.value,
                currency: deal.currency,
                stageName: deal.stage?.name,
                stageColor: deal.stage?.color,
                contactName: deal.contact?.name,
                contactPhone: deal.contact?.phone,
                accountName: deal.account?.name,
                daysInactive,
                riskScore,
                riskLevel,
                healthScore,
                riskReasons
            };
        });

        const atRiskDeals = analyzedDeals.filter(d => d.riskLevel === "HIGH" || d.riskLevel === "MEDIUM");
        const healthyDeals = analyzedDeals.filter(d => d.riskLevel === "LOW");

        return {
            success: true,
            data: {
                totalOpenDeals: openDeals.length,
                atRiskCount: atRiskDeals.length,
                healthyCount: healthyDeals.length,
                atRiskDeals: atRiskDeals.sort((a, b) => b.riskScore - a.riskScore),
                healthyDeals
            }
        };
    } catch (error) {
        console.error("[GET_PIPELINE_AI_RISK_RADAR_ERROR]", error);
        return { success: false, error: error.message || "Failed to compute AI Risk Radar" };
    }
}

/**
 * 5. Interactive CRM Sales AI Copilot Chat
 */
export async function askSalesCopilotChatAction(workspaceId, { message, chatHistory = [] }) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        // Aggregate key CRM metrics for context
        const [pipelineCount, openDeals, topAccounts, topContacts] = await Promise.all([
            prisma.pipeline.count({ where: { workspaceId } }),
            prisma.deal.findMany({
                where: { workspaceId, stage: { isWon: false, isLost: false } },
                include: { stage: true, account: true, contact: true },
                orderBy: { value: 'desc' },
                take: 10
            }),
            prisma.account.findMany({
                where: { workspaceId },
                include: { _count: { select: { deals: true, contacts: true } } },
                take: 5
            }),
            prisma.contact.findMany({
                where: { workspaceId },
                orderBy: { updatedAt: 'desc' },
                take: 5
            })
        ]);

        const totalPipelineValue = openDeals.reduce((sum, d) => sum + (d.value || 0), 0);

        const systemPrompt = `
You are FlowGenix Sales Copilot, an elite AI sales strategist integrated into Devlomatix CRM.
You have real-time visibility into the user's CRM pipeline, contacts, and opportunities:

CRM Live Overview:
- Total Open Pipeline: ₹ ${totalPipelineValue.toLocaleString('en-IN')} across ${openDeals.length} deals.
- Top Opportunities:
${openDeals.map(d => `  * "${d.title}" - ₹${d.value?.toLocaleString()} in stage "${d.stage?.name}" (${d.account?.name || d.contact?.name || 'Unlinked'})`).join('\n') || '  * None'}
- Key Accounts: ${topAccounts.map(a => `${a.name} (${a._count.deals} deals)`).join(', ') || 'None'}
- Recent Contacts: ${topContacts.map(c => `${c.name} (${c.phone})`).join(', ') || 'None'}

Role:
- Provide strategic, high-velocity advice on closing deals, drafting WhatsApp pitches, managing objections, and improving win rates.
- Keep answers formatted with clean markdown, bullet points, and actionable next steps.
`;

        const messages = [
            { role: "system", content: systemPrompt },
            ...chatHistory.slice(-6).map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: message }
        ];

        let reply = "";
        try {
            const gatewayRes = await executeGatewayRequest({
                workspaceId,
                model: "auto/smart",
                messages,
                stream: false
            });
            if (gatewayRes?.success && gatewayRes?.content) {
                reply = gatewayRes.content;
            }
        } catch (e) {
            console.warn("[COPILOT_CHAT_AI_FALLBACK]", e.message);
        }

        if (!reply) {
            reply = `Here is your CRM analysis:\n\n- **Active Pipeline**: ₹ ${totalPipelineValue.toLocaleString('en-IN')} across ${openDeals.length} opportunities.\n- **Top Deal**: "${openDeals[0]?.title || 'None'}" in stage "${openDeals[0]?.stage?.name || 'N/A'}".\n- **Recommendation**: Review deals in negotiation and send quick follow-ups via KonnectX WhatsApp Cloud to accelerate close velocity.`;
        }

        return { success: true, data: { reply } };
    } catch (error) {
        console.error("[SALES_COPILOT_CHAT_ERROR]", error);
        return { success: false, error: error.message || "Failed to process Copilot query" };
    }
}
