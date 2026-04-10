import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const settings = await prisma.appSettings.findUnique({
            where: { key: workspaceId }
        });

        const integrations = settings?.integrations || {};
        const openclaw = integrations.openclaw || {};
        const models = openclaw.models || [
            { id: 'MOD-1', name: 'GPT-4o', provider: 'OpenAI', status: 'ready', default: true },
            { id: 'MOD-2', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', status: 'ready', default: false },
            { id: 'MOD-3', name: 'Llama 3 (Local)', provider: 'OpenClaw Mesh', status: 'offline', default: false }
        ];

        return NextResponse.json(models);

    } catch (error) {
        console.error("Model API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        const { model } = await req.json();

        if (!session?.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const currentSettings = await prisma.appSettings.findUnique({
            where: { key: workspaceId }
        });

        const currentIntegrations = currentSettings?.integrations || {};
        const currentModels = currentIntegrations.openclaw?.models || [];
        
        const newModel = { 
            ...model, 
            id: `MOD-${Date.now()}`,
            status: 'ready'
        };

        const updatedIntegrations = {
            ...currentIntegrations,
            openclaw: {
                ...(currentIntegrations.openclaw || {}),
                models: [...currentModels, newModel]
            }
        };

        await prisma.appSettings.upsert({
            where: { key: workspaceId },
            create: {
                key: workspaceId,
                integrations: updatedIntegrations
            },
            update: {
                integrations: updatedIntegrations
            }
        });

        return NextResponse.json(newModel);

    } catch (error) {
        console.error("Model Create Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
