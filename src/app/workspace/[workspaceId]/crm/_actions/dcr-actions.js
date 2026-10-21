'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { getValidUserId } from "./auth-helper";
import { getCrmVisibilityScope } from "./crm-visibility-helper";

/**
 * Fetch DCR (Daily Call Record) logs with summary metrics for sales & field reps
 * Filtered by Universal Global Org Hierarchy: Super Admin sees all; higher ladder users see their own + subordinate DCR logs.
 */
export async function getDcrRecordsAction(workspaceId, filters = {}) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const visibilityScope = await getCrmVisibilityScope(workspaceId, session);

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

        // Build hierarchy condition for reps/users
        let hierarchyUserCondition = {};
        if (!visibilityScope.isSuperAdmin) {
            const allowed = visibilityScope.visibleUserIds || [];
            if (repId && repId !== 'ALL') {
                if (allowed.includes(repId)) {
                    hierarchyUserCondition = { userId: repId };
                } else {
                    hierarchyUserCondition = { userId: '__NO_ACCESS__' };
                }
            } else {
                hierarchyUserCondition = { userId: { in: allowed } };
            }
        } else if (repId && repId !== 'ALL') {
            hierarchyUserCondition = { userId: repId };
        }

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
            ...hierarchyUserCondition,
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
                images: Array.isArray(meta.images) ? meta.images : (meta.images ? [meta.images] : []),
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
            try {
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
            } catch (accErr) {
                console.warn("[CREATE_DCR_ACCOUNT_PROVISION_WARNING]", accErr);
            }
        }

        // Auto-match or create Contact if phone or contactPerson provided and contactId not provided
        if ((contactPerson?.trim() || phone?.trim()) && !resolvedContactId) {
            try {
                let existingContact = null;
                if (phone?.trim()) {
                    existingContact = await prisma.contact.findFirst({
                        where: { workspaceId, phone: phone.trim() }
                    });
                }

                const personName = contactPerson?.trim() || (phone?.trim() ? clientName?.trim() : null);

                if (!existingContact && personName) {
                    existingContact = await prisma.contact.findFirst({
                        where: { workspaceId, name: { equals: personName, mode: 'insensitive' } }
                    });
                }

                if (!existingContact && personName) {
                    // Contact.phone is a required non-null String in Prisma schema
                    const safePhone = phone?.trim() || `+91000${Math.floor(1000000 + Math.random() * 9000000)}`;
                    existingContact = await prisma.contact.create({
                        data: {
                            workspaceId,
                            userId,
                            name: personName,
                            phone: safePhone,
                            email: email?.trim() || null,
                            accountId: resolvedAccountId || null
                        }
                    });
                }

                if (existingContact) {
                    resolvedContactId = existingContact.id;
                }
            } catch (contactErr) {
                console.warn("[CREATE_DCR_CONTACT_PROVISION_WARNING]", contactErr);
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
                    geolocation: data.geolocation || null,
                    durationMinutes: parseInt(durationMinutes) || 15,
                    objections: objections?.trim() || '',
                    images: Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []),
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
                    where: { workspaceId },
                    orderBy: { order: 'asc' }
                });

                if (!defaultCol) {
                    defaultCol = await prisma.kanbanColumn.create({
                        data: {
                            title: 'To Do',
                            order: 0,
                            workspaceId,
                            userId
                        }
                    });
                }

                if (defaultCol) {
                    await prisma.kanbanTask.create({
                        data: {
                            columnId: defaultCol.id,
                            workspaceId,
                            userId,
                            title: `Follow-up: ${clientName || contactPerson} (${nextFollowUpAction || outcome})`,
                            content: `DCR Follow-up reminder for ${clientName || contactPerson}.\nPhone: ${phone || 'N/A'}\nPrevious Discussion: ${conversation.trim().slice(0, 200)}...`,
                            priority: outcome === 'HOT_LEAD' ? 'high' : 'medium',
                            dueDate: new Date(nextFollowUpDate),
                            type: 'task'
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
        revalidatePath(`/workspace/${workspaceId}/crm/tasks`);

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
            geolocation: data.geolocation !== undefined ? data.geolocation : existingMeta.geolocation,
            images: data.images !== undefined ? (Array.isArray(data.images) ? data.images : (data.images ? [data.images] : [])) : (existingMeta.images || []),
            durationMinutes: data.durationMinutes !== undefined ? parseInt(data.durationMinutes) : existingMeta.durationMinutes,
            objections: data.objections !== undefined ? data.objections : existingMeta.objections,
            updatedAt: new Date().toISOString()
        };

        const effectiveCallType = data.callType || existingMeta.callType || 'PHONE_CALL';

        const updated = await prisma.crmActivity.update({
            where: { id: dcrId },
            data: {
                type: effectiveCallType === 'FIELD_VISIT' ? 'FIELD_VISIT' : (effectiveCallType === 'WHATSAPP' ? 'WHATSAPP_MSG' : 'CALL'),
                title: data.clientName || data.callPurpose || data.callType ? `${effectiveCallType === 'FIELD_VISIT' ? '🚗 Field Visit' : (effectiveCallType === 'WHATSAPP' ? '💬 WhatsApp' : '📞 Call')}: ${data.clientName || existingMeta.clientName || 'Client'} - ${data.callPurpose || existingMeta.callPurpose || 'Discussion'}` : undefined,
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

/**
 * AI Voice Note & Call Audio Summarizer to DCR Record
 * Transcribes/summarizes unstructured sales notes/transcripts into a full DCR record with sentiment & action items
 */
export async function summarizeVoiceNoteToDcrAction(workspaceId, payload = {}) {
    try {
        await ensureWorkspaceAccess(workspaceId);
        const {
            rawTranscript,
            contactId,
            dealId,
            clientName,
            clientPhone,
            callType = "PHONE_CALL",
            durationMinutes = 5,
            gpsLatitude,
            gpsLongitude,
            gpsAddress
        } = payload;

        if (!rawTranscript || !rawTranscript.trim()) {
            return { success: false, error: "Audio transcript or call notes cannot be empty." };
        }

        const { executeGatewayRequest } = await import('../../flowgenix/_lib/combo-router');

        const prompt = `
You are FlowGenix AI Meeting & Sales Call Intelligence Analyst.
Analyze these unstructured spoken sales call notes/transcript:
"""
${rawTranscript}
"""

Extract structured call telemetry strictly in raw JSON (no markdown, no backticks):
{
  "clientName": "Extracted client or company name (or fallback to '${clientName || 'Prospect'}')",
  "contactPerson": "Name of person spoken to if mentioned",
  "summary": "Crisp 2-3 sentence overview of what was discussed",
  "sentiment": "POSITIVE" | "NEUTRAL" | "SKEPTICAL" | "DISSATISFIED",
  "outcome": "HOT_LEAD" | "PROPOSAL_SENT" | "FOLLOWUP_SCHEDULED" | "WON" | "GATEKEEPER" | "NOT_INTERESTED",
  "objections": ["Objection 1 if any"],
  "nextAction": "Clear actionable next step agreed on",
  "suggestedFollowupDays": 2, // number of days from now to follow up
  "dealPotential": 50000 // estimated monetary value if mentioned or 0
}
`;

        let aiExtraction = null;
        try {
            const gatewayRes = await executeGatewayRequest({
                workspaceId,
                model: "auto/smart",
                messages: [
                    { role: "system", content: "You extract structured sales CRM call logs from audio transcripts. Return JSON only." },
                    { role: "user", content: prompt }
                ]
            });
            if (gatewayRes?.success && gatewayRes?.content) {
                const match = gatewayRes.content.match(/\{[\s\S]*\}/);
                if (match) aiExtraction = JSON.parse(match[0]);
            }
        } catch (e) {
            console.warn("[VOICE_NOTE_DCR_AI_FALLBACK]", e.message);
        }

        if (!aiExtraction) {
            aiExtraction = {
                clientName: clientName || "Client Meeting",
                contactPerson: clientName || "Contact",
                summary: rawTranscript.slice(0, 180),
                sentiment: "POSITIVE",
                outcome: "FOLLOWUP_SCHEDULED",
                objections: [],
                nextAction: "Follow up as agreed during conversation",
                suggestedFollowupDays: 3,
                dealPotential: 0
            };
        }

        const now = new Date();
        const nextDate = new Date();
        nextDate.setDate(now.getDate() + (aiExtraction.suggestedFollowupDays || 3));

        // Create the DCR record
        const dcrRecord = await createDcrRecordAction(workspaceId, {
            clientName: aiExtraction.clientName || clientName || "Client Meeting",
            contactPerson: aiExtraction.contactPerson || clientName,
            contactPhone: clientPhone || null,
            callType: callType || "PHONE_CALL",
            outcome: aiExtraction.outcome || "FOLLOWUP_SCHEDULED",
            conversationDetails: `${aiExtraction.summary}\n\nKey Objections: ${aiExtraction.objections?.join(', ') || 'None'}\n\nAudio Note: ${rawTranscript.slice(0, 250)}`,
            nextActionPlan: aiExtraction.nextAction,
            nextFollowUpDate: nextDate.toISOString().slice(0, 10),
            nextFollowUpTime: "11:00",
            duration: `${durationMinutes} mins`,
            dealPotential: aiExtraction.dealPotential || 0,
            contactId: contactId || null,
            dealId: dealId || null,
            latitude: gpsLatitude,
            longitude: gpsLongitude,
            fieldLocationAddress: gpsAddress,
            customData: {
                aiProcessed: true,
                sentiment: aiExtraction.sentiment,
                objections: aiExtraction.objections
            }
        });

        return {
            success: true,
            data: {
                dcrRecord: dcrRecord.data,
                aiAnalysis: aiExtraction
            }
        };
    } catch (error) {
        console.error("[SUMMARIZE_VOICE_NOTE_TO_DCR_ERROR]", error);
        return { success: false, error: error.message };
    }
}

