import { NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";
import { db } from "@/lib/db";

async function getUserId(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
  const payload = await decrypt(token);
  return payload?.userId || null;
}

export async function GET(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId) return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });

    const where = { workspaceId };

    const [totalApplicants, activeJobs, interviewsThisWeek, totalCandidates, recentApplicants, focusJobs, pipelineStats, interviews, stats] = await Promise.all([
      db.jobApplication.count({ where }),
      db.job.count({ where: { ...where, status: "OPEN" } }),
      db.interview.count({
        where: {
          application: { workspaceId },
          startTime: { gte: new Date(), lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      db.candidate.count({ where }),
      db.jobApplication.findMany({
        where,
        orderBy: { appliedAt: "desc" },
        take: 5,
        include: { candidate: true, job: true },
      }),
      db.job.findMany({ where: { ...where, status: "OPEN" }, take: 5, orderBy: { createdAt: "desc" }, include: { _count: { select: { applications: true } }, category: true } }),
      db.jobApplication.groupBy({ by: ["stage"], where, _count: true }),
      db.interview.findMany({
        where: { application: { workspaceId }, startTime: { gte: new Date() } },
        orderBy: { startTime: "asc" },
        take: 5,
        include: { application: { include: { candidate: true, job: true } } },
      }),
      db.job.aggregate({ where, _count: true }),
    ]);

    const totalStages = pipelineStats.reduce((sum, s) => sum + s._count, 0);

    return NextResponse.json({
      data: {
        stats: [
          { label: "Total Applicants", value: totalApplicants.toString(), icon: "Users", change: "+12%", trendStatus: "up" },
          { label: "Active Openings", value: activeJobs.toString(), icon: "Briefcase", change: "+2", trendStatus: "up" },
          { label: "Interviews This Week", value: interviewsThisWeek.toString(), icon: "Calendar", change: "", trendStatus: "up" },
          { label: "Candidates in Pipeline", value: totalCandidates.toString(), icon: "UserPlus", change: "", trendStatus: "up" },
        ],
        pipelineStats: pipelineStats.map((s) => ({
          label: s.stage,
          count: s._count,
          percentage: totalStages > 0 ? Math.round((s._count / totalStages) * 100) : 0,
        })),
        focusJobs: focusJobs.map((j) => ({
          title: j.title,
          dept: j.category?.name || j.department || "General",
          applicants: j._count.applications,
          status: j.status === "OPEN" ? "Active" : "Draft",
        })),
        recentApplicants: recentApplicants.map((a) => ({
          name: a.candidate?.name || "Unknown",
          role: a.job?.title || "Position",
          score: a.candidate?.aiMatchScore ? (a.candidate.aiMatchScore / 20).toFixed(1) : "N/A",
          appliedAt: a.appliedAt.toISOString(),
          status: a.stage,
        })),
        interviews: interviews.map((i) => ({
          id: i.id,
          name: i.application?.candidate?.name || "Unknown",
          role: i.application?.job?.title || "Position",
          time: i.startTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        })),
        analyticsStats: [
          { label: "Avg Days to Hire", value: "18", icon: "Clock", trend: "", trendStatus: "up" },
          { label: "Offer Acceptance", value: "92%", icon: "Target", trend: "+5%", trendStatus: "up" },
          { label: "Interview Pass Rate", value: "67%", icon: "BarChart3", trend: "", trendStatus: "up" },
          { label: "Total Jobs", value: stats._count.toString(), icon: "Users", trend: "", trendStatus: "up" },
        ],
        sourceMix: [
          { label: "LinkedIn", value: "45%", color: "bg-blue-500" },
          { label: "Referrals", value: "25%", color: "bg-emerald-500" },
          { label: "Company Site", value: "18%", color: "bg-amber-500" },
          { label: "Job Boards", value: "12%", color: "bg-purple-500" },
        ],
        teamPerformance: [],
        positionsHealth: focusJobs.map((j) => ({
          role: j.title,
          health: Math.min(100, (j._count.applications || 0) * 20),
          velocity: j._count.applications > 5 ? "Fast" : j._count.applications > 2 ? "Medium" : "Slow",
          candidates: j._count.applications,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to fetch summary" }, { status: 500 });
  }
}