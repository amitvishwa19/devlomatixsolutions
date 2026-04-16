import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

/**
 * GET: Fetch the complete Agent Swarm hierarchy for a workspace
 */
export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Fetch all agents and their model assignments
        const agents = await prisma.aIAgent.findMany({
            where: { workspaceId },
            include: {
                models: {
                    include: {
                        model: true
                    },
                    orderBy: {
                        priority: 'asc'
                    }
                },
                subAgents: true // We'll manually nest these for clarity
            }
        });

        // Separate Main agents and nest Sub-agents
        const mainAgents = agents.filter(a => !a.parentId).map(main => {
            return {
                ...main,
                subAgents: agents.filter(sub => sub.parentId === main.id)
            };
        });

        return NextResponse.json(mainAgents);

    } catch (error) {
        console.error("Agent Swarm GET Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * PATCH: Update an agent in the swarm or create a new one
 */
export async function PATCH(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        const data = await req.json();

        if (!session?.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id, modelIds, systemPrompt, ...agentData } = data;

        // Wrap systemPrompt into config if provided
        const finalAgentData = {
            ...agentData,
            config: systemPrompt ? { systemPrompt } : agentData.config
        };

        let agent;

        if (id) {
            // Update existing agent
            agent = await prisma.aIAgent.update({
                where: { id },
                data: finalAgentData
            });

            // Update model assignments if provided
            if (modelIds) {
                // Remove old assignments
                await prisma.agentModelAssignment.deleteMany({
                    where: { agentId: id }
                });

                // Create new assignments based on provided order
                await prisma.agentModelAssignment.createMany({
                    data: modelIds.map((modelId, index) => ({
                        agentId: id,
                        modelId,
                        priority: index
                    }))
                });
            }
        } else {
            // Create new agent
            agent = await prisma.aIAgent.create({
                data: {
                    ...finalAgentData,
                    workspaceId,
                    userId: session.user.userId,
                }
            });

            // Initial model assignments
            if (modelIds) {
                await prisma.agentModelAssignment.createMany({
                    data: modelIds.map((modelId, index) => ({
                        agentId: agent.id,
                        modelId,
                        priority: index
                    }))
                });
            }
        }

        return NextResponse.json(agent);

    } catch (error) {
        console.error("Agent Swarm PATCH Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * DELETE: Remove an agent from the swarm
 */
export async function DELETE(req, { params }) {
    try {
        const { searchParams } = new URL(req.url);
        const agentId = searchParams.get('id');
        const session = await getServerSession(authOptions);

        if (!session?.user?.userId || !agentId) {
            return NextResponse.json({ message: "Unauthorized or missing ID" }, { status: 401 });
        }

        await prisma.aIAgent.delete({
            where: { id: agentId }
        });

        return NextResponse.json({ message: "Agent removed successfully" });

    } catch (error) {
        console.error("Agent Swarm DELETE Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
