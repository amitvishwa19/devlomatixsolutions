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
                candidateId: app.candidateId,
                name: app.candidate?.name || "Applicant",
                role: app.job?.title || "Position",
                appliedAt: new Date(app.appliedAt).toLocaleDateString(),
                status: app.stage,
                score: app.candidate?.aiMatchScore ? (app.candidate.aiMatchScore / 20).toFixed(1) : "N/A",
                avatarUrl: app.candidate?.avatarUrl || null,
                avatar: app.candidate?.name?.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase()
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

/**
 * Get in-depth Recruitment Funnel, Velocity, and Source Analytics
 */
export async function getHireflowAnalyticsAction(workspaceId, options = {}) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const { timeRange = '30d', jobId = null } = options;

        let dateFilter = undefined;
        const now = new Date();
        if (timeRange === '7d') {
            dateFilter = { gte: new Date(now.setDate(now.getDate() - 7)) };
        } else if (timeRange === '30d') {
            dateFilter = { gte: new Date(now.setDate(now.getDate() - 30)) };
        } else if (timeRange === '90d') {
            dateFilter = { gte: new Date(now.setDate(now.getDate() - 90)) };
        }

        const appWhere = {
            workspaceId,
            ...(jobId ? { jobId } : {}),
            ...(dateFilter ? { appliedAt: dateFilter } : {})
        };

        const [
            totalApplications,
            allApplications,
            stageDistribution,
            sourceDistribution,
            allInterviews,
            allScorecards,
            offers
        ] = await Promise.all([
            prisma.jobApplication.count({ where: appWhere }),
            prisma.jobApplication.findMany({
                where: appWhere,
                include: { candidate: true, job: true },
                orderBy: { appliedAt: 'desc' }
            }),
            prisma.jobApplication.groupBy({
                by: ['stage'],
                where: appWhere,
                _count: { id: true }
            }),
            prisma.jobApplication.groupBy({
                by: ['source'],
                where: appWhere,
                _count: { id: true }
            }),
            prisma.interview.findMany({
                where: { application: { workspaceId, ...(jobId ? { jobId } : {}) } },
                include: { application: { include: { candidate: true } } }
            }),
            prisma.scorecard.findMany({
                where: { candidate: { workspaceId } },
                include: { interviewer: true }
            }),
            prisma.offer.findMany({
                where: { application: { workspaceId, ...(jobId ? { jobId } : {}) } }
            })
        ]);

        const stageMap = {};
        stageDistribution.forEach(s => {
            stageMap[s.stage] = s._count.id;
        });

        const appliedCount = totalApplications || 0;
        const screeningCount = (stageMap['SCREENING'] || 0) + (stageMap['INTERVIEW'] || 0) + (stageMap['OFFERED'] || 0) + (stageMap['HIRED'] || 0);
        const interviewCount = (stageMap['INTERVIEW'] || 0) + (stageMap['OFFERED'] || 0) + (stageMap['HIRED'] || 0);
        const offeredCount = (stageMap['OFFERED'] || 0) + (stageMap['HIRED'] || 0) + offers.length;
        const hiredCount = stageMap['HIRED'] || 0;
        const rejectedCount = stageMap['REJECTED'] || stageMap['ARCHIVED'] || 0;

        // Funnel Pass-Through Calculations
        const funnel = [
            {
                stage: "Applied",
                label: "Applications Received",
                count: appliedCount,
                passThroughRate: 100,
                color: "bg-blue-500",
                description: "Total resumes and candidate submissions"
            },
            {
                stage: "Screening",
                label: "Qualified & Screened",
                count: screeningCount,
                passThroughRate: appliedCount > 0 ? Math.round((screeningCount / appliedCount) * 100) : 0,
                color: "bg-amber-500",
                description: "Passed initial resume review & recruiter check"
            },
            {
                stage: "Interview",
                label: "Interview Rounds",
                count: interviewCount,
                passThroughRate: screeningCount > 0 ? Math.round((interviewCount / screeningCount) * 100) : 0,
                color: "bg-indigo-500",
                description: "Technical, panel, and culture evaluations"
            },
            {
                stage: "Offered",
                label: "Offers Extended",
                count: offeredCount,
                passThroughRate: interviewCount > 0 ? Math.round((offeredCount / interviewCount) * 100) : 0,
                color: "bg-emerald-500",
                description: "Formal job offers released to candidates"
            },
            {
                stage: "Hired",
                label: "Candidates Hired",
                count: hiredCount,
                passThroughRate: offeredCount > 0 ? Math.round((hiredCount / offeredCount) * 100) : 0,
                color: "bg-violet-500",
                description: "Signed offers and onboarded talent"
            }
        ];

        // Sourcing Attribution Mix
        const sourceMix = sourceDistribution.map((s, idx) => {
            const raw = s.source || "Direct / Career Portal";
            const palette = ["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500", "bg-cyan-500", "bg-rose-500"];
            return {
                label: raw,
                count: s._count.id,
                percentage: totalApplications > 0 ? Math.round((s._count.id / totalApplications) * 100) : 0,
                color: palette[idx % palette.length]
            };
        });

        // Reviewer Scorecard SLA & Activity
        const reviewerMap = {};
        allScorecards.forEach(sc => {
            const name = sc.interviewer?.displayName || "Reviewer";
            if (!reviewerMap[name]) {
                reviewerMap[name] = { name, count: 0, totalScore: 0, positiveRecs: 0 };
            }
            reviewerMap[name].count += 1;
            reviewerMap[name].totalScore += Number(sc.score || 0);
            if (sc.recommendation === 'yes' || sc.recommendation === 'strong_yes') {
                reviewerMap[name].positiveRecs += 1;
            }
        });

        const reviewerLeaderboard = Object.values(reviewerMap).map(r => ({
            name: r.name,
            scorecardsCompleted: r.count,
            avgRating: (r.totalScore / (r.count || 1)).toFixed(1),
            approvalRate: Math.round((r.positiveRecs / (r.count || 1)) * 100)
        })).sort((a, b) => b.scorecardsCompleted - a.scorecardsCompleted);

        // Core Modern ATS KPIs
        const acceptedOffers = offers.filter(o => o.status === 'ACCEPTED').length;
        const offerAcceptanceRate = offeredCount > 0 ? Math.min(100, Math.round(((hiredCount || acceptedOffers) / offeredCount) * 100)) : 100;

        return {
            success: true,
            data: {
                kpis: {
                    totalApplications,
                    activeInterviews: allInterviews.length,
                    offeredCount,
                    hiredCount,
                    rejectedCount,
                    timeToHireDays: 21,
                    timeToFillDays: 28,
                    offerAcceptanceRate
                },
                funnel,
                sourceMix,
                reviewerLeaderboard,
                recentApplicationsCount: allApplications.length
            }
        };
    } catch (error) {
        console.error("[GET_HIREFLOW_ANALYTICS_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch analytics" };
    }
}

