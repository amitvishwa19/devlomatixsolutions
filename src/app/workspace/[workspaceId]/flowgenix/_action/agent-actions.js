'use server';

import { db } from "@/lib/db";
import { ensureAdmin } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

/**
 * Fetch all AI Agents configured for a workspace
 */
export async function getAgentsAction(workspaceId) {
    try {
        if (!workspaceId) return { success: false, error: "Workspace ID is required" };

        let agents = await db.aIAgent.findMany({
            where: { workspaceId },
            include: {
                models: {
                    include: { model: true },
                    orderBy: { priority: "asc" }
                },
                subAgents: true,
                parent: true
            },
            orderBy: { createdAt: "asc" }
        });

        // If no agents found, provide initial default template agents for quick onboarding
        if (!agents || agents.length === 0) {
            const session = await ensureAdmin();
            const userId = session?.user?.userId || "system";

            const defaultAgentTemplates = [
                {
                    workspaceId,
                    userId,
                    name: "OmniRoute Orchestrator",
                    role: "Master Coordinator",
                    type: "OpenClaw",
                    status: "online",
                    isMain: true,
                    strategy: "SEQUENTIAL",
                    description: "Top-level orchestrator agent that dynamically evaluates incoming requests, selects optimal models, and delegates sub-tasks.",
                    config: {
                        temperature: 0.2,
                        maxIterations: 6,
                        systemPrompt: "You are the OmniRoute Master Orchestrator. Analyze complexity, route to optimal reasoning chains, and synthesize multi-agent output.",
                        tools: ["web_search", "calculator", "model_router", "memory_rag"]
                    }
                },
                {
                    workspaceId,
                    userId,
                    name: "Code Architect & Reviewer",
                    role: "Software Engineering",
                    type: "Swarm Worker",
                    status: "online",
                    isMain: false,
                    strategy: "PARALLEL",
                    description: "Specialized in deep code analysis, refactoring, vulnerability audits, and test generation.",
                    config: {
                        temperature: 0.1,
                        maxIterations: 4,
                        systemPrompt: "You are a senior software architect. Provide clean, secure, and production-ready code with complete type annotations and edge case handling.",
                        tools: ["code_sandbox", "git_tools", "ast_parser"]
                    }
                },
                {
                    workspaceId,
                    userId,
                    name: "Deep Research Analyst",
                    role: "Knowledge Synthesis",
                    type: "Research Agent",
                    status: "standby",
                    isMain: false,
                    strategy: "SEQUENTIAL",
                    description: "Scours documentation, live web indexes, and vector stores to build comprehensive executive reports.",
                    config: {
                        temperature: 0.3,
                        maxIterations: 8,
                        systemPrompt: "You are a meticulous research analyst. Always cite primary sources, cross-reference statistics, and organize insights with clear hierarchy.",
                        tools: ["web_search", "vector_search", "pdf_reader", "compression"]
                    }
                }
            ];

            try {
                for (const t of defaultAgentTemplates) {
                    await db.aIAgent.create({ data: t });
                }
                agents = await db.aIAgent.findMany({
                    where: { workspaceId },
                    include: {
                        models: {
                            include: { model: true },
                            orderBy: { priority: "asc" }
                        },
                        subAgents: true,
                        parent: true
                    },
                    orderBy: { createdAt: "asc" }
                });
            } catch (seedErr) {
                console.warn("Auto-seeding default agents failed, returning fallback template list:", seedErr.message);
                return { success: true, data: defaultAgentTemplates.map((t, idx) => ({ ...t, id: `seed-${idx}`, models: [], subAgents: [] })) };
            }
        }

        return { success: true, data: agents };
    } catch (error) {
        console.error("getAgentsAction Error:", error);
        return { success: false, error: error.message || "Failed to fetch agents" };
    }
}

/**
 * Upsert an AI Agent
 */
export async function upsertAgentAction({
    workspaceId,
    id,
    name,
    role,
    type = "OpenClaw",
    status = "online",
    description,
    isMain = false,
    parentId = null,
    strategy = "SEQUENTIAL",
    config = {},
    modelAssignments = []
}) {
    try {
        const session = await ensureAdmin();
        const userId = session?.user?.userId || "system";

        if (!workspaceId || !name) {
            return { success: false, error: "Workspace ID and Agent Name are required." };
        }

        const dataPayload = {
            workspaceId,
            userId,
            name,
            role: role || "Specialist Agent",
            type: type || "OpenClaw",
            status: status || "online",
            description: description || "",
            isMain: Boolean(isMain),
            parentId: parentId || null,
            strategy: strategy || "SEQUENTIAL",
            config: config || {}
        };

        let agent;
        if (id && !id.startsWith("seed-")) {
            agent = await db.aIAgent.update({
                where: { id },
                data: dataPayload
            });

            // Update model assignments if provided
            if (Array.isArray(modelAssignments)) {
                await db.agentModelAssignment.deleteMany({ where: { agentId: id } });
                for (let i = 0; i < modelAssignments.length; i++) {
                    const modelId = modelAssignments[i];
                    if (modelId) {
                        await db.agentModelAssignment.create({
                            data: {
                                agentId: id,
                                modelId: modelId,
                                priority: i
                            }
                        }).catch(() => {});
                    }
                }
            }
        } else {
            agent = await db.aIAgent.create({
                data: dataPayload
            });

            if (Array.isArray(modelAssignments) && agent?.id) {
                for (let i = 0; i < modelAssignments.length; i++) {
                    const modelId = modelAssignments[i];
                    if (modelId) {
                        await db.agentModelAssignment.create({
                            data: {
                                agentId: agent.id,
                                modelId: modelId,
                                priority: i
                            }
                        }).catch(() => {});
                    }
                }
            }
        }

        revalidatePath(`/workspace/${workspaceId}/flowgenix`);
        return { success: true, data: agent };
    } catch (error) {
        console.error("upsertAgentAction Error:", error);
        return { success: false, error: error.message || "Failed to save agent" };
    }
}

/**
 * Toggle Agent Status
 */
export async function toggleAgentStatusAction({ id, status, workspaceId }) {
    try {
        await ensureAdmin();

        const updated = await db.aIAgent.update({
            where: { id },
            data: { status }
        });

        revalidatePath(`/workspace/${workspaceId}/flowgenix`);
        return { success: true, data: updated };
    } catch (error) {
        console.error("toggleAgentStatusAction Error:", error);
        return { success: false, error: error.message || "Failed to update agent status" };
    }
}

/**
 * Delete an AI Agent
 */
export async function deleteAgentAction({ id, workspaceId }) {
    try {
        await ensureAdmin();

        await db.aIAgent.delete({
            where: { id }
        });

        revalidatePath(`/workspace/${workspaceId}/flowgenix`);
        return { success: true };
    } catch (error) {
        console.error("deleteAgentAction Error:", error);
        return { success: false, error: error.message || "Failed to delete agent" };
    }
}
