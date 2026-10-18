'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { getValidUserId } from "./auth-helper";
import { dispatchWhatsAppFromCrmAction } from "./whatsapp-template-actions";
import { createInvoice } from "../../payflow/_actions/payflow-actions";
import { revalidatePath } from "next/cache";
import React from "react";
import { Resend } from "resend";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import QuotationEmailTemplate from "@/emails/QuotationEmailTemplate";


/**
 * Safely create a CrmActivity record, verifying foreign key references (contactId, dealId, accountId).
 * Prevents foreign key constraint violations from causing quotation actions to fail.
 */
async function safeLogCrmActivity(workspaceId, userId, activityData) {
    if (!workspaceId) return null;
    try {
        let validContactId = null;
        if (activityData.contactId && activityData.contactId !== 'MANUAL' && activityData.contactId !== 'NONE') {
            const c = await prisma.contact.findFirst({
                where: { id: activityData.contactId, workspaceId },
                select: { id: true }
            }).catch(() => null);
            if (c) validContactId = c.id;
        }

        let validDealId = null;
        if (activityData.dealId && activityData.dealId !== 'MANUAL' && activityData.dealId !== 'NONE') {
            const d = await prisma.deal.findFirst({
                where: { id: activityData.dealId, workspaceId },
                select: { id: true }
            }).catch(() => null);
            if (d) validDealId = d.id;
        }

        let validAccountId = null;
        if (activityData.accountId && activityData.accountId !== 'MANUAL' && activityData.accountId !== 'NONE') {
            const a = await prisma.account.findFirst({
                where: { id: activityData.accountId, workspaceId },
                select: { id: true }
            }).catch(() => null);
            if (a) validAccountId = a.id;
        }

        return await prisma.crmActivity.create({
            data: {
                workspaceId,
                userId: userId || 'system',
                type: activityData.type || "NOTE",
                title: activityData.title || "Quotation Activity",
                description: activityData.description || null,
                metadata: activityData.metadata || null,
                contactId: validContactId,
                dealId: validDealId,
                accountId: validAccountId
            }
        });
    } catch (err) {
        console.warn("[SAFE_CRM_ACTIVITY_LOG_WARN]", err.message || err);
        return null;
    }
}

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

        // Fetch workspace business settings
        let enrichedData = { ...(data || {}) };
        const wsSettings = await prisma.appSettings.findUnique({
            where: { key: workspaceId }
        }).catch(() => null);
        const business = wsSettings?.general?.business || {};

        // Auto-generate quotation number if creating new and not provided
        let finalNumber = quotationNumber?.trim();
        if (!finalNumber && !id) {
            const prefix = business.quotationPrefix || 'QT-';
            const count = await prisma.quotation.count({ where: { workspaceId } });
            const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
            finalNumber = `${prefix}${dateStr}-${String(count + 1).padStart(4, '0')}`;
        }

        // Enrich company details with workspace business profile if missing
        if (Object.keys(business).length > 0) {
            const rawCompany = enrichedData.company || {};
            const formattedAddr = [
                business.addressLine1,
                business.addressLine2,
                business.city,
                business.state,
                business.pincode,
                business.country
            ].filter(Boolean).join(', ');

            enrichedData.company = {
                name: rawCompany.name || business.legalName || business.tradeName || 'Devlomatix Solutions',
                tradeName: rawCompany.tradeName || business.tradeName || '',
                logoUrl: rawCompany.logoUrl || '',
                address: rawCompany.address || formattedAddr || '',
                email: rawCompany.email || business.billingEmail || business.email || '',
                phone: rawCompany.phone || business.phone || business.mobile || '',
                website: rawCompany.website || business.website || '',
                taxId: rawCompany.taxId || (business.gstin ? (business.gstin.startsWith('GSTIN:') ? business.gstin : `GSTIN: ${business.gstin}`) : ''),
                pan: rawCompany.pan || business.pan || '',
                cin: rawCompany.cin || business.cin || '',
                bankName: rawCompany.bankName || business.bankName || '',
                accountNumber: rawCompany.accountNumber || business.accountNumber || '',
                accountHolder: rawCompany.accountHolder || business.accountHolder || '',
                accountType: rawCompany.accountType || business.accountType || 'current',
                ifsc: rawCompany.ifsc || business.ifsc || '',
                branch: rawCompany.branch || business.branch || '',
                upiId: rawCompany.upiId || business.upiId || '',
                signatoryName: rawCompany.signatoryName || business.signatoryName || '',
                signatoryDesignation: rawCompany.signatoryDesignation || business.signatoryDesignation || 'Director / Authorized Signatory'
            };

            if (!enrichedData.terms && business.defaultTerms) {
                enrichedData.terms = business.defaultTerms;
            }
            if (!enrichedData.notes && business.defaultNotes) {
                enrichedData.notes = business.defaultNotes;
            }
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
                    data: enrichedData
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
                    data: enrichedData
                }
            });

            // Log activity on linked contact/deal if available
            await safeLogCrmActivity(workspaceId, userId, {
                contactId: data?.client?.contactId,
                dealId: data?.quotation?.dealId,
                type: "NOTE",
                title: `Quotation Created (${finalNumber})`,
                description: `Created quotation "${data?.quotation?.title || finalNumber}" valued at ${data?.summary?.currency || '₹'}${Number(total).toLocaleString()}.`
            });
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

                        await safeLogCrmActivity(deal.workspaceId, deal.userId, {
                            dealId: deal.id,
                            contactId: deal.contactId,
                            accountId: deal.accountId,
                            type: "DEAL_STAGE_CHANGE",
                            title: `Deal Closed Won: Quotation ${quotation.quotationNumber} Accepted`,
                            description: `Quotation ${quotation.quotationNumber} was e-signed and approved by ${signatoryName}. Deal automatically moved to "${winningStage.name}".`
                        });
                    }
                }
            } catch (dealErr) {
                console.warn("[QUOTATION_AUTO_DEAL_WIN_WARN]", dealErr);
            }
        }

        // Log general activity
        if (quotation.workspaceId) {
            await safeLogCrmActivity(quotation.workspaceId, quotation.userId, {
                dealId,
                contactId: existingData?.client?.contactId,
                type: "NOTE",
                title: `Quotation ${quotation.quotationNumber} E-Signed & Accepted`,
                description: `Client authorized quotation ${quotation.quotationNumber} for ₹${Number(quotation.total).toLocaleString('en-IN')}. Signed by: ${signatoryName}.`
            });

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
            await safeLogCrmActivity(quotation.workspaceId, quotation.userId, {
                dealId: existingData?.quotation?.dealId,
                contactId: existingData?.client?.contactId,
                type: "NOTE",
                title: `Quotation ${quotation.quotationNumber} Declined / Revision Requested`,
                description: `Client declined quotation: "${reason || 'No specific feedback provided.'}"`
            });

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
        await safeLogCrmActivity(workspaceId, userId, {
            dealId: qData.quotation?.dealId,
            contactId: client.contactId,
            type: "INVOICE_GENERATED",
            title: `PayFlow Invoice Created: ${invoice.id}`,
            description: `Quotation ${quotation.quotationNumber} converted to Invoice ${invoice.id} (${invoice.amount}) with Razorpay Smart Link.`,
            metadata: {
                invoiceId: invoice.id,
                quotationNumber: quotation.quotationNumber,
                amount: invoice.amount
            }
        });

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

/**
 * Send quotation via Email with React Email template and attached PDF
 */
export async function sendCrmQuotationViaEmailAction(workspaceId, payload) {
    try {
        await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId();

        const {
            quotationId,
            recipientEmail,
            recipientName,
            subject,
            customMessage,
            pdfBase64,
            pdfFilename
        } = payload || {};

        if (!quotationId || !recipientEmail) {
            return { success: false, error: "Quotation ID and Recipient Email are required" };
        }

        const quotation = await prisma.quotation.findFirst({
            where: { id: quotationId, workspaceId }
        });

        if (!quotation) {
            return { success: false, error: "Quotation not found" };
        }

        const qData = quotation.data || {};
        const client = qData.client || {};
        const quotationInfo = qData.quotation || {};
        const items = qData.items || [];
        const companyInfo = qData.company || {};
        const summary = qData.summary || {};

        const currency = quotationInfo.currency || summary.currency || 'INR';
        const currencySymbol = currency === 'INR' ? '₹' : (currency === 'USD' ? '$' : (currency === 'EUR' ? '€' : '₹'));
        const totalAmount = Number(quotation.total) || Number(summary.grandTotal) || 0;

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://devlomatix.com';
        const publicUrl = `${baseUrl}/quotations/view/${quotation.id}`;

        const companyName = companyInfo.name || "Devlomatix Solutions";
        const companyEmail = companyInfo.email || "sales@devlomatix.com";
        const companyPhone = companyInfo.phone || "+91 98765 43210";
        const companyWebsite = companyInfo.website || "https://devlomatix.com";
        const companyLogo = companyInfo.logoUrl || "";

        const clientDisplayName = recipientName || client.contactPerson || client.name || quotation.clientName || 'Valued Client';
        const clientCompany = client.company || "";

        const emailSubject = subject || `Commercial Proposal: ${quotation.quotationNumber} - ${quotationInfo.title || 'Official Quotation'}`;
        const finalPdfName = pdfFilename || `Quotation_${quotation.quotationNumber}.pdf`;

        // Prepare attachments
        const attachments = [];
        if (pdfBase64) {
            const cleanBase64 = String(pdfBase64).replace(/^data:application\/pdf;base64,/, '').replace(/^data:.*?;base64,/, '');
            attachments.push({
                filename: finalPdfName,
                content: Buffer.from(cleanBase64, 'base64')
            });
        }

        // Email props for template
        const templateProps = {
            quotationNumber: quotation.quotationNumber,
            quotationTitle: quotationInfo.title || "Commercial Proposal",
            clientName: clientDisplayName,
            clientCompany,
            companyName,
            companyLogo,
            companyEmail: process.env.SALES_MAIL || companyEmail || "sales@devlomatix.com",
            companyPhone,
            companyWebsite,
            currencySymbol,
            totalAmount,
            items,
            issueDate: quotationInfo.issueDate || (quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString() : ''),
            validUntil: quotationInfo.validUntil || '',
            customMessage,
            publicUrl,
            hasAttachment: attachments.length > 0,
            attachmentName: finalPdfName
        };

        let emailDispatched = false;
        let dispatchMethod = 'RESEND';
        let errorDetail = null;

        // 1. Try Resend (Workspace Credentials first, then process.env.RESEND_API_KEY)
        try {
            const credential = await prisma.credentials.findFirst({
                where: {
                    workspaceId,
                    platform: 'RESEND'
                }
            });

            let apiKey = process.env.RESEND_API_KEY;
            if (credential?.credentials) {
                const creds = typeof credential.credentials === 'string' ? JSON.parse(credential.credentials) : credential.credentials;
                if (creds.apiKey || creds.api_key) {
                    apiKey = creds.apiKey || creds.api_key;
                }
            }

            if (apiKey) {
                const resendClient = new Resend(apiKey);
                const rawFrom = process.env.SALES_MAIL || process.env.RESEND_FROM_EMAIL || 'sales@devlomatix.com';
                const fromEmailMatch = rawFrom.match(/<([^>]+)>/);
                const pureSenderEmail = fromEmailMatch ? fromEmailMatch[1].trim() : rawFrom.trim();
                const senderDisplayName = (companyName || 'Devlomatix Solutions').replace(/[<>\r\n]/g, '').trim();
                const fromHeader = `${senderDisplayName} <${pureSenderEmail}>`;

                const emailHtml = await render(<QuotationEmailTemplate {...templateProps} />);

                const resendPayload = {
                    from: fromHeader,
                    to: recipientEmail,
                    reply_to: process.env.SALES_MAIL || companyEmail || pureSenderEmail,
                    subject: emailSubject,
                    html: emailHtml,
                };

                if (attachments.length > 0) {
                    resendPayload.attachments = attachments;
                }

                const resendResult = await resendClient.emails.send(resendPayload);
                if (resendResult?.error) {
                    console.error("[QUOTATION_EMAIL_RESEND_ERROR]", resendResult.error);
                    throw new Error(resendResult.error.message || "Resend dispatch failed");
                }

                console.info("[QUOTATION_EMAIL_RESEND_SUCCESS]", {
                    id: resendResult?.data?.id,
                    recipient: recipientEmail,
                    from: fromHeader,
                    replyTo: resendPayload.reply_to,
                    hasAttachments: attachments.length > 0
                });

                emailDispatched = true;
                dispatchMethod = 'RESEND';
            }
        } catch (resendErr) {
            console.error("[QUOTATION_EMAIL_RESEND_FAILED]", resendErr);
            errorDetail = resendErr.message;
        }

        // 2. Fallback to Nodemailer if Resend did not send and MAIL_SERVICE_HOST is provided
        if (!emailDispatched && process.env.MAIL_SERVICE_HOST) {
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.MAIL_SERVICE_HOST,
                    port: Number(process.env.MAIL_SERVICE_PORT) || 587,
                    secure: false,
                    auth: {
                        user: process.env.MAIL_SERVICE_USERNAME,
                        pass: process.env.MAIL_SERVICE_PASSWORD
                    }
                });

                const emailHtml = await render(<QuotationEmailTemplate {...templateProps} />);

                const mailOptions = {
                    from: `"${companyName}" <${process.env.SALES_MAIL || process.env.MAIL_SERVER_ADDRESS || process.env.MAIL_SERVICE_NAME || 'sales@devlomatix.com'}>`,
                    to: recipientEmail,
                    replyTo: process.env.SALES_MAIL || companyEmail || 'sales@devlomatix.com',
                    subject: emailSubject,
                    html: emailHtml,
                    attachments: attachments.map(a => ({
                        filename: a.filename,
                        content: a.content,
                        contentType: 'application/pdf'
                    }))
                };

                await transporter.sendMail(mailOptions);
                emailDispatched = true;
                dispatchMethod = 'NODEMAILER';
            } catch (smtpErr) {
                console.error("[QUOTATION_EMAIL_SMTP_FAILED]", smtpErr);
                errorDetail = smtpErr.message;
            }
        }

        // If neither service sent the email, report the actual failure
        if (!emailDispatched) {
            return {
                success: false,
                error: errorDetail || "Failed to dispatch email. Please verify your recipient email and email service configuration."
            };
        }

        // Update status to 'sent' if currently 'draft'
        let updatedQuotation = quotation;
        if (quotation.status === 'draft') {
            updatedQuotation = await prisma.quotation.update({
                where: { id: quotationId },
                data: { status: 'sent' }
            });
        }

        // Log CRM Activity
        await safeLogCrmActivity(workspaceId, userId, {
            dealId: quotationInfo.dealId,
            contactId: client.contactId,
            type: "EMAIL",
            title: `Quotation Emailed: ${quotation.quotationNumber}`,
            description: `Sent proposal to ${recipientEmail} (${clientDisplayName}) with PDF attachment ${finalPdfName} via ${dispatchMethod}.`,
            metadata: {
                quotationId: quotation.id,
                quotationNumber: quotation.quotationNumber,
                recipientEmail,
                subject: emailSubject,
                hasPdfAttachment: attachments.length > 0,
                dispatchMethod
            }
        });

        revalidatePath(`/workspace/${workspaceId}/crm/quotations`);
        revalidatePath(`/workspace/${workspaceId}/crm/quotations/${quotationId}`);
        if (quotationInfo.dealId) {
            revalidatePath(`/workspace/${workspaceId}/crm/pipeline`);
        }
        if (client.contactId) {
            revalidatePath(`/workspace/${workspaceId}/crm/contacts/${client.contactId}`);
        }

        return {
            success: true,
            data: {
                quotation: updatedQuotation,
                dispatchMethod,
                recipientEmail
            }
        };
    } catch (error) {
        console.error("[SEND_CRM_QUOTATION_VIA_EMAIL_ERROR]", error);
        return { success: false, error: error.message || "Failed to send quotation email" };
    }
}

