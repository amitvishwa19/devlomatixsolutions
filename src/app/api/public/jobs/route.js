import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get('workspaceId');

        const where = { status: 'OPEN' };
        if (workspaceId) {
            where.workspaceId = workspaceId;
        } else if (process.env.APP_MODE === 'prod') {
            where.workspaceId = 'cmn3zvsj6000dd8ikegztlu1m'; // Production Devlomatix Workspace
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
