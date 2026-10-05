import { prisma } from "@/lib/prisma";
import { validateCrmUserToken } from "../_lib/auth";
import { apiSuccess, apiError } from "../_lib/response";

/**
 * GET /api/v5/crm/accounts
 * Query: search, tier, industry, page, limit
 */
export async function GET(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const tier = searchParams.get("tier");
        const industry = searchParams.get("industry");

        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "50", 10);
        const skip = (page - 1) * limit;

        const where = {
            workspaceId: auth.workspaceId,
            ...(tier && tier !== 'ALL' ? { tier } : {}),
            ...(industry && industry !== 'ALL' ? { industry } : {}),
            ...(search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { domain: { contains: search, mode: 'insensitive' } },
                    { industry: { contains: search, mode: 'insensitive' } }
                ]
            } : {})
        };

        const [accounts, total] = await Promise.all([
            prisma.account.findMany({
                where,
                include: {
                    contacts: { select: { id: true, name: true, phone: true, email: true, title: true } },
                    deals: { select: { id: true, title: true, value: true, stageId: true } },
                    _count: {
                        select: {
                            contacts: true,
                            deals: true,
                            crmActivities: true
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.account.count({ where })
        ]);

        return apiSuccess(accounts, {
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error("[API_CRM_GET_ACCOUNTS_ERROR]", error);
        return apiError(error.message || "Failed to fetch accounts", 500);
    }
}

/**
 * POST /api/v5/crm/accounts
 * Body: { name, domain, industry, size, tier, annualRevenue, phone, address }
 */
export async function POST(request) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const body = await request.json();
        const {
            name,
            domain,
            industry = "Technology",
            size = "11-50",
            tier = "WARM",
            annualRevenue = 0,
            phone,
            address
        } = body;

        if (!name?.trim()) {
            return apiError("Company name is required", 400);
        }

        const account = await prisma.account.create({
            data: {
                workspaceId: auth.workspaceId,
                userId: auth.userId,
                name: name.trim(),
                domain: domain ? domain.trim().toLowerCase() : null,
                industry,
                size,
                tier,
                annualRevenue: parseFloat(annualRevenue) || 0,
                phone: phone ? phone.trim() : null,
                address: address || null
            }
        });

        // Record Activity
        await prisma.crmActivity.create({
            data: {
                workspaceId: auth.workspaceId,
                userId: auth.userId,
                accountId: account.id,
                type: "NOTE",
                title: "Company Account Created via API",
                description: `Created organization profile for ${account.name}.`
            }
        });

        return apiSuccess(account, { message: "Account created successfully" }, 201);
    } catch (error) {
        console.error("[API_CRM_CREATE_ACCOUNT_ERROR]", error);
        return apiError(error.message || "Failed to create account", 500);
    }
}
