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
        const crons = openclaw.crons || [
            { id: 'CRON-1', title: 'Daily Report Sync', schedule: '0 0 * * *', mission: 'Sync all reports', enabled: true },
            { id: 'CRON-2', title: 'Security Scan', schedule: '0 */12 * * *', mission: 'Audit codebase', enabled: false }
        ];

        return NextResponse.json(crons);

    } catch (error) {
        console.error("Cron API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        const { cron } = await req.json();

        if (!session?.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const currentSettings = await prisma.appSettings.findUnique({
            where: { key: workspaceId }
        });

        const currentIntegrations = currentSettings?.integrations || {};
        const currentCrons = currentIntegrations.openclaw?.crons || [];
        
        const newCron = { 
            ...cron, 
            id: `CRON-${Date.now()}`,
            enabled: true 
        };

        const updatedIntegrations = {
            ...currentIntegrations,
            openclaw: {
                ...(currentIntegrations.openclaw || {}),
                crons: [...currentCrons, newCron]
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

        return NextResponse.json(newCron);

    } catch (error) {
        console.error("Cron Create Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
