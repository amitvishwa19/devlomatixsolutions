import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        let workspaceId = searchParams.get('workspaceId');

        if (!workspaceId) {
            workspaceId = process.env.CAREER_WORKSPACE_ID || process.env.DEFAULT_WORKSPACE_ID;

            if (!workspaceId) {
                const ceoServer = await prisma.server.findFirst({
                    where: {
                        user: { email: 'amit.vishwakarma@devlomatix.com' },
                        default: true
                    },
                    select: { id: true }
                });
                if (ceoServer?.id) {
                    workspaceId = ceoServer.id;
                }
            }
        }

        const where = { status: 'OPEN' };
        if (workspaceId) {
            where.workspaceId = workspaceId;
        }

        const jobs = await prisma.job.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                category: true
            }
        });

        return NextResponse.json(jobs);
    } catch (error) {
        console.error("[PUBLIC_JOBS_GET]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
