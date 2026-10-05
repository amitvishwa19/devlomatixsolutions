'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { getValidUserId } from "./auth-helper";
import { triggerCrmWorkflowAction } from "./crm-automation-actions";

/**
 * Bulk Import Contacts, Accounts, and Deals into CRM
 */
export async function bulkImportContactsAndDealsAction(workspaceId, rows = [], options = {}) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        const {
            skipDuplicates = true,
            autoCreateDeals = true,
            pipelineId,
            stageId,
            sendWelcomeWhatsApp = false,
            defaultTags = ["BULK_IMPORT"]
        } = options;

        if (!Array.isArray(rows) || rows.length === 0) {
            return { success: false, error: "No data rows provided for import." };
        }

        // Fetch default pipeline and stage if needed
        let targetPipelineId = pipelineId;
        let targetStageId = stageId;

        if (autoCreateDeals && (!targetPipelineId || !targetStageId)) {
            const defaultPipeline = await prisma.pipeline.findFirst({
                where: { workspaceId },
                include: { stages: { orderBy: { order: 'asc' } } }
            });

            if (defaultPipeline) {
                targetPipelineId = defaultPipeline.id;
                targetStageId = defaultPipeline.stages[0]?.id;
            }
        }

        const summary = {
            totalRows: rows.length,
            importedContacts: 0,
            importedDeals: 0,
            importedAccounts: 0,
            skippedDuplicates: 0,
            errorsCount: 0,
            errors: []
        };

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 1;

            const name = (row.name || row.fullName || '').trim();
            const rawPhone = (row.phone || row.mobile || row.phoneNumber || '').toString().trim();
            const email = (row.email || '').trim().toLowerCase();
            const companyName = (row.company || row.companyName || row.organization || '').trim();
            const dealTitle = (row.dealTitle || row.deal || '').trim();
            const dealValue = parseFloat(row.dealValue || row.value || 0) || 0;
            const rowTags = Array.isArray(row.tags) ? row.tags : (row.tags ? row.tags.split(',').map(t => t.trim()) : []);
            const allTags = Array.from(new Set([...defaultTags, ...rowTags]));

            if (!name || !rawPhone) {
                summary.errorsCount++;
                summary.errors.push(`Row #${rowNum}: Name and Phone are required.`);
                continue;
            }

            const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
            if (cleanPhone.length < 8) {
                summary.errorsCount++;
                summary.errors.push(`Row #${rowNum} (${name}): Invalid phone number "${rawPhone}".`);
                continue;
            }

            // Check duplicate by phone
            const existingContact = await prisma.contact.findFirst({
                where: { workspaceId, phone: cleanPhone }
            });

            if (existingContact && skipDuplicates) {
                summary.skippedDuplicates++;
                continue;
            }

            try {
                // 1. Create or Find Company Account if companyName is provided
                let account = null;
                if (companyName) {
                    account = await prisma.account.findFirst({
                        where: { workspaceId, name: { equals: companyName, mode: 'insensitive' } }
                    });

                    if (!account) {
                        account = await prisma.account.create({
                            data: {
                                workspaceId,
                                userId,
                                name: companyName,
                                industry: row.industry || 'Technology',
                                tier: 'WARM'
                            }
                        });
                        summary.importedAccounts++;
                    }
                }

                // 2. Create Contact
                let contact = existingContact;
                if (!contact) {
                    contact = await prisma.contact.create({
                        data: {
                            workspaceId,
                            userId,
                            name,
                            phone: cleanPhone,
                            email: email || null,
                            title: row.title || row.designation || null,
                            type: row.type || "LEAD",
                            accountId: account ? account.id : null,
                            tags: allTags
                        }
                    });
                    summary.importedContacts++;

                    // Log activity
                    await prisma.crmActivity.create({
                        data: {
                            workspaceId,
                            userId,
                            contactId: contact.id,
                            accountId: account ? account.id : null,
                            type: "NOTE",
                            title: "Contact Imported (Bulk)",
                            description: `Imported via Bulk CSV Importer.`
                        }
                    });

                    // Trigger automation on lead created if requested
                    if (sendWelcomeWhatsApp) {
                        try {
                            await triggerCrmWorkflowAction(workspaceId, {
                                triggerEvent: 'LEAD_CREATED',
                                contact,
                                account
                            });
                        } catch (wfErr) {
                            console.warn("Bulk import workflow error:", wfErr);
                        }
                    }
                }

                // 3. Create Deal if title provided or autoCreateDeals is true
                if (autoCreateDeals && targetPipelineId && targetStageId) {
                    const title = dealTitle || `New Opportunity: ${name}`;
                    const deal = await prisma.deal.create({
                        data: {
                            workspaceId,
                            userId,
                            title,
                            value: dealValue,
                            currency: row.currency || "INR",
                            pipelineId: targetPipelineId,
                            stageId: targetStageId,
                            contactId: contact.id,
                            accountId: account ? account.id : null,
                            ownerId: userId,
                            priority: row.priority || "MEDIUM",
                            tags: ["BULK_IMPORT"]
                        }
                    });
                    summary.importedDeals++;
                }
            } catch (rowErr) {
                console.error(`Row #${rowNum} error:`, rowErr);
                summary.errorsCount++;
                summary.errors.push(`Row #${rowNum} (${name}): ${rowErr.message}`);
            }
        }

        revalidatePath(`/workspace/${workspaceId}/crm/contacts`);
        revalidatePath(`/workspace/${workspaceId}/crm/pipeline`);
        return { success: true, data: summary };
    } catch (error) {
        console.error("[BULK_IMPORT_ERROR]", error);
        return { success: false, error: error.message || "Bulk import failed" };
    }
}

/**
 * 1-Click WhatsApp Chat Auto-Sync Engine (KonnectX Bridge)
 * Scans WhatsApp messages in workspace and synchronizes with CRM Contacts and Timeline
 */
export async function syncWhatsAppChatsToCrmAction(workspaceId) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        // Fetch all distinct whatsapp messages
        const waMessages = await prisma.whatsAppMessage.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            take: 200
        });

        if (waMessages.length === 0) {
            return {
                success: true,
                data: {
                    totalChatsScanned: 0,
                    newContactsCreated: 0,
                    messagesLinked: 0,
                    message: "No KonnectX WhatsApp messages found for synchronization."
                }
            };
        }

        // Group messages by clean phone number
        const chatsByPhone = {};
        waMessages.forEach(msg => {
            const cleanPhone = (msg.jid || '').split('@')[0].replace(/[^0-9]/g, '');
            if (cleanPhone.length >= 8) {
                if (!chatsByPhone[cleanPhone]) {
                    chatsByPhone[cleanPhone] = [];
                }
                chatsByPhone[cleanPhone].push(msg);
            }
        });

        let newContactsCreated = 0;
        let messagesLinked = 0;

        for (const [phone, msgs] of Object.entries(chatsByPhone)) {
            // Check if contact exists
            let contact = await prisma.contact.findFirst({
                where: { workspaceId, phone }
            });

            const latestMsg = msgs[0];

            if (!contact) {
                // Auto-create Contact
                contact = await prisma.contact.create({
                    data: {
                        workspaceId,
                        userId,
                        name: `WhatsApp User (+${phone})`,
                        phone,
                        type: "LEAD",
                        lastMessage: latestMsg.text ? latestMsg.text.slice(0, 100) : 'WhatsApp Chat',
                        lastInteraction: new Date(),
                        tags: ["WHATSAPP_INBOUND", "KONNECT_X_SYNC"]
                    }
                });
                newContactsCreated++;
            } else {
                // Update last message & interaction
                await prisma.contact.update({
                    where: { id: contact.id },
                    data: {
                        lastMessage: latestMsg.text ? latestMsg.text.slice(0, 100) : contact.lastMessage,
                        lastInteraction: new Date()
                    }
                });
            }

            // Record recent chat activity if not already logged
            const existingActivity = await prisma.crmActivity.findFirst({
                where: {
                    workspaceId,
                    contactId: contact.id,
                    type: "WHATSAPP_MSG"
                }
            });

            if (!existingActivity && latestMsg) {
                await prisma.crmActivity.create({
                    data: {
                        workspaceId,
                        userId,
                        contactId: contact.id,
                        type: "WHATSAPP_MSG",
                        title: "WhatsApp Chat Synced",
                        description: latestMsg.text || 'Active WhatsApp conversation synced via KonnectX Bridge.',
                        metadata: { jid: latestMsg.jid, status: latestMsg.status }
                    }
                });
                messagesLinked += msgs.length;
            }
        }

        revalidatePath(`/workspace/${workspaceId}/crm/contacts`);
        return {
            success: true,
            data: {
                totalChatsScanned: Object.keys(chatsByPhone).length,
                newContactsCreated,
                messagesLinked,
                message: `Successfully synchronized ${Object.keys(chatsByPhone).length} WhatsApp conversation threads with CRM.`
            }
        };
    } catch (error) {
        console.error("[SYNC_WHATSAPP_CHATS_ERROR]", error);
        return { success: false, error: error.message || "Failed to sync WhatsApp chats" };
    }
}
