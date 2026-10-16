'use server';

import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { getValidUserId } from "./auth-helper";
import { getTemplates } from "../../konnectx/template/_actions/get-templates";
import { sendMessage } from "../../konnectx/chats/_actions/send-message";

/**
 * Fetch approved WhatsApp templates for CRM outreach
 * Read-only consumption of KonnectX MessageTemplate data.
 */
export async function getCrmWhatsAppTemplatesAction(workspaceId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const res = await getTemplates({ workspaceId, all: true });

        if (res?.error) {
            return { success: false, error: res.error };
        }

        const rawTemplates = res?.data?.templates || [];

        // Parse and clean templates for UI
        const parsedTemplates = rawTemplates.map(t => {
            let bodyText = '';
            let headerText = '';
            let footerText = '';
            let buttons = [];
            const variables = [];

            // Parse Meta components
            if (Array.isArray(t.components)) {
                for (const comp of t.components) {
                    if (comp.type === 'BODY' && comp.text) {
                        bodyText = comp.text;
                        // Extract {{1}}, {{2}}, etc.
                        const matches = comp.text.match(/\{\{(\d+)\}\}/g) || [];
                        matches.forEach(m => {
                            if (!variables.includes(m)) variables.push(m);
                        });
                    } else if (comp.type === 'HEADER' && comp.text) {
                        headerText = comp.text;
                    } else if (comp.type === 'FOOTER' && comp.text) {
                        footerText = comp.text;
                    } else if (comp.type === 'BUTTONS' && Array.isArray(comp.buttons)) {
                        buttons = comp.buttons.map(b => b.text || b.url || 'Button');
                    }
                }
            } else if (t.body) {
                bodyText = t.body;
                const matches = t.body.match(/\{\{(\d+)\}\}/g) || [];
                matches.forEach(m => {
                    if (!variables.includes(m)) variables.push(m);
                });
            }

            return {
                id: t.id,
                name: t.name,
                language: t.language || 'en',
                category: t.category || 'MARKETING',
                status: t.status || 'APPROVED',
                headerText,
                bodyText,
                footerText,
                buttons,
                variables: variables.sort(),
                components: t.components
            };
        });

        // Filter approved or active templates
        const usableTemplates = parsedTemplates.filter(t =>
            !t.status || t.status === 'APPROVED' || t.status === 'ACTIVE'
        );

        const candidatesList = usableTemplates.length ? usableTemplates : parsedTemplates;

        // Deduplicate templates by id and name+language to prevent duplicate keys in UI
        const seenIds = new Set();
        const seenNames = new Set();
        const uniqueTemplates = [];

        for (const t of candidatesList) {
            const idKey = t.id ? String(t.id) : null;
            const nameLangKey = `${t.name}___${t.language || 'en'}`;

            if (idKey && seenIds.has(idKey)) continue;
            if (seenNames.has(nameLangKey)) continue;

            if (idKey) seenIds.add(idKey);
            seenNames.add(nameLangKey);
            uniqueTemplates.push(t);
        }

        return {
            success: true,
            data: uniqueTemplates
        };
    } catch (error) {
        console.error("[GET_CRM_WHATSAPP_TEMPLATES_ERROR]", error);
        return { success: false, error: error.message || "Failed to load templates" };
    }
}

/**
 * Dispatch WhatsApp message directly from CRM (Custom text or Approved Template)
 * Dispatches via KonnectX Cloud API & records CRM activity.
 */
export async function dispatchWhatsAppFromCrmAction(workspaceId, payload) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        const {
            recipientPhone,
            recipientName,
            messageType = 'CUSTOM', // 'CUSTOM' or 'TEMPLATE'
            customText = '',
            templateName,
            templateLanguage = 'en',
            templateComponents = [],
            resolvedBodyText = '',
            contactId,
            candidateId,
            dealId
        } = payload;

        if (!recipientPhone) {
            return { success: false, error: "Recipient phone number is required" };
        }

        let cleanPhone = recipientPhone.replace(/[^\d]/g, '');
        if (cleanPhone.length === 10) {
            cleanPhone = `91${cleanPhone}`;
        }

        let sendResult;

        if (messageType === 'TEMPLATE' && templateName) {
            // Send Template message
            sendResult = await sendMessage({
                workspaceId,
                to: cleanPhone,
                type: 'template',
                template: {
                    name: templateName,
                    language: { code: templateLanguage },
                    components: templateComponents
                }
            });
        } else {
            // Send Custom text message
            if (!customText.trim()) {
                return { success: false, error: "Message text cannot be empty" };
            }

            sendResult = await sendMessage({
                workspaceId,
                to: cleanPhone,
                type: 'text',
                body: customText.trim(),
                text: customText.trim()
            });
        }

        if (sendResult?.error) {
            return { success: false, error: sendResult.error };
        }

        const messageContent = messageType === 'TEMPLATE'
            ? (resolvedBodyText || `[Template: ${templateName}]`)
            : customText.trim();

        // 1. Log CRM Activity timeline entry
        let resolvedContactId = contactId;

        // Auto-link or auto-provision contact if candidateId given without contactId
        if (!resolvedContactId && candidateId) {
            try {
                const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
                if (candidate) {
                    let existingContact = await prisma.contact.findFirst({
                        where: { workspaceId, OR: [{ phone: cleanPhone }, { email: candidate.email }] }
                    });
                    if (!existingContact) {
                        existingContact = await prisma.contact.create({
                            data: {
                                workspaceId,
                                userId,
                                name: candidate.name,
                                email: candidate.email,
                                phone: cleanPhone,
                                type: 'LEAD',
                                category: 'ATS_CANDIDATE',
                                candidateId: candidate.id,
                                tags: ['ATS_CANDIDATE']
                            }
                        });
                    }
                    resolvedContactId = existingContact.id;
                }
            } catch (candErr) {
                console.warn("[CRM_CANDIDATE_LINK_WARN]", candErr);
            }
        }

        // Create CRM Activity record
        await prisma.crmActivity.create({
            data: {
                workspaceId,
                userId,
                contactId: resolvedContactId || null,
                dealId: dealId || null,
                type: 'WHATSAPP_MSG',
                title: messageType === 'TEMPLATE' ? `WhatsApp Template: ${templateName}` : 'WhatsApp Message Sent',
                description: messageContent,
                metadata: {
                    phone: cleanPhone,
                    recipientName,
                    templateName: templateName || null,
                    candidateId: candidateId || null,
                    sentAt: new Date().toISOString()
                }
            }
        });

        // 2. Update contact last message timestamp if contact exists
        if (resolvedContactId) {
            await prisma.contact.update({
                where: { id: resolvedContactId },
                data: {
                    lastMessage: messageContent.slice(0, 120),
                    lastInteraction: new Date()
                }
            }).catch(() => null);
        }

        return {
            success: true,
            data: {
                recipientPhone: cleanPhone,
                recipientName,
                sentAt: new Date().toISOString()
            }
        };
    } catch (error) {
        console.error("[DISPATCH_WHATSAPP_CRM_ERROR]", error);
        return { success: false, error: error.message || "Failed to dispatch WhatsApp message" };
    }
}
