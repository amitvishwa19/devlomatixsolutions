'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

/**
 * 360° Comprehensive Contact Dossier
 * Unifies CRM Contact, KonnectX WhatsApp history, ATS Candidate data, PayFlow Invoices, and Deals
 */
export async function get360ContactDossierAction(workspaceId, contactId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        // 1. Fetch Contact with Account and Deals
        const contact = await prisma.contact.findFirst({
            where: { id: contactId, workspaceId },
            include: {
                account: true,
                deals: {
                    include: { stage: true, pipeline: true },
                    orderBy: { updatedAt: 'desc' }
                },
                ecommerceOrders: {
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                },
                crmActivities: {
                    include: {
                        user: { select: { id: true, displayName: true, avatar: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!contact) {
            return { success: false, error: "Contact not found" };
        }

        // 2. Fetch Recent KonnectX WhatsApp Messages
        let whatsappMessages = [];
        if (contact.phone) {
            const cleanPhone = contact.phone.replace(/[^0-9]/g, '');
            whatsappMessages = await prisma.whatsAppMessage.findMany({
                where: {
                    OR: [
                        { jid: { contains: cleanPhone } },
                        { jid: `${cleanPhone}@s.whatsapp.net` },
                        { jid: `${cleanPhone}@c.us` }
                    ]
                },
                take: 15,
                orderBy: { timestamp: 'desc' }
            });
        }

        // 3. Check for linked Hireflow ATS Candidate profile
        let candidateProfile = null;
        if (contact.candidateId || contact.email || contact.phone) {
            candidateProfile = await prisma.candidate.findFirst({
                where: {
                    workspaceId,
                    OR: [
                        ...(contact.candidateId ? [{ id: contact.candidateId }] : []),
                        ...(contact.email ? [{ email: contact.email }] : []),
                        ...(contact.phone ? [{ phone: contact.phone }] : [])
                    ]
                },
                include: {
                    applications: {
                        include: {
                            job: true,
                            interviews: { orderBy: { startTime: 'desc' } },
                            scorecards: true
                        }
                    },
                    notes: {
                        include: { user: { select: { id: true, displayName: true } } },
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });
        }

        // 4. Calculate Customer Lifetime Value (LTV)
        const totalWonDealValue = (contact.deals || [])
            .filter(d => d.stage?.isWon)
            .reduce((sum, d) => sum + (d.value || 0), 0);

        return {
            success: true,
            data: {
                contact,
                whatsappMessages,
                candidateProfile,
                analytics: {
                    totalDeals: contact.deals?.length || 0,
                    totalWonValue: totalWonDealValue,
                    activeDealsCount: (contact.deals || []).filter(d => !d.stage?.isWon && !d.stage?.isLost).length
                }
            }
        };
    } catch (error) {
        console.error("[GET_360_CONTACT_DOSSIER_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch 360° contact dossier" };
    }
}

/**
 * 360° Comprehensive Company / Account Dossier
 */
export async function get360AccountDossierAction(workspaceId, accountId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const account = await prisma.account.findFirst({
            where: { id: accountId, workspaceId },
            include: {
                contacts: {
                    orderBy: { createdAt: 'desc' }
                },
                deals: {
                    include: { stage: true, pipeline: true, owner: { select: { id: true, displayName: true } } },
                    orderBy: { updatedAt: 'desc' }
                },
                activities: {
                    include: { user: { select: { id: true, displayName: true, avatar: true } } },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!account) {
            return { success: false, error: "Account not found" };
        }

        const totalWonValue = (account.deals || [])
            .filter(d => d.stage?.isWon)
            .reduce((sum, d) => sum + (d.value || 0), 0);

        const openPipelineValue = (account.deals || [])
            .filter(d => !d.stage?.isWon && !d.stage?.isLost)
            .reduce((sum, d) => sum + (d.value || 0), 0);

        return {
            success: true,
            data: {
                account,
                analytics: {
                    totalContacts: account.contacts?.length || 0,
                    totalDeals: account.deals?.length || 0,
                    totalWonValue,
                    openPipelineValue
                }
            }
        };
    } catch (error) {
        console.error("[GET_360_ACCOUNT_DOSSIER_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch 360° company dossier" };
    }
}
