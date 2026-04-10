import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const [
            totalCandidates, 
            activeJobs, 
            totalApplications, 
            recentApplicants, 
            stageCounts, 
            focusJobs, 
            interviews,
            sourceCounts,
            scorecardAgg
        ] = await Promise.all([
            prisma.candidate.count({ 
                where: { 
                    OR: [
                        { workspaceId },
                        { applications: { some: { workspaceId } } }
                    ]
                }
            }),
            prisma.job.count({ where: { workspaceId, status: 'OPEN' } }),
            prisma.application.count({ where: { workspaceId } }),
            prisma.application.findMany({
                where: { workspaceId },
                include: { candidate: true, job: true },
                orderBy: { appliedAt: 'desc' },
                take: 5
            }),
            prisma.application.groupBy({
                by: ['stage'],
                where: { workspaceId },
                _count: { id: true }
            }),
            prisma.job.findMany({
                where: { workspaceId, status: 'OPEN' },
                orderBy: { updatedAt: 'desc' },
                take: 5,
                include: { _count: { select: { applications: true } } }
            }),
            prisma.interview.findMany({
                where: { application: { workspaceId } },
                include: { application: { include: { candidate: true, job: true } } },
                orderBy: { startTime: 'asc' },
                take: 5
            }),
            prisma.application.groupBy({
                by: ['source'],
                where: { workspaceId },
                _count: { id: true }
            }),
            prisma.scorecard.groupBy({
                by: ['interviewerId'],
                where: { candidate: { workspaceId } },
                _count: { id: true },
                _avg: { score: true }
            })
        ]);

        const getCount = (stage) => stageCounts.find(s => s.stage === stage)?._count?.id || 0;
        
        const countApplied = getCount('APPLIED');
        const countScreening = getCount('SCREENING');
        const countTechnical = getCount('TECHNICAL');
        const countCultural = getCount('CULTURAL');
        const countOffer = getCount('OFFER');

        const pipelineStats = [
            { label: "Applied", count: countApplied, color: "bg-blue-500", percentage: totalApplications ? Math.round((countApplied/totalApplications)*100) : 100 },
            { label: "Screening", count: countScreening, color: "bg-amber-500", percentage: totalApplications ? Math.round((countScreening/totalApplications)*100) : 0 },
            { label: "Technical", count: countTechnical, color: "bg-primary", percentage: totalApplications ? Math.round((countTechnical/totalApplications)*100) : 0 },
            { label: "Cultural", count: countCultural, color: "bg-emerald-500", percentage: totalApplications ? Math.round((countCultural/totalApplications)*100) : 0 },
            { label: "Offer", count: countOffer, color: "bg-indigo-500", percentage: totalApplications ? Math.round((countOffer/totalApplications)*100) : 0 }
        ];

        // Fetch User details for interviewers
        const userIds = scorecardAgg.map(s => s.interviewerId);
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, displayName: true }
        });

        const teamPerformance = scorecardAgg.map(agg => {
            const user = users.find(u => u.id === agg.interviewerId);
            return {
                name: user?.displayName || "Unknown Reviewer",
                count: agg._count.id,
                score: Number(agg._avg.score || 0).toFixed(1),
                rate: "N/A" // Since acceptance isn't directly bound to scorecard
            };
        });

        const sourceConfig = [
            { id: 'LinkedIn', color: 'bg-primary' },
            { id: 'Referral', color: 'bg-emerald-500' },
            { id: 'Careers Page', color: 'bg-blue-500' },
            { id: 'Indeed', color: 'bg-amber-500' }
        ];

        const sourceMix = sourceCounts.map(sc => {
            const label = sc.source || "Direct Applied";
            const config = sourceConfig.find(c => label.toLowerCase().includes(c.id.toLowerCase())) || { color: 'bg-slate-500' };
            return {
                label,
                value: totalApplications ? `${Math.round((sc._count.id/totalApplications)*100)}%` : '0%',
                color: config.color
            };
        });

        const stats = [
            { label: "Total Candidates", value: totalCandidates.toLocaleString(), change: "Active", icon: "UserPlus", color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Active Jobs", value: activeJobs.toString(), change: "Open", icon: "Briefcase", color: "text-primary", bg: "bg-primary/10" },
            { label: "Total Applications", value: totalApplications.toLocaleString(), change: "Submitted", icon: "TrendingUp", color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Completed Screenings", value: countScreening.toString(), change: "In Progress", icon: "Calendar", color: "text-amber-500", bg: "bg-amber-500/10" }
        ];
        
        const analyticsStats = [
            { label: "Avg. Evaluation Score", value: scorecardAgg.length > 0 ? (scorecardAgg.reduce((a, b) => a + (b._avg.score || 0), 0) / scorecardAgg.length).toFixed(1) : "N/A", trend: "Live", trendStatus: "up", icon: "Target", color: "text-emerald-500" },
            { label: "Applications Tracked", value: totalApplications.toString(), trend: "Live", trendStatus: "up", icon: "Users", color: "text-blue-500" },
            { label: "Interviews Logged", value: interviews.length.toString(), trend: "Live", trendStatus: "neutral", icon: "Clock", color: "text-primary" },
            { label: "Open Focus Jobs", value: focusJobs.length.toString(), trend: "Live", trendStatus: "neutral", icon: "BarChart3", color: "text-amber-500" },
        ];

        return NextResponse.json({
            stats,
            analyticsStats,
            pipelineStats,
            teamPerformance,
            sourceMix,
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
                createdAt: app.appliedAt
            })),
            focusJobs: focusJobs.slice(0, 3).map(j => ({
                id: j.id,
                title: j.title,
                dept: j.department || "General",
                applicants: j._count.applications, 
                status: j.status === 'OPEN' ? 'Active' : 'Closed'
            })),
            positionsHealth: focusJobs.map(j => {
                // A quick dynamic health algo
                const health = Math.max(10, Math.min(100, Math.round((j._count.applications / 20) * 100)));
                return {
                    id: j.id,
                    role: j.title,
                    candidates: j._count.applications,
                    health,
                    velocity: health > 80 ? 'Fast' : health > 40 ? 'Stable' : 'Slow'
                };
            }),
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
