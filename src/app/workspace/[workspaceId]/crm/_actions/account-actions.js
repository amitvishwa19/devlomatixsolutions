'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess, getAuthSession } from "@/lib/auth-utils";
import { getValidUserId } from "./auth-helper";

/**
 * Get all B2B Accounts / Companies with stats
 */
export async function getAccountsAction(workspaceId, filters = {}) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const { search, industry, rating } = filters;

        const where = {
            workspaceId,
            industry: industry || undefined,
            rating: rating || undefined,
            ...(search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { domain: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                    { city: { contains: search, mode: 'insensitive' } }
                ]
            } : {})
        };

        const accounts = await prisma.account.findMany({
            where,
            include: {
                _count: {
                    select: {
                        contacts: true,
                        deals: true,
                        activities: true
                    }
                },
                deals: {
                    select: {
                        id: true,
                        title: true,
                        value: true,
                        stage: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, data: accounts };
    } catch (error) {
        console.error("[GET_ACCOUNTS_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch accounts" };
    }
}

/**
 * Get a single Account with all linked contacts, deals, and activities
 */
export async function getAccountByIdAction(workspaceId, accountId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const account = await prisma.account.findFirst({
            where: { id: accountId, workspaceId },
            include: {
                contacts: {
                    orderBy: { createdAt: 'desc' }
                },
                deals: {
                    include: { stage: true, pipeline: true },
                    orderBy: { updatedAt: 'desc' }
                },
                activities: {
                    include: {
                        user: { select: { id: true, displayName: true, avatar: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!account) {
            return { success: false, error: "Account not found" };
        }

        return { success: true, data: account };
    } catch (error) {
        console.error("[GET_ACCOUNT_BY_ID_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch account details" };
    }
}

/**
 * Create a new B2B Account
 */
export async function createAccountAction(workspaceId, data) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        const {
            name,
            domain,
            industry,
            size,
            website,
            phone,
            email,
            address,
            city,
            state,
            country,
            postalCode,
            annualRevenue,
            rating,
            ownerId,
            customFields = {}
        } = data;

        if (!name?.trim()) {
            return { success: false, error: "Company name is required" };
        }

        const account = await prisma.account.create({
            data: {
                workspaceId,
                userId,
                name: name.trim(),
                domain: domain ? domain.trim().toLowerCase() : null,
                industry,
                size,
                website,
                phone,
                email,
                address,
                city,
                state,
                country,
                postalCode,
                annualRevenue: annualRevenue ? parseFloat(annualRevenue) : null,
                rating,
                ownerId: ownerId || userId,
                customFields
            }
        });

        // Record Activity Log
        await prisma.crmActivity.create({
            data: {
                workspaceId,
                userId,
                accountId: account.id,
                type: "NOTE",
                title: "Company Created",
                description: `Company "${account.name}" registered in CRM.`
            }
        });

        return { success: true, data: account };
    } catch (error) {
        console.error("[CREATE_ACCOUNT_ERROR]", error);
        return { success: false, error: error.message || "Failed to create account" };
    }
}

/**
 * Update an Account
 */
export async function updateAccountAction(workspaceId, accountId, data) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session?.user?.id || "anonymous";

        const {
            name,
            domain,
            industry,
            size,
            website,
            phone,
            email,
            address,
            city,
            state,
            country,
            postalCode,
            annualRevenue,
            rating,
            ownerId,
            customFields
        } = data;

        const updatedAccount = await prisma.account.update({
            where: { id: accountId },
            data: {
                name: name ? name.trim() : undefined,
                domain: domain ? domain.trim().toLowerCase() : undefined,
                industry,
                size,
                website,
                phone,
                email,
                address,
                city,
                state,
                country,
                postalCode,
                annualRevenue: annualRevenue !== undefined ? (annualRevenue ? parseFloat(annualRevenue) : null) : undefined,
                rating,
                ownerId,
                customFields
            }
        });

        return { success: true, data: updatedAccount };
    } catch (error) {
        console.error("[UPDATE_ACCOUNT_ERROR]", error);
        return { success: false, error: error.message || "Failed to update account" };
    }
}

/**
 * Delete an Account
 */
export async function deleteAccountAction(workspaceId, accountId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        await prisma.account.delete({
            where: { id: accountId }
        });

        return { success: true };
    } catch (error) {
        console.error("[DELETE_ACCOUNT_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete account" };
    }
}
