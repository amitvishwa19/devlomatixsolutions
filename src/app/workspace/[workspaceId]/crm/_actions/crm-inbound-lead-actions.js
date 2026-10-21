'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { getValidUserId } from "./auth-helper";
import { revalidatePath } from "next/cache";

/**
 * 1. Omnichannel Inbound Lead Ingestion Engine
 * Handles inbound leads from FormCraft, Meta Lead Ads, Webflow, Website Forms, and APIs.
 */
export async function ingestInboundLeadAction(workspaceId, leadData = {}) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const currentUserId = await getValidUserId(workspaceId, session);

        const {
            name,
            phone,
            email,
            companyName,
            source = "WEBSITE_INQUIRY",
            dealTitle,
            dealValue = 0,
            currency = "INR",
            pipelineId,
            stageId,
            ownerId,
            notes,
            tags = [],
            customFields = {},
            autoWhatsAppWelcome = false
        } = leadData;

        if (!name && !phone && !email) {
            return { success: false, error: "At least name, phone, or email is required." };
        }

        const cleanPhone = phone ? phone.replace(/[^0-9+]/g, '') : null;
        const normalizedEmail = email ? email.trim().toLowerCase() : null;

        // 1. Resolve or Create Account if company name is provided
        let account = null;
        if (companyName && companyName.trim()) {
            account = await prisma.account.findFirst({
                where: {
                    workspaceId,
                    name: { equals: companyName.trim(), mode: 'insensitive' }
                }
            });

            if (!account) {
                account = await prisma.account.create({
                    data: {
                        workspaceId,
                        userId: currentUserId,
                        name: companyName.trim(),
                        phone: cleanPhone || null,
                        email: normalizedEmail || null,
                        rating: "WARM",
                        ownerId: ownerId || currentUserId
                    }
                });
            }
        }

        // 2. Resolve or Create Contact
        let contact = null;
        const contactConditions = [];
        if (cleanPhone) contactConditions.push({ phone: cleanPhone });
        if (normalizedEmail) contactConditions.push({ email: normalizedEmail });

        if (contactConditions.length > 0) {
            contact = await prisma.contact.findFirst({
                where: {
                    workspaceId,
                    OR: contactConditions
                }
            });
        }

        const leadTags = Array.from(new Set([...tags, `SOURCE_${source.toUpperCase()}`, "INBOUND_LEAD"]));

        if (!contact) {
            contact = await prisma.contact.create({
                data: {
                    workspaceId,
                    userId: currentUserId,
                    name: name || (normalizedEmail ? normalizedEmail.split('@')[0] : "New Lead"),
                    phone: cleanPhone || "0000000000",
                    email: normalizedEmail || null,
                    type: "LEAD",
                    category: source,
                    tags: leadTags,
                    accountId: account?.id || null,
                    info: {
                        inboundSource: source,
                        notes: notes || null,
                        ...customFields
                    }
                }
            });
        } else {
            // Update existing contact with new tags and account if missing
            const updatedTags = Array.from(new Set([...(contact.tags || []), ...leadTags]));
            contact = await prisma.contact.update({
                where: { id: contact.id },
                data: {
                    accountId: contact.accountId || account?.id || null,
                    tags: updatedTags,
                    lastInteraction: new Date(),
                    ...(notes ? { info: { ...(typeof contact.info === 'object' ? contact.info : {}), lastInboundNotes: notes } } : {})
                }
            });
        }

        // 3. Resolve Pipeline and Stage
        let targetPipeline = null;
        if (pipelineId) {
            targetPipeline = await prisma.pipeline.findFirst({
                where: { id: pipelineId, workspaceId },
                include: { stages: { orderBy: { order: 'asc' } } }
            });
        }
        if (!targetPipeline) {
            targetPipeline = await prisma.pipeline.findFirst({
                where: { workspaceId, isDefault: true },
                include: { stages: { orderBy: { order: 'asc' } } }
            }) || await prisma.pipeline.findFirst({
                where: { workspaceId },
                include: { stages: { orderBy: { order: 'asc' } } }
            });
        }

        const targetStageId = stageId || targetPipeline?.stages[0]?.id;

        // 4. Resolve Deal Owner (Owner routing / round-robin)
        let assignedOwnerId = ownerId || currentUserId;
        if (!ownerId) {
            // Pick available active team members
            const teamMembers = await prisma.user.findMany({
                where: { isActive: true },
                select: { id: true },
                take: 5
            });
            if (teamMembers.length > 0) {
                // simple pseudorandom / round-robin selection
                const randomIndex = Math.floor(Math.random() * teamMembers.length);
                assignedOwnerId = teamMembers[randomIndex].id;
            }
        }

        // 5. Create Deal
        let deal = null;
        if (targetPipeline && targetStageId) {
            const formattedTitle = dealTitle || `Inbound [${source}]: ${contact.name}${companyName ? ` (${companyName})` : ''}`;
            deal = await prisma.deal.create({
                data: {
                    workspaceId,
                    userId: currentUserId,
                    title: formattedTitle,
                    value: parseFloat(dealValue) || 0,
                    currency,
                    pipelineId: targetPipeline.id,
                    stageId: targetStageId,
                    contactId: contact.id,
                    accountId: account?.id || null,
                    ownerId: assignedOwnerId,
                    priority: "HIGH",
                    tags: leadTags,
                    customFields: {
                        inboundSource: source,
                        sourceNotes: notes,
                        capturedAt: new Date().toISOString(),
                        ...customFields
                    }
                },
                include: {
                    stage: true,
                    pipeline: true,
                    contact: true,
                    account: true
                }
            });

            // 6. Log Timeline Activity
            await prisma.crmActivity.create({
                data: {
                    workspaceId,
                    userId: currentUserId,
                    dealId: deal.id,
                    contactId: contact.id,
                    accountId: account?.id || null,
                    type: "NOTE",
                    title: `🎯 Inbound Lead Captured via ${source}`,
                    description: notes || `Lead automatically routed and assigned from ${source}. Value: ${currency} ${dealValue}.`,
                    metadata: {
                        source,
                        dealId: deal.id,
                        contactId: contact.id,
                        assignedOwnerId
                    }
                }
            });

            // 7. Auto-Dispatch WhatsApp Welcome if requested and phone exists
            if (autoWhatsAppWelcome && cleanPhone) {
                try {
                    const jid = `${cleanPhone.replace('+', '')}@s.whatsapp.net`;
                    const welcomeText = `Hello ${contact.name}! Thank you for your inquiry regarding ${formattedTitle}. Our team has received your request and an account specialist will connect with you shortly.`;
                    
                    await prisma.whatsAppMessage.create({
                        data: {
                            userId: currentUserId,
                            jid,
                            text: welcomeText,
                            fromMe: true,
                            timestamp: BigInt(Date.now()),
                            status: "SENT",
                            metadata: {
                                source: "INBOUND_LEAD_AUTO_WELCOME",
                                dealId: deal.id,
                                contactId: contact.id
                            }
                        }
                    });

                    await prisma.crmActivity.create({
                        data: {
                            workspaceId,
                            userId: currentUserId,
                            dealId: deal.id,
                            contactId: contact.id,
                            type: "WHATSAPP_MSG",
                            title: "Automated WhatsApp Welcome Sent",
                            description: welcomeText,
                            metadata: { phone: cleanPhone }
                        }
                    });
                } catch (waErr) {
                    console.warn("[INBOUND_WHATSAPP_WELCOME_WARN]", waErr.message);
                }
            }
        }

        revalidatePath(`/workspace/${workspaceId}/crm`);
        revalidatePath(`/workspace/${workspaceId}/crm/pipeline`);
        revalidatePath(`/workspace/${workspaceId}/crm/contacts`);

        return {
            success: true,
            data: {
                contact,
                account,
                deal
            }
        };
    } catch (error) {
        console.error("[INGEST_INBOUND_LEAD_ERROR]", error);
        return { success: false, error: error.message || "Failed to ingest inbound lead." };
    }
}

/**
 * 2. Bridge FormCraft Submission to CRM Lead
 */
export async function convertFormCraftSubmissionToLeadAction(workspaceId, {
    formTitle = "Inbound Web Form",
    submitterName,
    submitterEmail,
    submitterPhone,
    companyName,
    summary,
    estimatedBudget = 0,
    pipelineId,
    stageId
}) {
    return await ingestInboundLeadAction(workspaceId, {
        name: submitterName,
        email: submitterEmail,
        phone: submitterPhone,
        companyName,
        source: "FORMCRAFT",
        dealTitle: `${formTitle} - ${submitterName || 'Lead'}`,
        dealValue: estimatedBudget,
        notes: summary,
        pipelineId,
        stageId,
        autoWhatsAppWelcome: Boolean(submitterPhone)
    });
}

/**
 * 3. Get Inbound Lead Sources Summary
 */
export async function getInboundLeadStatsAction(workspaceId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const deals = await prisma.deal.findMany({
            where: { workspaceId },
            select: {
                id: true,
                value: true,
                tags: true,
                customFields: true,
                createdAt: true,
                stage: { select: { isWon: true, isLost: true } }
            }
        });

        const sourceCounts = {
            FORMCRAFT: { count: 0, value: 0, won: 0 },
            META_ADS: { count: 0, value: 0, won: 0 },
            WEBSITE_INQUIRY: { count: 0, value: 0, won: 0 },
            GOOGLE_MAPS: { count: 0, value: 0, won: 0 },
            MANUAL: { count: 0, value: 0, won: 0 },
            OTHER: { count: 0, value: 0, won: 0 }
        };

        deals.forEach(d => {
            const source = (d.customFields?.inboundSource || 'MANUAL').toUpperCase();
            const targetKey = sourceCounts[source] ? source : 'OTHER';
            sourceCounts[targetKey].count++;
            sourceCounts[targetKey].value += (d.value || 0);
            if (d.stage?.isWon) sourceCounts[targetKey].won++;
        });

        return { success: true, data: sourceCounts };
    } catch (error) {
        console.error("[GET_INBOUND_LEAD_STATS_ERROR]", error);
        return { success: false, error: error.message };
    }
}
