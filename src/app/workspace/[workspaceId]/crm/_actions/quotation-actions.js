'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { getValidUserId } from "./auth-helper";
import { dispatchWhatsAppFromCrmAction } from "./whatsapp-template-actions";
import { createInvoice } from "../../payflow/_actions/payflow-actions";
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

/**
 * Public action: Fetch quotation for client online preview without workspace session
 */
export async function getPublicQuotationByIdAction(id) {
    try {
        if (!id) {
            return { success: false, error: "Quotation ID is required" };
        }

        const quotation = await prisma.quotation.findUnique({
            where: { id },
            include: {
                user: {
                    select: { displayName: true, email: true }
                }
            }
        });

        if (!quotation) {
            return { success: false, error: "Quotation not found or has expired" };
        }

        return { success: true, data: quotation };
    } catch (error) {
        console.error("[GET_PUBLIC_QUOTATION_ERROR]", error);
        return { success: false, error: "Unable to retrieve quotation" };
    }
}

/**
 * Public action: Client accepts and e-signs quotation online
 */
export async function submitPublicQuotationAcceptanceAction(id, payload) {
    try {
        const {
            signatureDataUrl,
            signatoryName,
            signatoryDesignation,
            notes
        } = payload || {};

        if (!id) {
            return { success: false, error: "Quotation ID is required" };
        }
        if (!signatoryName?.trim()) {
            return { success: false, error: "Signatory name is required" };
        }

        const quotation = await prisma.quotation.findUnique({
            where: { id }
        });

        if (!quotation) {
            return { success: false, error: "Quotation not found" };
        }

        const existingData = quotation.data || {};
        const clientSignature = {
            signatureDataUrl: signatureDataUrl || null,
            signatoryName: signatoryName.trim(),
            signatoryDesignation: signatoryDesignation?.trim() || 'Authorized Signatory',
            notes: notes?.trim() || '',
            acceptedAt: new Date().toISOString()
        };

        const updated = await prisma.quotation.update({
            where: { id },
            data: {
                status: 'accepted',
                data: {
                    ...existingData,
                    clientSignature
                }
            }
        });

        // Automation: If this quotation is linked to a CRM Deal, advance deal to "Won"
        const dealId = existingData?.quotation?.dealId;
        if (dealId) {
            try {
                const deal = await prisma.deal.findUnique({
                    where: { id: dealId },
                    include: {
                        pipeline: {
                            include: { stages: { orderBy: { order: 'asc' } } }
                        }
                    }
                });

                if (deal && deal.pipeline?.stages) {
                    const winningStage = deal.pipeline.stages.find(s => s.isWon) ||
                        deal.pipeline.stages.find(s => s.name?.toLowerCase().includes('won') || s.name?.toLowerCase().includes('closed won'));

                    if (winningStage && deal.stageId !== winningStage.id) {
                        await prisma.deal.update({
                            where: { id: deal.id },
                            data: {
                                stageId: winningStage.id,
                                closedAt: new Date()
                            }
                        });

                        await prisma.crmActivity.create({
                            data: {
                                workspaceId: deal.workspaceId,
                                userId: deal.userId,
                                dealId: deal.id,
                                contactId: deal.contactId || null,
                                accountId: deal.accountId || null,
                                type: "DEAL_STAGE_CHANGE",
                                title: `Deal Closed Won: Quotation ${quotation.quotationNumber} Accepted`,
                                description: `Quotation ${quotation.quotationNumber} was e-signed and approved by ${signatoryName}. Deal automatically moved to "${winningStage.name}".`
                            }
                        });
                    }
                }
            } catch (dealErr) {
                console.warn("[QUOTATION_AUTO_DEAL_WIN_WARN]", dealErr);
            }
        }

        // Log general activity
        if (quotation.workspaceId) {
            await prisma.crmActivity.create({
                data: {
                    workspaceId: quotation.workspaceId,
                    userId: quotation.userId,
                    dealId: dealId || null,
                    contactId: existingData?.client?.contactId || null,
                    type: "NOTE",
                    title: `Quotation ${quotation.quotationNumber} E-Signed & Accepted`,
                    description: `Client authorized quotation ${quotation.quotationNumber} for ₹${Number(quotation.total).toLocaleString('en-IN')}. Signed by: ${signatoryName}.`
                }
            }).catch(e => console.warn(e));

            revalidatePath(`/workspace/${quotation.workspaceId}/crm/quotations`);
            revalidatePath(`/workspace/${quotation.workspaceId}/crm/pipeline`);
        }

        return { success: true, data: updated };
    } catch (error) {
        console.error("[SUBMIT_PUBLIC_QUOTATION_ACCEPTANCE_ERROR]", error);
        return { success: false, error: error.message || "Failed to process quotation acceptance" };
    }
}

/**
 * Public action: Client declines or requests revisions for quotation online
 */
export async function submitPublicQuotationDeclineAction(id, payload) {
    try {
        const { reason } = payload || {};

        if (!id) {
            return { success: false, error: "Quotation ID is required" };
        }

        const quotation = await prisma.quotation.findUnique({
            where: { id }
        });

        if (!quotation) {
            return { success: false, error: "Quotation not found" };
        }

        const existingData = quotation.data || {};
        const updated = await prisma.quotation.update({
            where: { id },
            data: {
                status: 'declined',
                data: {
                    ...existingData,
                    declineReason: reason?.trim() || 'Client requested revisions.',
                    declinedAt: new Date().toISOString()
                }
            }
        });

        if (quotation.workspaceId) {
            await prisma.crmActivity.create({
                data: {
                    workspaceId: quotation.workspaceId,
                    userId: quotation.userId,
                    dealId: existingData?.quotation?.dealId || null,
                    contactId: existingData?.client?.contactId || null,
                    type: "NOTE",
                    title: `Quotation ${quotation.quotationNumber} Declined / Revision Requested`,
                    description: `Client declined quotation: "${reason || 'No specific feedback provided.'}"`
                }
            }).catch(e => console.warn(e));

            revalidatePath(`/workspace/${quotation.workspaceId}/crm/quotations`);
        }

        return { success: true, data: updated };
    } catch (error) {
        console.error("[SUBMIT_PUBLIC_QUOTATION_DECLINE_ERROR]", error);
        return { success: false, error: error.message || "Failed to process quotation decline" };
    }
}

/**
 * 1-Click Convert Accepted Quotation to PayFlow Invoice & Razorpay Link
 */
export async function convertQuotationToPayFlowInvoiceAction(workspaceId, quotationId) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        const quotation = await prisma.quotation.findFirst({
            where: { id: quotationId, workspaceId }
        });

        if (!quotation) {
            return { success: false, error: "Quotation not found" };
        }

        const qData = quotation.data || {};
        const client = qData.client || {};
        const items = Array.isArray(qData.items) && qData.items.length > 0 ? qData.items.map(item => ({
            desc: item.description ? `${item.name} - ${item.description}` : item.name,
            qty: Number(item.quantity) || 1,
            rate: Number(item.unitPrice) || 0
        })) : [
            { desc: qData.quotation?.title || `Quotation ${quotation.quotationNumber}`, qty: 1, rate: Number(quotation.total) }
        ];

        // Create formal PayFlow Invoice
        const invRes = await createInvoice(workspaceId, {
            client: quotation.clientName || client.company || client.name || 'Valued Client',
            clientEmail: client.email || 'billing@client.com',
            items: items,
            taxRate: 18,
            currency: qData.quotation?.currency || 'INR',
            notes: `Generated from Quotation ${quotation.quotationNumber}. Remit payment via Razorpay Smart Link, UPI, or NEFT/RTGS.`,
            gateway: 'Razorpay Smart Link & UPI'
        });

        if (!invRes.success) {
            return { success: false, error: invRes.error || "Failed to create invoice in PayFlow" };
        }

        const invoice = invRes.data;

        // Update Quotation with Invoice metadata
        const updatedQuotation = await prisma.quotation.update({
            where: { id: quotationId },
            data: {
                status: 'invoiced',
                data: {
                    ...qData,
                    invoice: {
                        id: invoice.id,
                        amount: invoice.amount,
                        date: invoice.date,
                        status: invoice.status,
                        gateway: invoice.gateway,
                        createdAt: new Date().toISOString()
                    }
                }
            }
        });

        // Log CRM Activity
        await prisma.crmActivity.create({
            data: {
                workspaceId,
                userId,
                dealId: qData.quotation?.dealId || null,
                contactId: client.contactId || null,
                type: "INVOICE_GENERATED",
                title: `PayFlow Invoice Created: ${invoice.id}`,
                description: `Quotation ${quotation.quotationNumber} converted to Invoice ${invoice.id} (${invoice.amount}) with Razorpay Smart Link.`,
                metadata: {
                    invoiceId: invoice.id,
                    quotationNumber: quotation.quotationNumber,
                    amount: invoice.amount
                }
            }
        }).catch(err => console.warn(err));

        revalidatePath(`/workspace/${workspaceId}/crm/quotations`);
        revalidatePath(`/workspace/${workspaceId}/payflow`);

        return { success: true, data: { invoice, quotation: updatedQuotation } };
    } catch (error) {
        console.error("[CONVERT_QUOTATION_TO_INVOICE_ERROR]", error);
        return { success: false, error: error.message || "Failed to convert quotation to invoice" };
    }
}

/**
 * Fetch quotations linked to a specific Deal
 */
export async function getDealQuotationsAction(workspaceId, dealId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        if (!workspaceId || !dealId) {
            return { success: true, data: [] };
        }

        const all = await prisma.quotation.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' }
        });

        const matched = all.filter(q => q.data?.quotation?.dealId === dealId);
        return { success: true, data: matched };
    } catch (error) {
        console.error("[GET_DEAL_QUOTATIONS_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch deal quotations" };
    }
}

/**
 * Fetch quotations linked to a specific Contact
 */
export async function getContactQuotationsAction(workspaceId, contactId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        if (!workspaceId || !contactId) {
            return { success: true, data: [] };
        }

        const all = await prisma.quotation.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' }
        });

        const matched = all.filter(q => q.data?.client?.contactId === contactId);
        return { success: true, data: matched };
    } catch (error) {
        console.error("[GET_CONTACT_QUOTATIONS_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch contact quotations" };
    }
}
