import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get('workspaceId') || 'cmn3zvsj6000dd8ikegztlu1m';

        const jobs = await prisma.job.findMany({
            where: { 
                workspaceId,
                status: 'OPEN'
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(jobs);
    } catch (error) {
        console.error("[PUBLIC_JOBS_GET]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
