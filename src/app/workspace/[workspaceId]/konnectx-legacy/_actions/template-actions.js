'use server';

import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { konnectLegacyManager } from "../_lib/baileys-manager";

/**
 * Extract variable tokens from template text (e.g. {{1}}, {{name}})
 */
function extractVariables(text) {
    if (!text) return [];
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = new Set();
    let match;
    while ((match = regex.exec(text)) !== null) {
        matches.add(match[1].trim());
    }
    return Array.from(matches);
}

/**
 * Format template message by substituting variable placeholders
 */
function substituteVariables(text, variables = {}) {
    if (!text) return '';
    return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const trimmedKey = key.trim();
        return variables[trimmedKey] !== undefined && variables[trimmedKey] !== ''
            ? variables[trimmedKey]
            : match;
    });
}

/**
 * Fetch all message templates for the workspace
 */
export async function getTemplatesAction(workspaceId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const templates = await db.konnectLegacyTemplate.findMany({
            where: { workspaceId },
            include: {
                group: {
                    select: { id: true, name: true, color: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return {
            success: true,
            templates: JSON.parse(JSON.stringify(templates))
        };
    } catch (error) {
        console.error("[GET_TEMPLATES_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to load templates", templates: [] };
    }
}

/**
 * Save (create or update) a Konnect Legacy template
 */
export async function saveTemplateAction(workspaceId, templateData) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const {
            id,
            name,
            category = 'MARKETING',
            language = 'en_US',
            headerType = 'NONE',
            headerText,
            headerMedia,
            body,
            footer,
            buttons = [],
            sampleValues = {},
            groupId
        } = templateData;

        if (!name?.trim()) {
            return { success: false, error: "Template name is required" };
        }
        if (!body?.trim()) {
            return { success: false, error: "Template body text is required" };
        }

        // Clean template name (slug-friendly, alphanumeric + underscores)
        const sanitizedName = name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

        // Extract variables from body and header
        const combinedText = `${headerText || ''} ${body || ''}`;
        const variables = extractVariables(combinedText);

        const dataPayload = {
            workspaceId,
            userId,
            name: sanitizedName,
            category: category.toUpperCase(),
            language,
            headerType: headerType.toUpperCase(),
            headerText: headerType === 'TEXT' ? headerText?.trim() || null : null,
            headerMedia: ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerType) ? headerMedia?.trim() || null : null,
            body: body.trim(),
            footer: footer?.trim() || null,
            buttons: Array.isArray(buttons) ? buttons : [],
            variables,
            sampleValues: typeof sampleValues === 'object' ? sampleValues : {},
            status: 'APPROVED', // Instant approval for linked device
            groupId: groupId || null
        };

        let template;
        if (id) {
            template = await db.konnectLegacyTemplate.update({
                where: { id },
                data: dataPayload,
                include: { group: true }
            });
        } else {
            template = await db.konnectLegacyTemplate.create({
                data: dataPayload,
                include: { group: true }
            });
        }

        return {
            success: true,
            template: JSON.parse(JSON.stringify(template))
        };
    } catch (error) {
        console.error("[SAVE_TEMPLATE_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to save template" };
    }
}

/**
 * Delete a template
 */
export async function deleteTemplateAction(workspaceId, templateId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        if (!templateId) {
            return { success: false, error: "Template ID is required" };
        }

        await db.konnectLegacyTemplate.delete({
            where: { id: templateId }
        });

        return { success: true };
    } catch (error) {
        console.error("[DELETE_TEMPLATE_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete template" };
    }
}

/**
 * Fetch template groups
 */
export async function getTemplateGroupsAction(workspaceId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const groups = await db.konnectLegacyTemplateGroup.findMany({
            where: { workspaceId },
            include: {
                _count: {
                    select: { templates: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return {
            success: true,
            groups: JSON.parse(JSON.stringify(groups))
        };
    } catch (error) {
        console.error("[GET_TEMPLATE_GROUPS_ERROR]", error);
        return { success: false, error: error.message || "Failed to load groups", groups: [] };
    }
}

/**
 * Save (create or update) a template group
 */
export async function saveTemplateGroupAction(workspaceId, groupData) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;
        const { id, name, description, color } = groupData;

        if (!name?.trim()) {
            return { success: false, error: "Group name is required" };
        }

        let group;
        if (id) {
            group = await db.konnectLegacyTemplateGroup.update({
                where: { id },
                data: {
                    name: name.trim(),
                    description: description?.trim() || null,
                    color: color || '#10b981'
                }
            });
        } else {
            group = await db.konnectLegacyTemplateGroup.create({
                data: {
                    workspaceId,
                    userId,
                    name: name.trim(),
                    description: description?.trim() || null,
                    color: color || '#10b981'
                }
            });
        }

        return { success: true, group: JSON.parse(JSON.stringify(group)) };
    } catch (error) {
        console.error("[SAVE_TEMPLATE_GROUP_ERROR]", error);
        return { success: false, error: error.message || "Failed to save group" };
    }
}

/**
 * Delete a template group
 */
export async function deleteTemplateGroupAction(workspaceId, groupId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        if (!groupId) {
            return { success: false, error: "Group ID is required" };
        }

        await db.konnectLegacyTemplateGroup.delete({
            where: { id: groupId }
        });

        return { success: true };
    } catch (error) {
        console.error("[DELETE_TEMPLATE_GROUP_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete group" };
    }
}

/**
 * Test Send Template to any recipient WhatsApp number from linked phone
 */
export async function testSendTemplateAction(workspaceId, { templateId, recipientPhone, sampleValues = {} }) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        if (!recipientPhone || !recipientPhone.trim()) {
            return { success: false, error: "Recipient phone number is required" };
        }

        const template = await db.konnectLegacyTemplate.findUnique({
            where: { id: templateId }
        });

        if (!template) {
            return { success: false, error: "Template not found" };
        }

        // Clean recipient number
        let cleanPhone = recipientPhone.replace(/[^\d]/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
        const jid = `${cleanPhone}@s.whatsapp.net`;

        // Render body & header
        const renderedBody = substituteVariables(template.body, sampleValues);
        const renderedHeader = template.headerType === 'TEXT' && template.headerText
            ? substituteVariables(template.headerText, sampleValues)
            : null;

        // Ensure active socket before sending
        if (typeof konnectLegacyManager?.ensureActiveSocket === 'function') {
            await konnectLegacyManager.ensureActiveSocket(workspaceId);
        } else if (typeof konnectLegacyManager?.connect === 'function') {
            await konnectLegacyManager.connect(workspaceId);
        }

        const hasButtons = Array.isArray(template.buttons) && template.buttons.length > 0;
        let messagePayload;

        if (hasButtons) {
            messagePayload = {
                text: renderedBody,
                headerText: renderedHeader,
                footer: template.footer,
                buttons: template.buttons
            };

            if (template.headerType === 'IMAGE' && template.headerMedia) {
                messagePayload.image = { url: template.headerMedia };
            } else if (template.headerType === 'DOCUMENT' && template.headerMedia) {
                messagePayload.document = { url: template.headerMedia };
                messagePayload.fileName = `${template.name}.pdf`;
            }
        } else {
            // Compose full text
            let fullMessage = '';
            if (renderedHeader) fullMessage += `*${renderedHeader}*\n\n`;
            fullMessage += renderedBody;
            if (template.footer) fullMessage += `\n\n_${template.footer}_`;

            if (template.headerType === 'IMAGE' && template.headerMedia) {
                messagePayload = {
                    image: { url: template.headerMedia },
                    caption: fullMessage
                };
            } else if (template.headerType === 'DOCUMENT' && template.headerMedia) {
                messagePayload = {
                    document: { url: template.headerMedia },
                    caption: fullMessage,
                    fileName: `${template.name}.pdf`
                };
            } else {
                messagePayload = { text: fullMessage };
            }
        }

        const sent = await konnectLegacyManager.sendMessage(workspaceId, jid, messagePayload);

        return {
            success: true,
            sentWaId: sent.key?.id || `out_${Date.now()}`,
            message: `Template sent successfully to +${cleanPhone}!`
        };
    } catch (error) {
        console.error("[TEST_SEND_TEMPLATE_ERROR]", error);
        return { success: false, error: error.message || "Failed to send test template" };
    }
}
