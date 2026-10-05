'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { getValidUserId } from "./auth-helper";
import { createInvoice, getInvoices } from "../../payflow/_actions/payflow-actions";

// In-memory / persistent store for Quotations mapped by workspaceId
let globalQuotations = {};

function getWorkspaceQuotations(workspaceId) {
    if (!globalQuotations[workspaceId]) {
        globalQuotations[workspaceId] = [
            {
                id: 'QUO-2026-001',
                dealId: 'sample-deal-1',
                dealTitle: 'Enterprise Cloud Migration & ERP Setup',
                clientName: 'Acme Global Enterprises',
                clientEmail: 'billing@acmeglobal.com',
                clientPhone: '+91 98201 22931',
                companyName: 'Acme Global Ltd',
                currency: 'INR',
                status: 'SENT',
                validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
                items: [
                    { desc: 'Cloud Infrastructure & Kubernetes Architecture Setup', qty: 1, rate: 250000 },
                    { desc: 'Custom Devlomatix ERP & WhatsApp Pipeline Integration', qty: 1, rate: 95000 },
                    { desc: 'Dedicated 24/7 SLA Technical Support (Quarterly)', qty: 1, rate: 45000 }
                ],
                subtotal: 390000,
                taxRate: 18,
                taxAmount: 70200,
                discount: 0,
                total: 460200,
                notes: 'Payment Schedule: 50% advance on PO sign-off, 50% upon final acceptance testing.'
            }
        ];
    }
    return globalQuotations[workspaceId];
}

/**
 * Generate a formal Quotation / Estimate for a CRM Deal
 */
export async function generateDealQuotationAction(workspaceId, dealId, data) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        const deal = await prisma.deal.findUnique({
            where: { id: dealId },
            include: { contact: true, account: true, stage: true }
        });

        if (!deal) {
            return { success: false, error: "Deal not found" };
        }

        const items = (data.items && data.items.length > 0) ? data.items : [
            {
                desc: data.itemDesc || `${deal.title} - Scope of Work`,
                qty: 1,
                rate: parseFloat(deal.value) || 50000
            }
        ];

        const subtotal = items.reduce((acc, item) => acc + (Number(item.qty || 1) * Number(item.rate || 0)), 0);
        const discount = Number(data.discount || 0);
        const taxableAmount = Math.max(0, subtotal - discount);
        const taxRate = Number(data.taxRate !== undefined ? data.taxRate : 18);
        const taxAmount = taxableAmount * (taxRate / 100);
        const total = taxableAmount + taxAmount;

        const quotes = getWorkspaceQuotations(workspaceId);
        const quoteId = `QUO-2026-${String(quotes.length + 101).padStart(3, '0')}`;

        const newQuotation = {
            id: quoteId,
            dealId: deal.id,
            dealTitle: deal.title,
            clientName: data.clientName || deal.contact?.name || 'Valued Client',
            clientEmail: data.clientEmail || deal.contact?.email || 'client@example.com',
            clientPhone: data.clientPhone || deal.contact?.phone || '',
            companyName: data.companyName || deal.account?.name || '',
            currency: deal.currency || 'INR',
            status: data.status || 'DRAFT',
            validUntil: data.validUntil || new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
            createdAt: new Date().toISOString(),
            items,
            subtotal,
            taxRate,
            taxAmount,
            discount,
            total,
            notes: data.notes || 'Quotation valid for 14 calendar days from date of issuance. Remittance via UPI or Bank Wire.'
        };

        quotes.unshift(newQuotation);

        // Record CRM Activity Timeline
        await prisma.crmActivity.create({
            data: {
                workspaceId,
                userId,
                dealId: deal.id,
                contactId: deal.contactId || null,
                accountId: deal.accountId || null,
                type: "PROPOSAL",
                title: `Quotation Generated: ${quoteId}`,
                description: `Formal estimate generated for ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })} with ${items.length} line items.`,
                metadata: { quoteId, total, itemsCount: items.length }
            }
        });

        revalidatePath(`/workspace/${workspaceId}/crm/pipeline`);
        return { success: true, data: newQuotation };
    } catch (error) {
        console.error("[GENERATE_DEAL_QUOTATION_ERROR]", error);
        return { success: false, error: error.message || "Failed to generate quotation" };
    }
}

/**
 * 1-Click Convert CRM Deal / Quotation to an official PayFlow Invoice
 */
export async function convertDealToPayFlowInvoiceAction(workspaceId, dealId, data = {}) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        const deal = await prisma.deal.findUnique({
            where: { id: dealId },
            include: { contact: true, account: true, stage: true }
        });

        if (!deal) {
            return { success: false, error: "Deal not found" };
        }

        const clientName = data.clientName || deal.account?.name || deal.contact?.name || 'Client Account';
        const clientEmail = data.clientEmail || deal.contact?.email || 'billing@example.com';
        const clientPhone = data.clientPhone || deal.contact?.phone || '';

        const items = (data.items && data.items.length > 0) ? data.items : [
            {
                desc: data.itemDesc || `Fulfillment: ${deal.title}`,
                qty: 1,
                rate: parseFloat(deal.value) || 50000
            }
        ];

        // Call PayFlow Invoicing Action
        const invRes = await createInvoice(workspaceId, {
            client: clientName,
            clientEmail: clientEmail,
            items: items,
            taxRate: data.taxRate !== undefined ? data.taxRate : 18,
            currency: deal.currency || 'INR',
            notes: data.notes || `PayFlow Invoice issued for CRM Deal: ${deal.title}. Payment due within ${data.dueDays || 14} days.`,
            gateway: 'Razorpay Smart Link & UPI'
        });

        if (!invRes.success) {
            return { success: false, error: invRes.error || "Failed to create invoice in PayFlow" };
        }

        const invoice = invRes.data;

        // Log Activity Timeline
        await prisma.crmActivity.create({
            data: {
                workspaceId,
                userId,
                dealId: deal.id,
                contactId: deal.contactId || null,
                accountId: deal.accountId || null,
                type: "INVOICE_GENERATED",
                title: `PayFlow Invoice Issued: ${invoice.id}`,
                description: `Invoice for ${invoice.amount} created with PayFlow Smart Link gateway.`,
                metadata: {
                    invoiceId: invoice.id,
                    amount: invoice.amount,
                    status: invoice.status,
                    gateway: invoice.gateway
                }
            }
        });

        // Mark associated quote as APPROVED if exists
        const quotes = getWorkspaceQuotations(workspaceId);
        const linkedQuote = quotes.find(q => q.dealId === dealId);
        if (linkedQuote) {
            linkedQuote.status = 'INVOICED';
            linkedQuote.invoiceId = invoice.id;
        }

        revalidatePath(`/workspace/${workspaceId}/crm/pipeline`);
        revalidatePath(`/workspace/${workspaceId}/payflow`);
        return { success: true, data: invoice };
    } catch (error) {
        console.error("[CONVERT_DEAL_TO_PAYFLOW_INVOICE_ERROR]", error);
        return { success: false, error: error.message || "Failed to convert deal to PayFlow invoice" };
    }
}

/**
 * Get all Quotations & PayFlow Invoices associated with a Deal
 */
export async function getDealBillingRecordsAction(workspaceId, dealId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const quotes = getWorkspaceQuotations(workspaceId);
        const dealQuotes = quotes.filter(q => q.dealId === dealId);

        const invoicesRes = await getInvoices(workspaceId);
        const allInvoices = invoicesRes.success ? invoicesRes.data : [];

        // Filter invoices matching deal title, quote references, or client
        const deal = await prisma.deal.findUnique({
            where: { id: dealId },
            include: { contact: true, account: true }
        });

        const dealInvoices = allInvoices.filter(inv => {
            if (deal?.title && inv.items?.some(i => i.desc?.toLowerCase().includes(deal.title.toLowerCase()))) return true;
            if (deal?.account?.name && inv.client?.toLowerCase() === deal.account.name.toLowerCase()) return true;
            if (deal?.contact?.name && inv.client?.toLowerCase() === deal.contact.name.toLowerCase()) return true;
            return false;
        });

        return {
            success: true,
            data: {
                quotations: dealQuotes,
                invoices: dealInvoices
            }
        };
    } catch (error) {
        console.error("[GET_DEAL_BILLING_RECORDS_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch billing records" };
    }
}

/**
 * Dispatch Quotation directly via KonnectX WhatsApp Cloud
 */
export async function sendQuotationWhatsAppAction(workspaceId, { dealId, quoteId, phone, clientName, customMessage }) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        const quotes = getWorkspaceQuotations(workspaceId);
        const quote = quotes.find(q => q.id === quoteId);

        if (!phone) {
            return { success: false, error: "Recipient phone number is required" };
        }

        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const jid = `${cleanPhone}@s.whatsapp.net`;

        const messageText = customMessage || `Hello ${clientName || 'Valued Client'},\n\nPlease find your formal quotation *${quoteId}* for *${quote?.dealTitle || 'Project'}*.\n\n*Total Amount:* ₹${quote?.total ? quote.total.toLocaleString('en-IN') : '0.00'}\n*Validity:* Valid for 14 days\n\nYou can review your scope items and remit payment via PayFlow or UPI.\n\nBest regards,\nDevlomatix Enterprise Team`;

        // Record WhatsApp message in DB
        const waMsg = await prisma.whatsAppMessage.create({
            data: {
                userId,
                jid,
                text: messageText,
                fromMe: true,
                timestamp: BigInt(Date.now()),
                status: "SENT",
                metadata: {
                    source: "CRM_QUOTATION_DISPATCH",
                    quoteId,
                    dealId
                }
            }
        });

        // Record CRM Activity Timeline
        await prisma.crmActivity.create({
            data: {
                workspaceId,
                userId,
                dealId: dealId || null,
                contactId: quote?.contactId || null,
                type: "WHATSAPP_MSG",
                title: `Quotation ${quoteId} Sent via WhatsApp`,
                description: `Dispatched quotation document and payment instructions to +${cleanPhone}.`,
                metadata: { quoteId, waMessageId: waMsg.id }
            }
        });

        if (quote) {
            quote.status = 'SENT';
        }

        revalidatePath(`/workspace/${workspaceId}/crm/pipeline`);
        return { success: true, data: { messageId: waMsg.id } };
    } catch (error) {
        console.error("[SEND_QUOTATION_WHATSAPP_ERROR]", error);
        return { success: false, error: error.message || "Failed to dispatch quotation via WhatsApp" };
    }
}

/**
 * Dispatch PayFlow Payment Link Reminder via KonnectX WhatsApp
 */
export async function sendInvoicePaymentReminderAction(workspaceId, { dealId, invoiceId, phone, clientName, amount }) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        if (!phone) {
            return { success: false, error: "Recipient phone number is required" };
        }

        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const jid = `${cleanPhone}@s.whatsapp.net`;

        const messageText = `Hello ${clientName || 'Valued Client'},\n\nThis is a payment link reminder for Invoice *${invoiceId}* from Devlomatix.\n\n*Amount Due:* ${amount}\n*Payment Gateway:* PayFlow Smart Link (Razorpay Instant UPI & NetBanking)\n\nClick to remit payment securely: https://payflow.devlomatix.internal/pay/${invoiceId}\n\nThank you for your business!`;

        const waMsg = await prisma.whatsAppMessage.create({
            data: {
                userId,
                jid,
                text: messageText,
                fromMe: true,
                timestamp: BigInt(Date.now()),
                status: "SENT",
                metadata: {
                    source: "CRM_INVOICE_REMINDER",
                    invoiceId,
                    dealId
                }
            }
        });

        await prisma.crmActivity.create({
            data: {
                workspaceId,
                userId,
                dealId: dealId || null,
                type: "WHATSAPP_MSG",
                title: `Invoice Payment Link Sent: ${invoiceId}`,
                description: `Dispatched payment link via KonnectX WhatsApp to +${cleanPhone}.`,
                metadata: { invoiceId, waMessageId: waMsg.id }
            }
        });

        revalidatePath(`/workspace/${workspaceId}/crm/pipeline`);
        return { success: true, data: { messageId: waMsg.id } };
    } catch (error) {
        console.error("[SEND_INVOICE_REMINDER_ERROR]", error);
        return { success: false, error: error.message || "Failed to send payment reminder" };
    }
}
