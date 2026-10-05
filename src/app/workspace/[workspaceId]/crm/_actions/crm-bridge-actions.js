'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess, getAuthSession } from "@/lib/auth-utils";
import { getValidUserId } from "./auth-helper";
import { triggerCrmWorkflowAction } from "./crm-automation-actions";

/**
 * Bridge: Convert Hireflow ATS Candidate into a CRM Lead / Contact & Deal
 */
export async function convertCandidateToLeadAction(workspaceId, candidateId, dealData = {}) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        const candidate = await prisma.candidate.findFirst({
            where: { id: candidateId, workspaceId }
        });

        if (!candidate) {
            return { success: false, error: "Candidate not found" };
        }

        // 1. Create or Find Contact
        let contact = await prisma.contact.findFirst({
            where: {
                workspaceId,
                OR: [
                    ...(candidate.email ? [{ email: candidate.email }] : []),
                    ...(candidate.phone ? [{ phone: candidate.phone }] : [])
                ]
            }
        });

        if (!contact) {
            contact = await prisma.contact.create({
                data: {
                    workspaceId,
                    userId,
                    name: candidate.name,
                    email: candidate.email,
                    phone: candidate.phone || "0000000000",
                    type: "LEAD",
                    category: "ATS_CANDIDATE",
                    candidateId: candidate.id,
                    tags: ["ATS_CANDIDATE", ...(candidate.skills || [])]
                }
            });
        } else {
            contact = await prisma.contact.update({
                where: { id: contact.id },
                data: {
                    candidateId: candidate.id,
                    tags: Array.from(new Set([...(contact.tags || []), "ATS_CANDIDATE"]))
                }
            });
        }

        // 2. Provision Deal if requested
        let deal = null;
        if (dealData.createDeal !== false) {
            const pipeline = await prisma.pipeline.findFirst({
                where: { workspaceId },
                include: { stages: { orderBy: { order: 'asc' } } }
            });

            const stageId = dealData.stageId || pipeline?.stages[0]?.id;

            if (pipeline && stageId) {
                deal = await prisma.deal.create({
                    data: {
                        workspaceId,
                        userId,
                        title: dealData.title || `Candidate Placement: ${candidate.name}`,
                        value: dealData.value ? parseFloat(dealData.value) : 0,
                        currency: dealData.currency || "INR",
                        pipelineId: pipeline.id,
                        stageId,
                        contactId: contact.id,
                        ownerId: userId,
                        tags: ["ATS_PLACEMENT"]
                    }
                });

                // Log Activity
                await prisma.crmActivity.create({
                    data: {
                        workspaceId,
                        userId,
                        dealId: deal.id,
                        contactId: contact.id,
                        type: "ATS_INTERVIEW",
                        title: "Candidate Converted to CRM Deal",
                        description: `Candidate "${candidate.name}" synchronized from Hireflow ATS into CRM Deal.`
                    }
                });

                // FlowForge Bridge: Trigger Automation on ATS Candidate Placed / Converted
                try {
                    await triggerCrmWorkflowAction(workspaceId, {
                        triggerEvent: 'CANDIDATE_PLACED',
                        deal,
                        contact,
                        customData: { candidateName: candidate.name }
                    });
                } catch (wfErr) {
                    console.warn("[CRM_ATS_WORKFLOW_WARN]", wfErr);
                }
            }
        }

        return { success: true, data: { contact, deal } };
    } catch (error) {
        console.error("[CONVERT_CANDIDATE_TO_LEAD_ERROR]", error);
        return { success: false, error: error.message || "Failed to convert candidate" };
    }
}

/**
 * Bridge: Send a Quick WhatsApp Message via KonnectX & log CRM activity
 */
export async function sendWhatsAppFromCrmAction(workspaceId, { contactId, dealId, phone, message }) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        if (!phone || !message?.trim()) {
            return { success: false, error: "Phone number and message text are required." };
        }

        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const jid = `${cleanPhone}@s.whatsapp.net`;

        // 1. Record WhatsApp Message in KonnectX Database
        const waMsg = await prisma.whatsAppMessage.create({
            data: {
                userId,
                jid,
                text: message.trim(),
                fromMe: true,
                timestamp: BigInt(Date.now()),
                status: "SENT",
                metadata: {
                    source: "CRM_OUTREACH",
                    contactId,
                    dealId
                }
            }
        });

        // 2. Record CRM Activity Timeline entry
        await prisma.crmActivity.create({
            data: {
                workspaceId,
                userId,
                contactId: contactId || null,
                dealId: dealId || null,
                type: "WHATSAPP_MSG",
                title: "WhatsApp Message Sent",
                description: message.trim(),
                metadata: { waMessageId: waMsg.id, phone: cleanPhone }
            }
        });

        // 3. Update Contact lastInteraction & lastMessage
        if (contactId) {
            await prisma.contact.update({
                where: { id: contactId },
                data: {
                    lastMessage: message.trim().slice(0, 100),
                    lastInteraction: new Date()
                }
            });
        }

        return { success: true, data: { messageId: waMsg.id } };
    } catch (error) {
        console.error("[SEND_WHATSAPP_CRM_ERROR]", error);
        return { success: false, error: error.message || "Failed to send WhatsApp message" };
    }
}
