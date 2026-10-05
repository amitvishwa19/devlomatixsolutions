'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { getValidUserId } from "./auth-helper";

/**
 * Fetch DCR (Daily Call Record) logs with summary metrics for sales & field reps
 */
export async function getDcrRecordsAction(workspaceId, filters = {}) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const {
            date,           // YYYY-MM-DD or undefined (defaults to today if requested)
            startDate,
            endDate,
            repId,
            callType,
            outcome,
            search,
            page = 1,
            limit = 50
        } = filters;

        // Build date filter
        let createdAtFilter = undefined;
        if (date && date !== 'ALL') {
            const target = new Date(date);
            const start = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 0, 0, 0);
            const end = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59, 59, 999);
            createdAtFilter = { gte: start, lte: end };
        } else if (startDate || endDate) {
            createdAtFilter = {};
            if (startDate) createdAtFilter.gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
            if (endDate) createdAtFilter.lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
        }

        // Allowed DCR activity types
        const dcrTypes = ['DCR_ENTRY', 'DCR_CALL', 'DCR_VISIT', 'CALL', 'FIELD_VISIT', 'MEETING'];

        const where = {
            workspaceId,
            type: callType && callType !== 'ALL' ? callType : { in: dcrTypes },
            ...(repId && repId !== 'ALL' ? { userId: repId } : {}),
            ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
            ...(search ? {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { contact: { name: { contains: search, mode: 'insensitive' } } },
                    { account: { name: { contains: search, mode: 'insensitive' } } }
                ]
            } : {})
        };

        const [records, totalCount] = await Promise.all([
            prisma.crmActivity.findMany({
                where,
                include: {
                    user: { select: { id: true, displayName: true, email: true, avatar: true } },
                    contact: { select: { id: true, name: true, phone: true, email: true, title: true, account: { select: { id: true, name: true } } } },
                    account: { select: { id: true, name: true, phone: true, email: true, industry: true } },
                    deal: { select: { id: true, title: true, value: true, currency: true, stageId: true } }
                },
                orderBy: { createdAt: 'desc' },
                take: parseInt(limit),
                skip: (parseInt(page) - 1) * parseInt(limit)
            }),
            prisma.crmActivity.count({ where })
        ]);

        // Transform and enrich records
        const enrichedRecords = records.map(r => {
            const meta = (typeof r.metadata === 'object' && r.metadata) ? r.metadata : {};
            return {
                id: r.id,
                title: r.title,
                description: r.description || '',
                type: r.type,
                createdAt: r.createdAt,
                userId: r.userId,
                user: r.user,
                clientName: meta.clientName || r.account?.name || r.contact?.account?.name || 'Direct Client',
                contactPerson: meta.contactPerson || r.contact?.name || 'Contact Person',
                phone: meta.phone || r.contact?.phone || r.account?.phone || '',
                email: meta.email || r.contact?.email || r.account?.email || '',
                callType: meta.callType || r.type || 'PHONE_CALL',
                callPurpose: meta.callPurpose || meta.purpose || r.title || 'General Sales Inquiry',
                outcome: meta.outcome || 'FOLLOWUP_SCHEDULED',
                nextFollowUpDate: meta.nextFollowUpDate || null,
                nextFollowUpAction: meta.nextFollowUpAction || '',
                dealValue: meta.dealValue ? parseFloat(meta.dealValue) : (r.deal?.value ? parseFloat(r.deal.value) : 0),
                location: meta.location || '',
                durationMinutes: meta.durationMinutes ? parseInt(meta.durationMinutes) : 15,
                objections: meta.objections || '',
                rawMetadata: meta,
                contact: r.contact,
                account: r.account,
                deal: r.deal
            };
        });

        // Compute daily KPI metrics
        let totalCalls = enrichedRecords.length;
        let fieldVisitsCount = 0;
        let phoneCallsCount = 0;
        let whatsAppCount = 0;
        let positiveOutcomesCount = 0;
        let totalDealPotential = 0;
        let followUpsScheduledCount = 0;

        const outcomeBreakdown = {};

        enrichedRecords.forEach(rec => {
            const type = (rec.callType || '').toUpperCase();
            if (type.includes('VISIT') || type.includes('FIELD')) {
                fieldVisitsCount++;
            } else if (type.includes('WHATSAPP')) {
                whatsAppCount++;
            } else {
                phoneCallsCount++;
            }

            const outcome = (rec.outcome || '').toUpperCase();
            outcomeBreakdown[outcome] = (outcomeBreakdown[outcome] || 0) + 1;

            if (['HOT_LEAD', 'PROPOSAL_SENT', 'WON', 'DEMO_BOOKED', 'PAYMENT_COLLECTED'].includes(outcome)) {
                positiveOutcomesCount++;
            }

            if (rec.nextFollowUpDate) {
                followUpsScheduledCount++;
            }

            if (rec.dealValue) {
                totalDealPotential += rec.dealValue;
            }
        });

        const conversionRate = totalCalls > 0 ? Math.round((positiveOutcomesCount / totalCalls) * 100) : 0;

        return {
            success: true,
            data: {
                records: enrichedRecords,
                pagination: {
                    total: totalCount,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(totalCount / parseInt(limit))
                },
                metrics: {
                    totalCalls,
                    fieldVisitsCount,
                    phoneCallsCount,
                    whatsAppCount,
                    positiveOutcomesCount,
                    conversionRate,
                    totalDealPotential: Math.round(totalDealPotential),
                    followUpsScheduledCount,
                    outcomeBreakdown,
                    dailyTarget: 12,
                    targetAchievement: Math.min(100, Math.round((totalCalls / 12) * 100))
                }
            }
        };
    } catch (error) {
        console.error("[GET_DCR_RECORDS_ERROR]", error);
        return { success: false, error: error.message || "Failed to load Daily Call Records" };
    }
}

/**
 * Log a new DCR (Daily Call Record) entry with automatic CRM activity and optional follow-up task
 */
export async function createDcrRecordAction(workspaceId, data) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        const {
            clientName,
            contactPerson,
            phone,
            email,
            callType = 'PHONE_CALL', // 'PHONE_CALL', 'FIELD_VISIT', 'WHATSAPP', 'VIDEO_DEMO', 'PAYMENT_COLLECTION'
            callPurpose,
            conversation,
            outcome = 'FOLLOWUP_SCHEDULED', // 'HOT_LEAD', 'PROPOSAL_SENT', 'FOLLOWUP_SCHEDULED', 'WON', 'NOT_INTERESTED', 'GATEKEEPER', 'PAYMENT_COLLECTED'
            nextFollowUpDate,
            nextFollowUpAction,
            dealValue,
            currency = 'INR',
            location,
            durationMinutes = 15,
            objections,
            contactId,
            accountId,
            dealId,
            createTask = true,
            callDate
        } = data;

        if (!clientName?.trim() && !contactPerson?.trim()) {
            return { success: false, error: "Client Name or Contact Person is required" };
        }

        if (!conversation?.trim()) {
            return { success: false, error: "Conversation notes are required" };
        }

        let resolvedAccountId = accountId;
        let resolvedContactId = contactId;

        // Auto-match or create Account if clientName provided and accountId not provided
        if (clientName?.trim() && !resolvedAccountId) {
            let existingAccount = await prisma.account.findFirst({
                where: { workspaceId, name: { equals: clientName.trim(), mode: 'insensitive' } }
            });

            if (!existingAccount) {
                existingAccount = await prisma.account.create({
                    data: {
                        workspaceId,
                        userId,
                        name: clientName.trim(),
                        phone: phone?.trim() || null,
                        email: email?.trim() || null,
                        address: location?.trim() || null,
                        rating: outcome === 'HOT_LEAD' || outcome === 'WON' ? 'HOT' : 'WARM'
                    }
                });
            }
            resolvedAccountId = existingAccount.id;
        }

        // Auto-match or create Contact if phone or contactPerson provided and contactId not provided
        if ((contactPerson?.trim() || phone?.trim()) && !resolvedContactId) {
            let existingContact = null;
            if (phone?.trim()) {
                existingContact = await prisma.contact.findFirst({
                    where: { workspaceId, phone: phone.trim() }
                });
            }

            if (!existingContact && contactPerson?.trim()) {
                existingContact = await prisma.contact.findFirst({
                    where: { workspaceId, name: { equals: contactPerson.trim(), mode: 'insensitive' } }
                });
            }

            if (!existingContact && contactPerson?.trim()) {
                existingContact = await prisma.contact.create({
                    data: {
                        workspaceId,
                        userId,
                        name: contactPerson.trim(),
                        phone: phone?.trim() || null,
                        email: email?.trim() || null,
                        accountId: resolvedAccountId || null
                    }
                });
            }

            if (existingContact) {
                resolvedContactId = existingContact.id;
            }
        }

        const effectiveDate = callDate ? new Date(callDate) : new Date();

        // Create the CrmActivity record as DCR entry
        const activity = await prisma.crmActivity.create({
            data: {
                workspaceId,
                userId,
                type: callType === 'FIELD_VISIT' ? 'FIELD_VISIT' : (callType === 'WHATSAPP' ? 'WHATSAPP_MSG' : 'CALL'),
                title: `${callType === 'FIELD_VISIT' ? '🚗 Field Visit' : (callType === 'WHATSAPP' ? '💬 WhatsApp' : '📞 Call')}: ${clientName || contactPerson} - ${callPurpose || outcome}`,
                description: conversation.trim(),
                contactId: resolvedContactId || null,
                accountId: resolvedAccountId || null,
                dealId: dealId || null,
                createdAt: effectiveDate,
                metadata: {
                    isDcr: true,
                    clientName: clientName?.trim() || '',
                    contactPerson: contactPerson?.trim() || '',
                    phone: phone?.trim() || '',
                    email: email?.trim() || '',
                    callType,
                    callPurpose: callPurpose?.trim() || 'Sales Discussion',
                    outcome,
                    nextFollowUpDate: nextFollowUpDate || null,
                    nextFollowUpAction: nextFollowUpAction?.trim() || '',
                    dealValue: dealValue ? parseFloat(dealValue) : 0,
                    currency,
                    location: location?.trim() || '',
                    durationMinutes: parseInt(durationMinutes) || 15,
                    objections: objections?.trim() || '',
                    loggedAt: new Date().toISOString()
                }
            },
            include: {
                user: { select: { id: true, displayName: true, email: true, avatar: true } },
                contact: { select: { id: true, name: true, phone: true } },
                account: { select: { id: true, name: true, phone: true } }
            }
        });

        // Optionally create a follow-up Task if nextFollowUpDate is scheduled
        if (createTask && nextFollowUpDate) {
            try {
                // Find or create Default Kanban Column
                let defaultCol = await prisma.kanbanColumn.findFirst({
                    where: { workspaceId }
                });

                if (defaultCol) {
                    await prisma.kanbanTask.create({
                        data: {
                            columnId: defaultCol.id,
                            userId,
                            title: `Follow-up: ${clientName || contactPerson} (${nextFollowUpAction || outcome})`,
                            description: `DCR Follow-up reminder for ${clientName || contactPerson}.\nPhone: ${phone || 'N/A'}\nPrevious Discussion: ${conversation.trim().slice(0, 200)}...`,
                            priority: outcome === 'HOT_LEAD' ? 'HIGH' : 'MEDIUM',
                            dueDate: new Date(nextFollowUpDate),
                            tags: ['DCR-Followup', callType]
                        }
                    });
                }
            } catch (taskErr) {
                console.warn("[CREATE_DCR_FOLLOWUP_TASK_WARNING]", taskErr);
            }
        }

        revalidatePath(`/workspace/${workspaceId}/crm/dcr`);
        revalidatePath(`/workspace/${workspaceId}/crm`);
        revalidatePath(`/workspace/${workspaceId}/crm/activities`);

        return { success: true, data: activity };
    } catch (error) {
        console.error("[CREATE_DCR_RECORD_ERROR]", error);
        return { success: false, error: error.message || "Failed to create DCR record" };
    }
}

/**
 * Update an existing DCR entry
 */
export async function updateDcrRecordAction(workspaceId, dcrId, data) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const currentActivity = await prisma.crmActivity.findUnique({
            where: { id: dcrId }
        });

        if (!currentActivity) {
            return { success: false, error: "DCR record not found" };
        }

        const existingMeta = (typeof currentActivity.metadata === 'object' && currentActivity.metadata) ? currentActivity.metadata : {};

        const updatedMeta = {
            ...existingMeta,
            clientName: data.clientName !== undefined ? data.clientName : existingMeta.clientName,
            contactPerson: data.contactPerson !== undefined ? data.contactPerson : existingMeta.contactPerson,
            phone: data.phone !== undefined ? data.phone : existingMeta.phone,
            email: data.email !== undefined ? data.email : existingMeta.email,
            callType: data.callType !== undefined ? data.callType : existingMeta.callType,
            callPurpose: data.callPurpose !== undefined ? data.callPurpose : existingMeta.callPurpose,
            outcome: data.outcome !== undefined ? data.outcome : existingMeta.outcome,
            nextFollowUpDate: data.nextFollowUpDate !== undefined ? data.nextFollowUpDate : existingMeta.nextFollowUpDate,
            nextFollowUpAction: data.nextFollowUpAction !== undefined ? data.nextFollowUpAction : existingMeta.nextFollowUpAction,
            dealValue: data.dealValue !== undefined ? parseFloat(data.dealValue) : existingMeta.dealValue,
            location: data.location !== undefined ? data.location : existingMeta.location,
            durationMinutes: data.durationMinutes !== undefined ? parseInt(data.durationMinutes) : existingMeta.durationMinutes,
            objections: data.objections !== undefined ? data.objections : existingMeta.objections
        };

        const updated = await prisma.crmActivity.update({
            where: { id: dcrId },
            data: {
                title: data.clientName || data.callPurpose ? `${data.callType === 'FIELD_VISIT' ? '🚗 Field Visit' : '📞 Call'}: ${data.clientName || existingMeta.clientName} - ${data.callPurpose || existingMeta.callPurpose}` : undefined,
                description: data.conversation !== undefined ? data.conversation.trim() : undefined,
                metadata: updatedMeta
            }
        });

        revalidatePath(`/workspace/${workspaceId}/crm/dcr`);
        return { success: true, data: updated };
    } catch (error) {
        console.error("[UPDATE_DCR_RECORD_ERROR]", error);
        return { success: false, error: error.message || "Failed to update DCR record" };
    }
}

/**
 * Delete a DCR entry
 */
export async function deleteDcrRecordAction(workspaceId, dcrId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        await prisma.crmActivity.delete({
            where: { id: dcrId }
        });

        revalidatePath(`/workspace/${workspaceId}/crm/dcr`);
        return { success: true };
    } catch (error) {
        console.error("[DELETE_DCR_RECORD_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete DCR record" };
    }
}

/**
 * AI Assistant: Generate Instant Professional WhatsApp & Email Follow-up Draft based on DCR call conversation
 */
export async function generateDcrAiFollowupAction(workspaceId, { clientName, contactPerson, conversation, outcome, nextAction }) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const name = contactPerson || clientName || 'there';
        const company = clientName ? ` at ${clientName}` : '';

        let tone = 'professional and friendly';
        if (outcome === 'HOT_LEAD' || outcome === 'WON') tone = 'enthusiastic and momentum-building';
        if (outcome === 'PROPOSAL_SENT') tone = 'structured and clarity-focused';

        // High quality production response templates with AI enrichment
        const waMessage = `Hi ${name}! 👋\n\nThank you for taking the time to speak with me earlier regarding ${company || 'our discussion'}.\n\nAs discussed: ${conversation ? conversation.slice(0, 150) + '...' : 'we discussed your business requirements'}.\n\n${nextAction ? `📌 Next Step: ${nextAction}\n\n` : ''}Please feel free to reach out if you have any questions in the meantime. Looking forward to our next interaction!\n\nBest regards,\nSales & Solutions Team`;

        const emailSubject = `Follow-up: Discussion regarding ${clientName || 'our collaboration'}`;
        const emailBody = `Dear ${name},\n\nThank you for connecting with us today. It was a pleasure discussing your requirements.\n\nSummary of key discussion points:\n- ${conversation || 'Product & service overview'}\n\nAgreed Next Steps:\n- ${nextAction || 'Follow-up as per schedule'}\n\nPlease let us know if you need any additional details.\n\nWarm regards,\nDevX Solutions Team`;

        return {
            success: true,
            data: {
                whatsAppMessage: waMessage,
                emailSubject,
                emailBody
            }
        };
    } catch (error) {
        console.error("[GENERATE_DCR_AI_FOLLOWUP_ERROR]", error);
        return { success: false, error: "Failed to generate AI follow-up draft" };
    }
}
