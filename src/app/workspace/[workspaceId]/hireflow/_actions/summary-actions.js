'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

/**
 * Get full recruitment dashboard summary for a workspace
 */
export async function getHireflowSummaryAction(workspaceId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

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
            prisma.jobApplication.count({ where: { workspaceId } }),
            prisma.jobApplication.findMany({
                where: { workspaceId },
                include: { candidate: true, job: true },
                orderBy: { appliedAt: 'desc' },
                take: 5
            }),
            prisma.jobApplication.groupBy({
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
            prisma.jobApplication.groupBy({
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
        const countTechnical = getCount('TECHNICAL') || getCount('INTERVIEW');
        const countCultural = getCount('CULTURAL') || getCount('OFFERED');
        const countOffer = getCount('OFFER') || getCount('HIRED');

        const pipelineStats = [
            { label: "Applied", count: countApplied, color: "bg-blue-500", percentage: totalApplications ? Math.round((countApplied/totalApplications)*100) : 100 },
            { label: "Screening", count: countScreening, color: "bg-amber-500", percentage: totalApplications ? Math.round((countScreening/totalApplications)*100) : 0 },
            { label: "Interview", count: countTechnical, color: "bg-primary", percentage: totalApplications ? Math.round((countTechnical/totalApplications)*100) : 0 },
            { label: "Offered", count: countCultural, color: "bg-emerald-500", percentage: totalApplications ? Math.round((countCultural/totalApplications)*100) : 0 },
            { label: "Hired", count: countOffer, color: "bg-indigo-500", percentage: totalApplications ? Math.round((countOffer/totalApplications)*100) : 0 }
        ];

        // Fetch User details for interviewers
        const userIds = scorecardAgg.map(s => s.interviewerId).filter(Boolean);
        const users = userIds.length > 0 ? await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, displayName: true }
        }) : [];

        const teamPerformance = scorecardAgg.map(agg => {
            const user = users.find(u => u.id === agg.interviewerId);
            return {
                name: user?.displayName || "Reviewer",
                count: agg._count.id,
                score: Number(agg._avg.score || 0).toFixed(1),
                rate: "N/A"
            };
        });

        const summary = {
            stats: {
                totalCandidates,
                activeJobs,
                totalApplications,
                activeInterviews: interviews.length
            },
            recentApplicants: recentApplicants.map(app => ({
                id: app.id,
                name: app.candidate?.name || "Applicant",
                role: app.job?.title || "Position",
                appliedAt: new Date(app.appliedAt).toLocaleDateString(),
                status: app.stage,
                score: app.candidate?.aiMatchScore ? (app.candidate.aiMatchScore / 20).toFixed(1) : "N/A",
                avatar: app.candidate?.name?.split(' ').map(n => n[0]).join('').substring(0, 2)
            })),
            pipelineStats,
            focusJobs: focusJobs.map(j => ({
                id: j.id,
                title: j.title,
                department: j.department || "General",
                applicantsCount: j._count.applications
            })),
            upcomingInterviews: interviews.map(i => ({
                id: i.id,
                candidateName: i.application?.candidate?.name,
                jobTitle: i.application?.job?.title,
                time: new Date(i.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: new Date(i.startTime).toLocaleDateString()
            })),
            sourceDistribution: sourceCounts.map(s => ({
                source: s.source || "Direct / Career Portal",
                count: s._count.id
            })),
            teamPerformance
        };

        return { success: true, data: summary };
    } catch (error) {
        console.error("[GET_HIREFLOW_SUMMARY_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch summary" };
    }
}
