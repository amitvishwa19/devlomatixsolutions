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
        const missions = openclaw.missions || [
            { id: 'M-1', title: 'Content Research', agentId: 'OC-1', status: 'In Progress', priority: 'High', progress: 65 },
            { id: 'M-2', title: 'Security Audit', agentId: 'OC-2', status: 'Review', priority: 'Critical', progress: 90 },
            { id: 'M-3', title: 'Dependency Update', agentId: 'OC-2', status: 'Backlog', priority: 'Medium', progress: 0 }
        ];

        return NextResponse.json(missions);

    } catch (error) {
        console.error("Mission API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        const { missions } = await req.json();

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
                missions: missions
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

        return NextResponse.json(updatedIntegrations.openclaw.missions);

    } catch (error) {
        console.error("Mission Update Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
