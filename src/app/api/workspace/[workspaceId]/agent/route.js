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
        const openclaw = integrations.openclaw || {
            enabled: false,
            apiUrl: '',
            apiKey: '',
            agents: [
                { id: 'OC-1', name: 'Support Assistant', status: 'online', role: 'Support', type: 'OpenClaw' },
                { id: 'OC-2', name: 'Code Quality Agent', status: 'online', role: 'DevOps', type: 'OpenClaw' }
            ]
        };

        return NextResponse.json(openclaw);

    } catch (error) {
        console.error("Agent API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        const updates = await req.json();

        if (!session?.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const currentSettings = await prisma.appSettings.findUnique({
            where: { key: workspaceId }
        });

        const currentIntegrations = currentSettings?.integrations || {};
        const updatedIntegrations = {
            ...currentIntegrations,
            openclaw: {
                ...(currentIntegrations.openclaw || {}),
                ...updates
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

        return NextResponse.json(updatedIntegrations.openclaw);

    } catch (error) {
        console.error("Agent Update Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
