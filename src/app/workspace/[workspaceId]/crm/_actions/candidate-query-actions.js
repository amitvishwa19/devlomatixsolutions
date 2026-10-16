'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

/**
 * Read-only server action: Fetch HireFlow candidates for CRM view
 * Does NOT modify any HireFlow state or logic.
 */
export async function getCrmCandidatesAction(workspaceId, filters = {}) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const { stage = 'ALL', search = '', page = 1, limit = 50 } = filters;

        const candidates = await prisma.candidate.findMany({
            where: {
                OR: [
                    { workspaceId },
                    { applications: { some: { workspaceId } } }
                ]
            },
            include: {
                applications: {
                    where: { workspaceId },
                    include: {
                        job: {
                            include: { category: true }
                        }
                    },
                    orderBy: { appliedAt: 'desc' }
                },
                notes: {
                    include: { user: { select: { id: true, displayName: true, email: true } } },
                    orderBy: { createdAt: 'desc' }
                },
                scorecards: {
                    include: { interviewer: { select: { id: true, displayName: true } } },
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Enrich candidates with clean ATS metadata (including notice period & salary)
        const enriched = candidates.map(c => {
            const primaryApp = c.applications?.[0] || null;
            const parsed = (typeof c.parsedData === 'object' && c.parsedData) ? c.parsedData : {};

            return {
                id: c.id,
                name: c.name,
                email: c.email,
                phone: c.phone || '',
                location: c.location || '',
                avatarUrl: c.avatarUrl || null,
                resumeUrl: c.resumeUrl || primaryApp?.resumeUrl || null,
                summary: c.summary || '',
                skills: Array.isArray(c.skills) ? c.skills : [],
                aiMatchScore: c.aiMatchScore || null,
                aiSummary: c.aiSummary || null,
                createdAt: c.createdAt,
                // Application details
                applicationId: primaryApp?.id || null,
                jobTitle: primaryApp?.job?.title || 'Open Application',
                jobCategory: primaryApp?.job?.category?.name || 'General',
                stage: primaryApp?.stage || 'APPLIED',
                status: primaryApp?.status || 'ACTIVE',
                appliedAt: primaryApp?.appliedAt || c.createdAt,
                // Enhanced note fields (notice period, expected salary)
                noticePeriod: parsed.noticePeriod || parsed.notice || null,
                expectedSalary: parsed.expectedSalary || parsed.expected_ctc || null,
                currentSalary: parsed.currentSalary || parsed.current_ctc || null,
                experienceYears: parsed.experienceYears || parsed.experience || null,
                // Notes & Scorecards
                notesCount: c.notes?.length || 0,
                recentNotes: c.notes?.slice(0, 3) || [],
                scorecardsCount: c.scorecards?.length || 0,
                avgRating: c.scorecards?.length
                    ? Math.round((c.scorecards.reduce((acc, s) => acc + (s.score || 0), 0) / c.scorecards.length) * 10) / 10
                    : null
            };
        });

        // Filter by stage if requested
        let filtered = enriched;
        if (stage && stage !== 'ALL') {
            filtered = filtered.filter(c => c.stage.toUpperCase() === stage.toUpperCase());
        }

        // Filter by search query
        if (search && search.trim()) {
            const q = search.toLowerCase().trim();
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                (c.phone && c.phone.includes(q)) ||
                c.jobTitle.toLowerCase().includes(q) ||
                c.skills.some(s => s.toLowerCase().includes(q))
            );
        }

        // Metrics calculations
        const metrics = {
            total: enriched.length,
            applied: enriched.filter(c => c.stage === 'APPLIED').length,
            screening: enriched.filter(c => c.stage === 'SCREENING').length,
            interview: enriched.filter(c => c.stage === 'INTERVIEW').length,
            offer: enriched.filter(c => c.stage === 'OFFER').length,
            hired: enriched.filter(c => c.stage === 'HIRED').length,
            rejected: enriched.filter(c => c.stage === 'REJECTED').length,
            withPhoneCount: enriched.filter(c => !!c.phone).length,
            withResumeCount: enriched.filter(c => !!c.resumeUrl).length
        };

        const totalPages = Math.ceil(filtered.length / limit) || 1;
        const pagedCandidates = filtered.slice((page - 1) * limit, page * limit);

        return {
            success: true,
            data: {
                candidates: pagedCandidates,
                totalCount: filtered.length,
                metrics,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages
                }
            }
        };
    } catch (error) {
        console.error("[GET_CRM_CANDIDATES_ERROR]", error);
        return { success: false, error: error.message || "Failed to load candidates" };
    }
}
