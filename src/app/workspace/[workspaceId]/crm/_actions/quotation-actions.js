'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { getValidUserId } from "./auth-helper";
import { dispatchWhatsAppFromCrmAction } from "./whatsapp-template-actions";
import { revalidatePath } from "next/cache";

/**
 * Fetch all quotations for a workspace with metrics and filters
 */
export async function getCrmQuotationsAction(workspaceId, filters = {}) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const { search, status, page = 1, limit = 50 } = filters;
        const skip = (page - 1) * limit;

        const where = {
            workspaceId
        };

        if (status && status !== 'ALL') {
            where.status = status.toLowerCase();
        }

        if (search?.trim()) {
            const s = search.trim();
            where.OR = [
                { quotationNumber: { contains: s, mode: 'insensitive' } },
                { clientName: { contains: s, mode: 'insensitive' } }
            ];
        }

        const [quotations, totalCount, allForMetrics] = await Promise.all([
            prisma.quotation.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    user: {
                        select: { id: true, displayName: true, email: true, avatar: true }
                    }
                }
            }),
            prisma.quotation.count({ where }),
            prisma.quotation.findMany({
                where: { workspaceId },
                select: { total: true, status: true }
            })
        ]);

        // Compute KPI metrics across the workspace
        const totalValue = allForMetrics.reduce((sum, q) => sum + (Number(q.total) || 0), 0);
        const acceptedValue = allForMetrics
            .filter(q => q.status === 'accepted')
            .reduce((sum, q) => sum + (Number(q.total) || 0), 0);
        const sentValue = allForMetrics
            .filter(q => q.status === 'sent')
            .reduce((sum, q) => sum + (Number(q.total) || 0), 0);
        const draftCount = allForMetrics.filter(q => q.status === 'draft').length;
        const acceptedCount = allForMetrics.filter(q => q.status === 'accepted').length;

        return {
            success: true,
            data: {
                quotations,
                totalCount,
                metrics: {
                    totalQuotations: allForMetrics.length,
                    totalValue,
                    acceptedValue,
                    sentValue,
                    draftCount,
                    acceptedCount
                }
            }
        };
    } catch (error) {
        console.error("[GET_CRM_QUOTATIONS_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch quotations" };
    }
}

/**
 * Fetch a single quotation by ID
 */
export async function getCrmQuotationByIdAction(workspaceId, id) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const quotation = await prisma.quotation.findFirst({
            where: {
                id,
                workspaceId
            },
            include: {
                user: {
                    select: { id: true, displayName: true, email: true, avatar: true }
                }
            }
        });

        if (!quotation) {
            return { success: false, error: "Quotation not found" };
        }

        return { success: true, data: quotation };
    } catch (error) {
        console.error("[GET_CRM_QUOTATION_BY_ID_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch quotation" };
    }
}

/**
 * Create or update a quotation
 */
export async function saveCrmQuotationAction(workspaceId, payload) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        const {
            id,
            quotationNumber,
            clientName,
            total,
            status = 'draft',
            data = {}
        } = payload;

        // Auto-generate quotation number if creating new and not provided
        let finalNumber = quotationNumber?.trim();
        if (!finalNumber && !id) {
            const count = await prisma.quotation.count({ where: { workspaceId } });
            const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
            finalNumber = `QT-${dateStr}-${String(count + 1).padStart(4, '0')}`;
        }

        let quotation;
        if (id) {
            quotation = await prisma.quotation.update({
                where: { id },
                data: {
                    quotationNumber: finalNumber || undefined,
                    clientName: clientName || null,
                    total: Number(total) || 0,
                    status: status.toLowerCase(),
                    data: data || {}
                }
            });
        } else {
            quotation = await prisma.quotation.create({
                data: {
                    workspaceId,
                    userId,
                    quotationNumber: finalNumber,
                    clientName: clientName || null,
                    total: Number(total) || 0,
                    status: status.toLowerCase(),
                    data: data || {}
                }
            });

            // Log activity on linked contact if available
            const contactId = data?.client?.contactId;
            if (contactId) {
                await prisma.crmActivity.create({
                    data: {
                        workspaceId,
                        userId,
                        contactId,
                        dealId: data?.quotation?.dealId || null,
                        type: "NOTE",
                        title: `Quotation Created (${finalNumber})`,
                        description: `Created quotation "${data?.quotation?.title || finalNumber}" valued at ${data?.summary?.currency || '₹'}${Number(total).toLocaleString()}.`
                    }
                }).catch(err => console.warn('[QUOTATION_ACTIVITY_LOG_WARN]', err));
            }
        }

        revalidatePath(`/workspace/${workspaceId}/crm/quotations`);
        return { success: true, data: quotation };
    } catch (error) {
        console.error("[SAVE_CRM_QUOTATION_ERROR]", error);
        return { success: false, error: error.message || "Failed to save quotation" };
    }
}

/**
 * Update quotation status (draft, sent, accepted, declined, expired)
 */
export async function updateCrmQuotationStatusAction(workspaceId, id, status) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const quotation = await prisma.quotation.findFirst({
            where: { id, workspaceId }
        });

        if (!quotation) {
            return { success: false, error: "Quotation not found" };
        }

        const updated = await prisma.quotation.update({
            where: { id },
            data: { status: status.toLowerCase() }
        });

        revalidatePath(`/workspace/${workspaceId}/crm/quotations`);
        return { success: true, data: updated };
    } catch (error) {
        console.error("[UPDATE_CRM_QUOTATION_STATUS_ERROR]", error);
        return { success: false, error: error.message || "Failed to update quotation status" };
    }
}

/**
 * Delete a quotation
 */
export async function deleteCrmQuotationAction(workspaceId, id) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        await prisma.quotation.deleteMany({
            where: { id, workspaceId }
        });

        revalidatePath(`/workspace/${workspaceId}/crm/quotations`);
        return { success: true };
    } catch (error) {
        console.error("[DELETE_CRM_QUOTATION_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete quotation" };
    }
}

/**
 * Dispatch quotation summary to client via WhatsApp
 */
export async function sendCrmQuotationViaWhatsAppAction(workspaceId, payload) {
    try {
        const {
            quotationId,
            recipientPhone,
            recipientName,
            customText,
            contactId,
            dealId
        } = payload;

        if (!recipientPhone) {
            return { success: false, error: "Client phone number is required" };
        }

        const quotation = await prisma.quotation.findFirst({
            where: { id: quotationId, workspaceId }
        });

        if (!quotation) {
            return { success: false, error: "Quotation not found" };
        }

        // Dispatch WhatsApp message via KonnectX
        const dispatchRes = await dispatchWhatsAppFromCrmAction(workspaceId, {
            recipientPhone,
            recipientName: recipientName || quotation.clientName || 'Valued Client',
            messageType: 'CUSTOM',
            customText: customText.trim(),
            contactId: contactId || quotation.data?.client?.contactId || null,
            dealId: dealId || quotation.data?.quotation?.dealId || null
        });

        if (!dispatchRes.success) {
            return dispatchRes;
        }

        // Mark quotation as sent
        await prisma.quotation.update({
            where: { id: quotationId },
            data: { status: 'sent' }
        });

        revalidatePath(`/workspace/${workspaceId}/crm/quotations`);
        return { success: true, data: dispatchRes.data };
    } catch (error) {
        console.error("[SEND_CRM_QUOTATION_WHATSAPP_ERROR]", error);
        return { success: false, error: error.message || "Failed to dispatch quotation via WhatsApp" };
    }
}
