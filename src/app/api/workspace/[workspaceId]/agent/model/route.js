import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

/**
 * GET: Fetch all AI models for a specific workspace
 */
export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const models = await prisma.agentModel.findMany({
            where: { 
                workspaceId,
                isActive: true 
            },
            orderBy: { createdAt: 'desc' }
        });

        // Mask API keys for security
        const maskedModels = models.map(m => ({
            ...m,
            apiKey: m.apiKey ? `sk-...${m.apiKey.slice(-4)}` : null
        }));

        return NextResponse.json(maskedModels);

    } catch (error) {
        console.error("AgentModel GET Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * POST: Deploy a new AI Model to the workspace cluster
 */
export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        const data = await req.json();

        if (!session?.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // If this model is marked as default, unset others first
        if (data.isDefault) {
            await prisma.agentModel.updateMany({
                where: { workspaceId, isDefault: true },
                data: { isDefault: false }
            });
        }

        const newModel = await prisma.agentModel.create({
            data: {
                workspaceId,
                userId: session.user.userId,
                provider: data.provider,
                name: data.name,
                apiKey: data.apiKey,
                description: data.description,
                isDefault: data.isDefault || false,
                capability: data.capability || "Logic, Reasoning",
                bestFor: data.bestFor || "General Intelligence",
            }
        });

        return NextResponse.json(newModel);

    } catch (error) {
        console.error("AgentModel POST Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * PATCH: Update model settings (like set default)
 */
export async function PATCH(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        const { modelId, ...updates } = await req.json();

        if (!session?.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Handle singleton default logic
        if (updates.isDefault) {
            await prisma.agentModel.updateMany({
                where: { workspaceId, isDefault: true },
                data: { isDefault: false }
            });
        }

        const updatedModel = await prisma.agentModel.update({
            where: { id: modelId },
            data: updates
        });

        return NextResponse.json(updatedModel);

    } catch (error) {
        console.error("AgentModel PATCH Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * DELETE: Remove a model from the cluster
 */
export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(req.url);
        const modelId = searchParams.get('id');

        if (!session?.user?.userId || !modelId) {
            return NextResponse.json({ message: "Unauthorized or missing ID" }, { status: 401 });
        }

        await prisma.agentModel.delete({
            where: { id: modelId }
        });

        return NextResponse.json({ message: "Model deleted successfully" });

    } catch (error) {
        console.error("AgentModel DELETE Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
