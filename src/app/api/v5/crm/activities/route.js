import { prisma } from "@/lib/prisma";
import { validateCrmUserToken } from "../_lib/auth";
import { apiSuccess, apiError } from "../_lib/response";

/**
 * GET /api/v5/crm/activities
 * Query: dealId, contactId, accountId, type, limit
 */
export async function GET(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { searchParams } = new URL(request.url);
        const dealId = searchParams.get("dealId");
        const contactId = searchParams.get("contactId");
        const accountId = searchParams.get("accountId");
        const type = searchParams.get("type");
        const limit = parseInt(searchParams.get("limit") || "50", 10);

        const where = {
            workspaceId: auth.workspaceId,
            ...(dealId ? { dealId } : {}),
            ...(contactId ? { contactId } : {}),
            ...(accountId ? { accountId } : {}),
            ...(type && type !== 'ALL' ? { type } : {})
        };

        const activities = await prisma.crmActivity.findMany({
            where,
            include: {
                user: { select: { id: true, displayName: true, email: true, avatar: true } },
                contact: { select: { id: true, name: true, phone: true } },
                deal: { select: { id: true, title: true, value: true } },
                account: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return apiSuccess(activities);
    } catch (error) {
        console.error("[API_CRM_GET_ACTIVITIES_ERROR]", error);
        return apiError(error.message || "Failed to fetch activities", 500);
    }
}

/**
 * POST /api/v5/crm/activities
 * Body: { type, title, description, dealId, contactId, accountId, metadata }
 */
export async function POST(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const body = await request.json();
        const {
            type = "NOTE",
            title,
            description,
            dealId,
            contactId,
            accountId,
            metadata = {}
        } = body;

        if (!title?.trim()) return apiError("Activity title is required", 400);

        const activity = await prisma.crmActivity.create({
            data: {
                workspaceId: auth.workspaceId,
                userId: auth.userId,
                type,
                title: title.trim(),
                description: description ? description.trim() : null,
                dealId: dealId || null,
                contactId: contactId || null,
                accountId: accountId || null,
                metadata
            },
            include: {
                user: { select: { id: true, displayName: true, avatar: true } }
            }
        });

        return apiSuccess(activity, { message: "Activity logged successfully" }, 201);
    } catch (error) {
        console.error("[API_CRM_CREATE_ACTIVITY_ERROR]", error);
        return apiError(error.message || "Failed to log activity", 500);
    }
}
