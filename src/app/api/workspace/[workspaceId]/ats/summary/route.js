import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const [totalCandidates, activeJobs, totalApplications, recentApplicants, stageCounts, focusJobs, interviews] = await Promise.all([
            prisma.candidate.count({ where: { workspaceId } }),
            prisma.job.count({ where: { workspaceId, status: 'OPEN' } }),
            prisma.application.count({ where: { workspaceId } }),
            prisma.application.findMany({
                where: { workspaceId },
                include: { candidate: true, job: true },
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            prisma.application.groupBy({
                by: ['stage'],
                where: { workspaceId },
                _count: {
                    id: true
                }
            }),
            prisma.job.findMany({
                where: { workspaceId, status: 'OPEN' },
                orderBy: { updatedAt: 'desc' },
                take: 3
            }),
            prisma.interview.findMany({
                where: { workspaceId },
                include: { application: { include: { candidate: true } } },
                orderBy: { startTime: 'asc' },
                take: 3
            })
        ]);

        const getCount = (stage) => stageCounts.find(s => s.stage === stage)?._count?.id || 0;

        const pipelineStats = [
            { label: "Applied", count: getCount('APPLIED'), color: "bg-blue-500", progress: 100 },
            { label: "Screening", count: getCount('SCREENING'), color: "bg-amber-500", progress: 80 },
            { label: "Technical", count: getCount('TECHNICAL'), color: "bg-primary", progress: 60 },
            { label: "Cultural", count: getCount('CULTURAL'), color: "bg-emerald-500", progress: 40 },
            { label: "Offer", count: getCount('OFFER'), color: "bg-indigo-500", progress: 20 }
        ];

        // Mocking some trends for UI
        const stats = [
            { label: "Total Applicants", value: totalCandidates.toLocaleString(), change: "+5%", icon: "UserPlus", color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Active Openings", value: activeJobs.toString(), change: "+2 new", icon: "Briefcase", color: "text-primary", bg: "bg-primary/10" },
            { label: "Total Applications", value: totalApplications.toLocaleString(), change: "+8%", icon: "TrendingUp", color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Interviews This Week", value: getCount('TECHNICAL').toString(), change: "4 today", icon: "Calendar", color: "text-amber-500", bg: "bg-amber-500/10" }
        ];

        return NextResponse.json({
            stats,
            recentApplicants: recentApplicants.map(app => ({
                id: app.id,
                candidate: {
                    id: app.candidate.id,
                    name: app.candidate.name,
                    avatar: app.candidate.avatarUrl
                },
                job: {
                    id: app.job.id,
                    title: app.job.title
                },
                stage: app.stage,
                createdAt: app.createdAt
            })),
            pipelineStats,
            focusJobs: focusJobs.map(j => ({
                id: j.id,
                title: j.title,
                dept: j.department || "General",
                applicants: 0, 
                status: j.status === 'OPEN' ? 'Active' : 'Closed'
            })),
            interviews: interviews.map(i => ({
                name: i.application?.candidate?.name || "Unknown",
                time: i.startTime ? new Date(i.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD",
                role: i.title || "Interview"
            }))
        });
    } catch (error) {
        console.error("[ATS_SUMMARY_GET]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
