'use server';

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

/**
 * Helper to get current authenticated user and verify workspace access
 */
async function getAuthContext(workspaceId) {
    if (!workspaceId) throw new Error("Workspace ID is required");
    const session = await ensureWorkspaceAccess(workspaceId);
    const userId = session?.user?.userId || session?.user?.id;
    if (!userId) {
        throw new Error("Unauthorized");
    }
    return { session, userId };
}

/**
 * Resolves all user IDs associated with a workspace (owner + members + credentials)
 */
async function resolveWorkspaceUserIds(workspaceId, currentUserId) {
    const workspace = await db.server.findUnique({
        where: { id: workspaceId },
        include: { members: true }
    }).catch(() => null);

    const userIds = new Set([
        currentUserId,
        workspace?.userId,
        ...((workspace?.members || []).map(m => m.userId))
    ].filter(Boolean));

    // Also include userIds from credentials tied to this workspace
    const creds = await db.credentials.findMany({
        where: {
            OR: [
                { workspaceId },
                { userId: { in: Array.from(userIds) } }
            ]
        },
        select: { userId: true }
    }).catch(() => []);

    creds.forEach(c => {
        if (c.userId) userIds.add(c.userId);
    });

    return Array.from(userIds);
}

/**
 * Fetches workspace backup stats and counts across all modules
 */
export async function getWorkspaceBackupStatsAction({ workspaceId }) {
    try {
        const { userId } = await getAuthContext(workspaceId);
        const workspaceUserIds = await resolveWorkspaceUserIds(workspaceId, userId);

        // Fetch counts concurrently for high performance
        const [
            server,
            appSetting,
            accountCount,
            contactCount,
            contactGroupCount,
            pipelineCount,
            dealCount,
            quotationCount,
            activityCount,
            // KonnectX counts
            waMessageCount,
            waTemplateCount,
            waCampaignCount,
            waFlowCount,
            botFlowCount,
            waAuthCount,
            // Konnect Legacy counts
            klMessageCount,
            klContactCount,
            klCampaignCount,
            klRuleCount,
            klFlowCount,
            klSettingCount,
            klTemplateCount,
            // Productivity
            kanbanColumnCount,
            kanbanTaskCount,
            // Automation
            workflowCount,
            cronCount,
            credentialsCount,
            // ATS
            departmentCount,
            jobCount,
            candidateCount,
            jobApplicationCount,
            // Snapshots
            snapshotsRecord
        ] = await Promise.all([
            db.server.findUnique({
                where: { id: workspaceId },
                select: { id: true, name: true, description: true, updatedAt: true }
            }),
            db.appSettings.findUnique({
                where: { key: workspaceId },
                select: { updatedAt: true }
            }),
            db.account.count({ where: { workspaceId } }),
            db.contact.count({ where: { workspaceId } }),
            db.contactGroup.count({ where: { workspaceId } }),
            db.pipeline.count({ where: { workspaceId } }),
            db.deal.count({ where: { workspaceId } }),
            db.quotation.count({ where: { workspaceId } }),
            db.crmActivity.count({ where: { workspaceId } }),

            // KonnectX
            db.whatsAppMessage.count({ where: { userId: { in: workspaceUserIds } } }),
            db.messageTemplate.count({ where: { userId: { in: workspaceUserIds } } }),
            db.campaign.count({ where: { OR: [{ userId: { in: workspaceUserIds } }, { credential: { workspaceId } }] } }),
            db.whatsAppFlow.count({ where: { workspaceId } }),
            db.botFlow.count({ where: { workspaceId } }),
            db.whatsAppAuth.count({ where: { userId: { in: workspaceUserIds } } }),

            // Konnect Legacy
            db.konnectLegacyMessage.count({ where: { OR: [{ workspaceId }, { userId: { in: workspaceUserIds } }] } }),
            db.konnectLegacyContact.count({ where: { OR: [{ workspaceId }, { userId: { in: workspaceUserIds } }] } }),
            db.konnectLegacyCampaign.count({ where: { OR: [{ workspaceId }, { userId: { in: workspaceUserIds } }] } }),
            db.konnectLegacyChatbotRule.count({ where: { OR: [{ workspaceId }, { userId: { in: workspaceUserIds } }] } }),
            db.konnectLegacyFlow.count({ where: { OR: [{ workspaceId }, { userId: { in: workspaceUserIds } }] } }),
            db.konnectLegacySetting.count({ where: { workspaceId } }),
            db.konnectLegacyTemplate.count({ where: { OR: [{ workspaceId }, { userId: { in: workspaceUserIds } }] } }),

            // Productivity
            db.kanbanColumn.count({ where: { workspaceId } }),
            db.kanbanTask.count({ where: { workspaceId } }),

            // Automation
            db.workflow.count({ where: { workspaceId } }),
            db.systemCron.count({ where: { workspaceId } }),
            db.credentials.count({ where: { workspaceId } }),

            // ATS
            db.department.count({ where: { workspaceId } }),
            db.job.count({ where: { workspaceId } }),
            db.candidate.count({ where: { workspaceId } }),
            db.jobApplication.count({ where: { workspaceId } }),

            // Snapshots
            db.appSettings.findUnique({
                where: { key: `backup_snapshots_${workspaceId}` },
                select: { general: true, updatedAt: true }
            })
        ]);

        const snapshots = Array.isArray(snapshotsRecord?.general?.snapshots)
            ? snapshotsRecord.general.snapshots
            : [];

        const konnectxTotal = waMessageCount + waTemplateCount + waCampaignCount + waFlowCount + botFlowCount + waAuthCount;
        const konnectLegacyTotal = klMessageCount + klContactCount + klCampaignCount + klRuleCount + klFlowCount + klSettingCount + klTemplateCount;
        const crmTotal = accountCount + contactCount + contactGroupCount + pipelineCount + dealCount + quotationCount + activityCount;
        const productivityTotal = kanbanColumnCount + kanbanTaskCount;
        const automationTotal = workflowCount + cronCount + credentialsCount;
        const atsTotal = departmentCount + jobCount + candidateCount + jobApplicationCount;

        const totalRecords =
            crmTotal +
            konnectxTotal +
            konnectLegacyTotal +
            productivityTotal +
            automationTotal +
            atsTotal;

        const lastBackupDate = snapshots.length > 0 ? snapshots[0].createdAt : null;

        return {
            success: true,
            stats: {
                workspaceName: server?.name || "Workspace",
                totalRecords,
                lastBackupDate,
                snapshotsCount: snapshots.length,
                counts: {
                    crm: {
                        accounts: accountCount,
                        contacts: contactCount,
                        contactGroups: contactGroupCount,
                        pipelines: pipelineCount,
                        deals: dealCount,
                        quotations: quotationCount,
                        activities: activityCount,
                        total: crmTotal
                    },
                    konnectx: {
                        messages: waMessageCount,
                        templates: waTemplateCount,
                        campaigns: waCampaignCount,
                        whatsappFlows: waFlowCount,
                        botFlows: botFlowCount,
                        authSessions: waAuthCount,
                        total: konnectxTotal
                    },
                    konnectLegacy: {
                        messages: klMessageCount,
                        contacts: klContactCount,
                        campaigns: klCampaignCount,
                        chatbotRules: klRuleCount,
                        flows: klFlowCount,
                        settings: klSettingCount,
                        templates: klTemplateCount,
                        total: konnectLegacyTotal
                    },
                    productivity: {
                        kanbanColumns: kanbanColumnCount,
                        kanbanTasks: kanbanTaskCount,
                        total: productivityTotal
                    },
                    automation: {
                        workflows: workflowCount,
                        systemCrons: cronCount,
                        credentials: credentialsCount,
                        total: automationTotal
                    },
                    ats: {
                        departments: departmentCount,
                        jobs: jobCount,
                        candidates: candidateCount,
                        jobApplications: jobApplicationCount,
                        total: atsTotal
                    },
                    settings: {
                        configured: !!appSetting,
                        lastUpdated: appSetting?.updatedAt || null
                    }
                }
            }
        };
    } catch (error) {
        console.error("[getWorkspaceBackupStatsAction] Error:", error);
        return { success: false, error: error.message || "Failed to load backup stats" };
    }
}

/**
 * Creates a complete or module-selective workspace backup bundle
 */
export async function createWorkspaceBackupAction({
    workspaceId,
    selectedModules = ['settings', 'crm', 'konnectx', 'konnect-legacy', 'productivity', 'automation', 'ats'],
    label = '',
    saveAsSnapshot = true,
    includeSensitive = true
}) {
    try {
        const { session, userId } = await getAuthContext(workspaceId);
        const workspaceUserIds = await resolveWorkspaceUserIds(workspaceId, userId);

        const server = await db.server.findUnique({
            where: { id: workspaceId },
            select: { id: true, name: true, description: true, imageUrl: true, type: true, createdAt: true }
        });

        if (!server) {
            throw new Error("Workspace not found");
        }

        const backupData = {};
        const entityCounts = {};

        // 1. Settings & Config
        if (selectedModules.includes('settings')) {
            const [workspaceSettings, globalSettings] = await Promise.all([
                db.appSettings.findUnique({ where: { key: workspaceId } }),
                db.appSettings.findUnique({ where: { key: 'global' } })
            ]);

            backupData.settings = {
                server: {
                    name: server.name,
                    description: server.description,
                    imageUrl: server.imageUrl,
                    type: server.type
                },
                workspaceSettings: workspaceSettings ? {
                    general: workspaceSettings.general,
                    social: workspaceSettings.social,
                    notifications: workspaceSettings.notifications,
                    security: workspaceSettings.security,
                    integrations: workspaceSettings.integrations,
                    technical: workspaceSettings.technical,
                    privacy: workspaceSettings.privacy,
                    locale: workspaceSettings.locale
                } : null,
                globalBranding: globalSettings?.social || null
            };
            entityCounts.settings = 1;
        }

        // 2. CRM Module
        if (selectedModules.includes('crm')) {
            const [
                accounts,
                contactGroups,
                contacts,
                pipelines,
                deals,
                quotations,
                crmActivities
            ] = await Promise.all([
                db.account.findMany({
                    where: { workspaceId },
                    select: {
                        id: true,
                        name: true,
                        domain: true,
                        industry: true,
                        size: true,
                        website: true,
                        phone: true,
                        email: true,
                        address: true,
                        city: true,
                        state: true,
                        country: true,
                        postalCode: true,
                        annualRevenue: true,
                        rating: true,
                        customFields: true,
                        createdAt: true
                    }
                }),
                db.contactGroup.findMany({
                    where: { workspaceId },
                    select: { id: true, name: true, description: true, createdAt: true }
                }),
                db.contact.findMany({
                    where: { workspaceId },
                    select: {
                        id: true,
                        title: true,
                        name: true,
                        phone: true,
                        email: true,
                        type: true,
                        platform: true,
                        color: true,
                        info: true,
                        category: true,
                        tags: true,
                        whatsappName: true,
                        address: true,
                        location: true,
                        subscribed: true,
                        verified: true,
                        moduleAccess: true,
                        accountId: true,
                        createdAt: true
                    }
                }),
                db.pipeline.findMany({
                    where: { workspaceId },
                    include: {
                        stages: {
                            select: {
                                id: true,
                                name: true,
                                order: true,
                                probability: true,
                                color: true,
                                isWon: true,
                                isLost: true
                            },
                            orderBy: { order: 'asc' }
                        }
                    }
                }),
                db.deal.findMany({
                    where: { workspaceId },
                    select: {
                        id: true,
                        title: true,
                        value: true,
                        currency: true,
                        stageId: true,
                        pipelineId: true,
                        contactId: true,
                        accountId: true,
                        expectedClose: true,
                        closedAt: true,
                        lossReason: true,
                        priority: true,
                        tags: true,
                        customFields: true,
                        createdAt: true
                    }
                }),
                db.quotation.findMany({
                    where: { workspaceId },
                    select: {
                        id: true,
                        quotationNumber: true,
                        clientName: true,
                        total: true,
                        status: true,
                        data: true,
                        createdAt: true
                    }
                }),
                db.crmActivity.findMany({
                    where: { workspaceId },
                    select: {
                        id: true,
                        type: true,
                        title: true,
                        description: true,
                        metadata: true,
                        contactId: true,
                        accountId: true,
                        dealId: true,
                        createdAt: true
                    }
                })
            ]);

            backupData.crm = {
                accounts,
                contactGroups,
                contacts,
                pipelines,
                deals,
                quotations,
                crmActivities
            };

            entityCounts.crm = {
                accounts: accounts.length,
                contactGroups: contactGroups.length,
                contacts: contacts.length,
                pipelines: pipelines.length,
                deals: deals.length,
                quotations: quotations.length,
                activities: crmActivities.length
            };
        }

        // 3. KonnectX Module (WhatsApp Cloud API, Templates, Campaigns, Bots, Auth)
        if (selectedModules.includes('konnectx')) {
            const [
                whatsAppMessages,
                messageTemplates,
                campaigns,
                whatsAppFlows,
                botFlows,
                botExecutions,
                whatsAppAuths
            ] = await Promise.all([
                db.whatsAppMessage.findMany({
                    where: { userId: { in: workspaceUserIds } },
                    select: {
                        id: true,
                        waId: true,
                        jid: true,
                        text: true,
                        fromMe: true,
                        timestamp: true,
                        status: true,
                        metadata: true,
                        createdAt: true
                    }
                }),
                db.messageTemplate.findMany({
                    where: { userId: { in: workspaceUserIds } },
                    select: {
                        id: true,
                        templateId: true,
                        name: true,
                        templateName: true,
                        approved: true,
                        category: true,
                        language: true,
                        type: true,
                        body: true,
                        createdAt: true
                    }
                }),
                db.campaign.findMany({
                    where: { OR: [{ userId: { in: workspaceUserIds } }, { credential: { workspaceId } }] },
                    include: {
                        recipients: {
                            select: {
                                id: true,
                                phone: true,
                                status: true,
                                errorLog: true,
                                variables: true,
                                sentAt: true
                            }
                        }
                    }
                }),
                db.whatsAppFlow.findMany({
                    where: { workspaceId },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        flowId: true,
                        status: true,
                        categories: true,
                        screens: true,
                        definition: true,
                        createdAt: true
                    }
                }),
                db.botFlow.findMany({
                    where: { workspaceId },
                    include: {
                        steps: {
                            select: {
                                id: true,
                                type: true,
                                config: true,
                                positionX: true,
                                positionY: true,
                                order: true
                            },
                            orderBy: { order: 'asc' }
                        }
                    }
                }),
                db.botExecution.findMany({
                    where: { workspaceId },
                    take: 2000,
                    orderBy: { triggeredAt: 'desc' },
                    select: {
                        id: true,
                        botFlowId: true,
                        phone: true,
                        message: true,
                        triggeredAt: true,
                        completedAt: true,
                        status: true,
                        error: true,
                        nodesVisited: true
                    }
                }),
                db.whatsAppAuth.findMany({
                    where: { userId: { in: workspaceUserIds } },
                    select: {
                        id: true,
                        status: true,
                        sessionId: true,
                        sessionName: true,
                        deviceId: true,
                        phoneNumber: true,
                        deviceName: true,
                        platform: true,
                        createdAt: true
                    }
                })
            ]);

            backupData.konnectx = {
                whatsAppMessages: whatsAppMessages.map(m => ({
                    ...m,
                    timestamp: m.timestamp != null ? Number(m.timestamp) : null
                })),
                messageTemplates,
                campaigns,
                whatsAppFlows,
                botFlows,
                botExecutions,
                whatsAppAuths
            };

            entityCounts.konnectx = {
                messages: whatsAppMessages.length,
                templates: messageTemplates.length,
                campaigns: campaigns.length,
                whatsappFlows: whatsAppFlows.length,
                botFlows: botFlows.length,
                botExecutions: botExecutions.length,
                authSessions: whatsAppAuths.length
            };
        }

        // 4. Konnect Legacy Module (Baileys / Web WhatsApp isolated store)
        if (selectedModules.includes('konnect-legacy')) {
            const [
                legacyMessages,
                legacyContacts,
                legacyCampaigns,
                legacyRules,
                legacyFlows,
                legacySetting,
                legacyTemplateGroups,
                legacyTemplates
            ] = await Promise.all([
                db.konnectLegacyMessage.findMany({
                    where: { OR: [{ workspaceId }, { userId: { in: workspaceUserIds } }] },
                    select: {
                        id: true,
                        waId: true,
                        jid: true,
                        phoneNumber: true,
                        pushName: true,
                        text: true,
                        fromMe: true,
                        status: true,
                        mediaType: true,
                        mediaUrl: true,
                        metadata: true,
                        timestamp: true,
                        createdAt: true
                    }
                }),
                db.konnectLegacyContact.findMany({
                    where: { OR: [{ workspaceId }, { userId: { in: workspaceUserIds } }] },
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        whatsappName: true,
                        email: true,
                        tags: true,
                        notes: true,
                        avatar: true,
                        createdAt: true
                    }
                }),
                db.konnectLegacyCampaign.findMany({
                    where: { OR: [{ workspaceId }, { userId: { in: workspaceUserIds } }] },
                    include: {
                        recipients: {
                            select: {
                                id: true,
                                phone: true,
                                name: true,
                                status: true,
                                error: true,
                                sentAt: true
                            }
                        }
                    }
                }),
                db.konnectLegacyChatbotRule.findMany({
                    where: { OR: [{ workspaceId }, { userId: { in: workspaceUserIds } }] },
                    select: {
                        id: true,
                        keyword: true,
                        matchType: true,
                        response: true,
                        active: true,
                        createdAt: true
                    }
                }),
                db.konnectLegacyFlow.findMany({
                    where: { OR: [{ workspaceId }, { userId: { in: workspaceUserIds } }] },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        triggerKeyword: true,
                        welcomeMessage: true,
                        steps: true,
                        active: true,
                        createdAt: true
                    }
                }),
                db.konnectLegacySetting.findUnique({
                    where: { workspaceId }
                }),
                db.konnectLegacyTemplateGroup.findMany({
                    where: { OR: [{ workspaceId }, { userId: { in: workspaceUserIds } }] },
                    include: {
                        templates: true
                    }
                }),
                db.konnectLegacyTemplate.findMany({
                    where: { OR: [{ workspaceId }, { userId: { in: workspaceUserIds } }] },
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        language: true,
                        headerType: true,
                        headerText: true,
                        headerMedia: true,
                        body: true,
                        footer: true,
                        buttons: true,
                        variables: true,
                        groupId: true,
                        createdAt: true
                    }
                })
            ]);

            backupData.konnectLegacy = {
                legacyMessages: legacyMessages.map(m => ({
                    ...m,
                    timestamp: m.timestamp != null ? Number(m.timestamp) : null
                })),
                legacyContacts,
                legacyCampaigns,
                legacyRules,
                legacyFlows,
                legacySetting,
                legacyTemplateGroups,
                legacyTemplates
            };

            entityCounts.konnectLegacy = {
                messages: legacyMessages.length,
                contacts: legacyContacts.length,
                campaigns: legacyCampaigns.length,
                chatbotRules: legacyRules.length,
                flows: legacyFlows.length,
                setting: legacySetting ? 1 : 0,
                templateGroups: legacyTemplateGroups.length,
                templates: legacyTemplates.length
            };
        }

        // 5. Productivity Module (Kanban)
        if (selectedModules.includes('productivity')) {
            const [kanbanColumns, kanbanTasks] = await Promise.all([
                db.kanbanColumn.findMany({
                    where: { workspaceId },
                    select: { id: true, title: true, order: true, createdAt: true },
                    orderBy: { order: 'asc' }
                }),
                db.kanbanTask.findMany({
                    where: { workspaceId },
                    include: {
                        checklists: {
                            select: { id: true, title: true, completed: true, order: true, createdAt: true }
                        }
                    }
                })
            ]);

            backupData.productivity = {
                kanbanColumns,
                kanbanTasks: kanbanTasks.map(t => ({
                    id: t.id,
                    title: t.title,
                    type: t.type,
                    content: t.content,
                    priority: t.priority,
                    dueDate: t.dueDate,
                    order: t.order,
                    columnId: t.columnId,
                    coverUrl: t.coverUrl,
                    checklists: t.checklists,
                    createdAt: t.createdAt
                }))
            };

            entityCounts.productivity = {
                columns: kanbanColumns.length,
                tasks: kanbanTasks.length
            };
        }

        // 6. Automation Module (Workflows, Crons, Credentials)
        if (selectedModules.includes('automation')) {
            const [workflows, systemCrons, credentials] = await Promise.all([
                db.workflow.findMany({
                    where: { workspaceId },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        nodes: true,
                        edges: true,
                        definition: true,
                        status: true,
                        viewport: true,
                        isTemplate: true,
                        scheduleCron: true,
                        scheduleEnabled: true,
                        createdAt: true
                    }
                }),
                db.systemCron.findMany({
                    where: { workspaceId },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        cronExpression: true,
                        status: true,
                        targetType: true,
                        targetId: true,
                        payload: true,
                        createdAt: true
                    }
                }),
                db.credentials.findMany({
                    where: { workspaceId },
                    select: {
                        id: true,
                        platform: true,
                        profile: true,
                        type: true,
                        status: true,
                        environment: true,
                        isDefault: true,
                        verified: true,
                        userInfo: true,
                        credentials: includeSensitive ? true : false,
                        createdAt: true
                    }
                })
            ]);

            backupData.automation = {
                workflows,
                systemCrons,
                credentials
            };

            entityCounts.automation = {
                workflows: workflows.length,
                systemCrons: systemCrons.length,
                credentials: credentials.length
            };
        }

        // 7. ATS / Recruitment Module
        if (selectedModules.includes('ats')) {
            const [departments, jobs, candidates, jobApplications] = await Promise.all([
                db.department.findMany({
                    where: { workspaceId },
                    select: { id: true, name: true, description: true, createdAt: true }
                }),
                db.job.findMany({
                    where: { workspaceId },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        department: true,
                        location: true,
                        type: true,
                        salaryRange: true,
                        status: true,
                        requirements: true,
                        benefits: true,
                        createdAt: true
                    }
                }),
                db.candidate.findMany({
                    where: { workspaceId },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        location: true,
                        summary: true,
                        skills: true,
                        aiSummary: true,
                        aiMatchScore: true,
                        parsedData: true,
                        createdAt: true
                    }
                }),
                db.jobApplication.findMany({
                    where: { workspaceId },
                    select: {
                        id: true,
                        jobId: true,
                        candidateId: true,
                        stage: true,
                        status: true,
                        source: true,
                        appliedAt: true
                    }
                })
            ]);

            backupData.ats = {
                departments,
                jobs,
                candidates,
                jobApplications
            };

            entityCounts.ats = {
                departments: departments.length,
                jobs: jobs.length,
                candidates: candidates.length,
                jobApplications: jobApplications.length
            };
        }

        // Construct Manifest & Bundle
        const snapshotId = `bkp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const timestamp = new Date().toISOString();

        // Calculate total records in bundle
        let totalRecordsInBundle = 0;
        ['crm', 'konnectx', 'konnectLegacy', 'productivity', 'automation', 'ats'].forEach(key => {
            if (entityCounts[key]) {
                totalRecordsInBundle += Object.values(entityCounts[key]).reduce((a, b) => a + b, 0);
            }
        });
        if (entityCounts.settings) {
            totalRecordsInBundle += entityCounts.settings;
        }

        const backupBundle = {
            manifest: {
                formatVersion: "2.2.0",
                application: "Devlomatix Platform",
                workspaceId,
                workspaceName: server.name,
                snapshotId,
                createdAt: timestamp,
                label: label || `Snapshot - ${new Date().toLocaleDateString()}`,
                createdBy: session?.user?.name || session?.user?.email || "Workspace Admin",
                modules: selectedModules,
                entityCounts,
                totalRecords: totalRecordsInBundle,
                checksum: `chk_${Buffer.from(snapshotId + timestamp).toString('base64').substring(0, 16)}`
            },
            data: backupData
        };

        const jsonString = JSON.stringify(backupBundle, (key, value) =>
            typeof value === 'bigint' ? Number(value) : value
        );
        const sizeBytes = Buffer.byteLength(jsonString, 'utf8');

        const snapshotMeta = {
            id: snapshotId,
            label: backupBundle.manifest.label,
            createdAt: timestamp,
            createdBy: backupBundle.manifest.createdBy,
            modules: selectedModules,
            totalRecords: totalRecordsInBundle,
            sizeBytes,
            checksum: backupBundle.manifest.checksum
        };

        // If saveAsSnapshot is requested, persist to DB in rolling snapshots
        if (saveAsSnapshot) {
            // Clean plain JSON object without BigInt references
            const serializableBundle = JSON.parse(jsonString);

            // 1. Store snapshot payload in appSettings under unique key
            await db.appSettings.upsert({
                where: { key: `snapshot_${workspaceId}_${snapshotId}` },
                update: {
                    general: serializableBundle
                },
                create: {
                    key: `snapshot_${workspaceId}_${snapshotId}`,
                    general: serializableBundle
                }
            });

            // 2. Update snapshots meta registry (keep last 10 snapshots)
            const metaKey = `backup_snapshots_${workspaceId}`;
            const existingMetaRecord = await db.appSettings.findUnique({
                where: { key: metaKey }
            });

            const currentSnapshots = Array.isArray(existingMetaRecord?.general?.snapshots)
                ? existingMetaRecord.general.snapshots
                : [];

            const updatedSnapshots = [snapshotMeta, ...currentSnapshots].slice(0, 10);

            await db.appSettings.upsert({
                where: { key: metaKey },
                update: {
                    general: { snapshots: updatedSnapshots }
                },
                create: {
                    key: metaKey,
                    general: { snapshots: updatedSnapshots }
                }
            });

            // Clean up pruned old snapshots from DB
            const evicted = currentSnapshots.slice(9);
            for (const old of evicted) {
                await db.appSettings.deleteMany({
                    where: { key: `snapshot_${workspaceId}_${old.id}` }
                }).catch(() => {});
            }
        }

        revalidatePath(`/workspace/${workspaceId}/system/setting`);

        return {
            success: true,
            backupBundle,
            snapshotMeta
        };
    } catch (error) {
        console.error("[createWorkspaceBackupAction] Error:", error);
        return { success: false, error: error.message || "Failed to create backup" };
    }
}

/**
 * Retrieves list of snapshots saved in this workspace
 */
export async function getWorkspaceSnapshotsAction({ workspaceId }) {
    try {
        await getAuthContext(workspaceId);

        const record = await db.appSettings.findUnique({
            where: { key: `backup_snapshots_${workspaceId}` }
        });

        const snapshots = Array.isArray(record?.general?.snapshots)
            ? record.general.snapshots
            : [];

        return { success: true, snapshots };
    } catch (error) {
        console.error("[getWorkspaceSnapshotsAction] Error:", error);
        return { success: false, error: error.message || "Failed to fetch snapshots", snapshots: [] };
    }
}

/**
 * Fetches full backup bundle for a specific stored snapshot
 */
export async function getSnapshotDataAction({ workspaceId, snapshotId }) {
    try {
        await getAuthContext(workspaceId);

        const record = await db.appSettings.findUnique({
            where: { key: `snapshot_${workspaceId}_${snapshotId}` }
        });

        if (!record?.general) {
            throw new Error("Snapshot data not found or expired");
        }

        return { success: true, backupBundle: record.general };
    } catch (error) {
        console.error("[getSnapshotDataAction] Error:", error);
        return { success: false, error: error.message || "Failed to retrieve snapshot data" };
    }
}

/**
 * Deletes a stored workspace snapshot
 */
export async function deleteWorkspaceSnapshotAction({ workspaceId, snapshotId }) {
    try {
        await getAuthContext(workspaceId);

        await db.appSettings.deleteMany({
            where: { key: `snapshot_${workspaceId}_${snapshotId}` }
        });

        const metaKey = `backup_snapshots_${workspaceId}`;
        const existing = await db.appSettings.findUnique({ where: { key: metaKey } });
        if (existing?.general?.snapshots) {
            const filtered = existing.general.snapshots.filter(s => s.id !== snapshotId);
            await db.appSettings.update({
                where: { key: metaKey },
                data: { general: { snapshots: filtered } }
            });
        }

        revalidatePath(`/workspace/${workspaceId}/system/setting`);
        return { success: true };
    } catch (error) {
        console.error("[deleteWorkspaceSnapshotAction] Error:", error);
        return { success: false, error: error.message || "Failed to delete snapshot" };
    }
}

/**
 * Validates an uploaded or selected backup bundle without applying it (Dry Run)
 */
export async function validateBackupBundleAction({ workspaceId, backupBundle }) {
    try {
        await getAuthContext(workspaceId);

        if (!backupBundle || typeof backupBundle !== 'object') {
            return { valid: false, error: "Invalid backup file: file content is not a valid JSON object" };
        }

        const { manifest, data } = backupBundle;

        if (!manifest || !data) {
            return { valid: false, error: "Invalid backup structure: missing 'manifest' or 'data' root blocks" };
        }

        const warnings = [];
        const isCrossWorkspace = manifest.workspaceId && manifest.workspaceId !== workspaceId;

        if (isCrossWorkspace) {
            warnings.push(`Cross-workspace migration: Backup originated from workspace '${manifest.workspaceName || manifest.workspaceId}'. Identifiers will be safely adapted to current workspace.`);
        }

        // Collect available entity breakdown
        const detectedCounts = {
            settings: data.settings ? 1 : 0,
            // CRM
            accounts: data.crm?.accounts?.length || 0,
            contacts: data.crm?.contacts?.length || 0,
            pipelines: data.crm?.pipelines?.length || 0,
            deals: data.crm?.deals?.length || 0,
            quotations: data.crm?.quotations?.length || 0,
            activities: data.crm?.crmActivities?.length || 0,
            // KonnectX
            konnectxMessages: data.konnectx?.whatsAppMessages?.length || 0,
            konnectxTemplates: data.konnectx?.messageTemplates?.length || 0,
            konnectxCampaigns: data.konnectx?.campaigns?.length || 0,
            konnectxFlows: (data.konnectx?.whatsAppFlows?.length || 0) + (data.konnectx?.botFlows?.length || 0),
            // Konnect Legacy
            legacyMessages: data.konnectLegacy?.legacyMessages?.length || 0,
            legacyContacts: data.konnectLegacy?.legacyContacts?.length || 0,
            legacyCampaigns: data.konnectLegacy?.legacyCampaigns?.length || 0,
            legacyRules: data.konnectLegacy?.legacyRules?.length || 0,
            legacyTemplates: (data.konnectLegacy?.legacyTemplates?.length || 0) + (data.konnectLegacy?.legacyTemplateGroups?.length || 0),
            // Productivity
            kanbanTasks: data.productivity?.kanbanTasks?.length || 0,
            kanbanColumns: data.productivity?.kanbanColumns?.length || 0,
            // Automation
            workflows: data.automation?.workflows?.length || 0,
            systemCrons: data.automation?.systemCrons?.length || 0,
            credentials: data.automation?.credentials?.length || 0,
            // ATS
            jobs: data.ats?.jobs?.length || 0,
            candidates: data.ats?.candidates?.length || 0,
            jobApplications: data.ats?.jobApplications?.length || 0
        };

        const totalRecordsDetected = Object.values(detectedCounts).reduce((a, b) => a + b, 0);

        if (totalRecordsDetected === 0) {
            return { valid: false, error: "Empty backup: No valid records detected in any supported module" };
        }

        return {
            valid: true,
            manifest,
            detectedCounts,
            totalRecordsDetected,
            warnings,
            isCrossWorkspace
        };
    } catch (error) {
        console.error("[validateBackupBundleAction] Error:", error);
        return { valid: false, error: error.message || "Failed to validate backup bundle" };
    }
}

/**
 * Restores workspace data from backup bundle
 * Supports 'merge' (safe, non-destructive upsert) and 'clean' (wipe module data and replace)
 */
export async function restoreWorkspaceBackupAction({
    workspaceId,
    backupBundle,
    options = {
        mode: 'merge',
        selectedModules: ['settings', 'crm', 'konnectx', 'konnect-legacy', 'productivity', 'automation', 'ats'],
        overwrite: true
    }
}) {
    try {
        const { session, userId: currentUserId } = await getAuthContext(workspaceId);
        const workspaceUserIds = await resolveWorkspaceUserIds(workspaceId, currentUserId);

        const validation = await validateBackupBundleAction({ workspaceId, backupBundle });
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        const { data, manifest } = backupBundle;
        const { mode, selectedModules, overwrite } = options;

        const summary = {
            mode,
            modulesRestored: [],
            counts: {},
            errors: []
        };

        // ==========================================
        // 1. CLEAN WIPE PHASE (Only if mode === 'clean')
        // ==========================================
        if (mode === 'clean') {
            if (selectedModules.includes('crm')) {
                await db.crmActivity.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Activities wipe: ${e.message}`));
                await db.quotation.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Quotations wipe: ${e.message}`));
                await db.deal.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Deals wipe: ${e.message}`));
                await db.pipeline.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Pipelines wipe: ${e.message}`));
                await db.contact.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Contacts wipe: ${e.message}`));
                await db.contactGroup.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Groups wipe: ${e.message}`));
                await db.account.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Accounts wipe: ${e.message}`));
            }

            if (selectedModules.includes('konnect-legacy')) {
                await db.konnectLegacyMessage.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Legacy messages wipe: ${e.message}`));
                await db.konnectLegacyCampaignRecipient.deleteMany({ where: { campaign: { workspaceId } } }).catch(() => {});
                await db.konnectLegacyCampaign.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Legacy campaigns wipe: ${e.message}`));
                await db.konnectLegacyChatbotRule.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Legacy rules wipe: ${e.message}`));
                await db.konnectLegacyFlow.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Legacy flows wipe: ${e.message}`));
                await db.konnectLegacyTemplate.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Legacy templates wipe: ${e.message}`));
                await db.konnectLegacyTemplateGroup.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Legacy groups wipe: ${e.message}`));
                await db.konnectLegacyContact.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Legacy contacts wipe: ${e.message}`));
            }

            if (selectedModules.includes('konnectx')) {
                await db.botExecution.deleteMany({ where: { workspaceId } }).catch(() => {});
                await db.botFlowStep.deleteMany({ where: { botFlow: { workspaceId } } }).catch(() => {});
                await db.botFlow.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Bot flows wipe: ${e.message}`));
                await db.whatsAppFlow.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`WA flows wipe: ${e.message}`));
                await db.campaignRecipient.deleteMany({ where: { campaign: { credential: { workspaceId } } } }).catch(() => {});
                await db.campaign.deleteMany({ where: { credential: { workspaceId } } }).catch(() => {});
            }

            if (selectedModules.includes('productivity')) {
                await db.kanbanTask.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Kanban tasks wipe: ${e.message}`));
                await db.kanbanColumn.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Kanban columns wipe: ${e.message}`));
            }

            if (selectedModules.includes('automation')) {
                await db.systemCron.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Crons wipe: ${e.message}`));
                await db.workflow.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Workflows wipe: ${e.message}`));
            }

            if (selectedModules.includes('ats')) {
                await db.jobApplication.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Applications wipe: ${e.message}`));
                await db.candidate.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Candidates wipe: ${e.message}`));
                await db.job.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Jobs wipe: ${e.message}`));
                await db.department.deleteMany({ where: { workspaceId } }).catch(e => summary.errors.push(`Departments wipe: ${e.message}`));
            }
        }

        // ==========================================
        // 2. RESTORE SETTINGS
        // ==========================================
        if (selectedModules.includes('settings') && data.settings) {
            try {
                if (data.settings.workspaceSettings) {
                    const ws = data.settings.workspaceSettings;
                    await db.appSettings.upsert({
                        where: { key: workspaceId },
                        update: {
                            ...(ws.general ? { general: ws.general } : {}),
                            ...(ws.social ? { social: ws.social } : {}),
                            ...(ws.notifications ? { notifications: ws.notifications } : {}),
                            ...(ws.security ? { security: ws.security } : {}),
                            ...(ws.integrations ? { integrations: ws.integrations } : {}),
                            ...(ws.technical ? { technical: ws.technical } : {}),
                            ...(ws.privacy ? { privacy: ws.privacy } : {}),
                            ...(ws.locale ? { locale: ws.locale } : {})
                        },
                        create: {
                            key: workspaceId,
                            general: ws.general || {},
                            social: ws.social || {},
                            notifications: ws.notifications || {},
                            security: ws.security || {},
                            integrations: ws.integrations || {},
                            technical: ws.technical || {},
                            privacy: ws.privacy || {},
                            locale: ws.locale || {}
                        }
                    });
                }

                if (data.settings.server && overwrite) {
                    await db.server.update({
                        where: { id: workspaceId },
                        data: {
                            ...(data.settings.server.name ? { name: data.settings.server.name } : {}),
                            ...(data.settings.server.description ? { description: data.settings.server.description } : {}),
                            ...(data.settings.server.imageUrl ? { imageUrl: data.settings.server.imageUrl } : {})
                        }
                    }).catch(() => {});
                }

                summary.modulesRestored.push('settings');
                summary.counts.settings = 1;
            } catch (err) {
                summary.errors.push(`Settings restore: ${err.message}`);
            }
        }

        // ID Mapping Registries for relational re-stitching
        const accountMap = {};
        const groupMap = {};
        const contactMap = {};
        const pipelineMap = {};
        const stageMap = {};
        const dealMap = {};
        const colMap = {};
        const deptMap = {};
        const jobMap = {};
        const candMap = {};
        const klTemplateGroupMap = {};
        const botFlowMap = {};

        // ==========================================
        // 3. RESTORE CRM
        // ==========================================
        if (selectedModules.includes('crm') && data.crm) {
            let accountsRestored = 0;
            let groupsRestored = 0;
            let contactsRestored = 0;
            let pipelinesRestored = 0;
            let dealsRestored = 0;
            let quotationsRestored = 0;
            let activitiesRestored = 0;

            // Accounts
            if (Array.isArray(data.crm.accounts)) {
                for (const acc of data.crm.accounts) {
                    try {
                        let existing = await db.account.findFirst({
                            where: { workspaceId, name: acc.name }
                        });

                        if (!existing) {
                            existing = await db.account.create({
                                data: {
                                    workspaceId,
                                    userId: currentUserId,
                                    name: acc.name,
                                    domain: acc.domain,
                                    industry: acc.industry,
                                    size: acc.size,
                                    website: acc.website,
                                    phone: acc.phone,
                                    email: acc.email,
                                    address: acc.address,
                                    city: acc.city,
                                    state: acc.state,
                                    country: acc.country,
                                    postalCode: acc.postalCode,
                                    annualRevenue: acc.annualRevenue,
                                    rating: acc.rating,
                                    customFields: acc.customFields || {}
                                }
                            });
                        } else if (overwrite) {
                            existing = await db.account.update({
                                where: { id: existing.id },
                                data: {
                                    domain: acc.domain || existing.domain,
                                    industry: acc.industry || existing.industry,
                                    website: acc.website || existing.website,
                                    phone: acc.phone || existing.phone,
                                    email: acc.email || existing.email,
                                    address: acc.address || existing.address,
                                    customFields: acc.customFields || existing.customFields
                                }
                            });
                        }
                        accountMap[acc.id] = existing.id;
                        accountsRestored++;
                    } catch (e) {
                        summary.errors.push(`Account '${acc.name}': ${e.message}`);
                    }
                }
            }

            // Contact Groups
            if (Array.isArray(data.crm.contactGroups)) {
                for (const grp of data.crm.contactGroups) {
                    try {
                        let existing = await db.contactGroup.findFirst({
                            where: { workspaceId, name: grp.name }
                        });

                        if (!existing) {
                            existing = await db.contactGroup.create({
                                data: {
                                    workspaceId,
                                    userId: currentUserId,
                                    name: grp.name,
                                    description: grp.description
                                }
                            });
                        }
                        groupMap[grp.id] = existing.id;
                        groupsRestored++;
                    } catch (e) {
                        summary.errors.push(`Contact Group '${grp.name}': ${e.message}`);
                    }
                }
            }

            // Contacts
            if (Array.isArray(data.crm.contacts)) {
                for (const c of data.crm.contacts) {
                    try {
                        let existing = null;
                        if (c.phone) {
                            existing = await db.contact.findFirst({ where: { workspaceId, phone: c.phone } });
                        }
                        if (!existing && c.email) {
                            existing = await db.contact.findFirst({ where: { workspaceId, email: c.email } });
                        }
                        if (!existing && c.name) {
                            existing = await db.contact.findFirst({ where: { workspaceId, name: c.name } });
                        }

                        const resolvedAccountId = c.accountId ? (accountMap[c.accountId] || null) : null;

                        if (!existing) {
                            existing = await db.contact.create({
                                data: {
                                    workspaceId,
                                    userId: currentUserId,
                                    name: c.name || "Unnamed Contact",
                                    title: c.title,
                                    phone: c.phone,
                                    email: c.email,
                                    type: c.type || "LEAD",
                                    platform: c.platform || "MANUAL",
                                    color: c.color,
                                    info: c.info || {},
                                    category: c.category || "General",
                                    tags: c.tags || [],
                                    whatsappName: c.whatsappName,
                                    address: c.address,
                                    location: c.location,
                                    subscribed: c.subscribed !== undefined ? c.subscribed : true,
                                    verified: c.verified || false,
                                    moduleAccess: c.moduleAccess || {},
                                    accountId: resolvedAccountId
                                }
                            });
                        } else if (overwrite) {
                            existing = await db.contact.update({
                                where: { id: existing.id },
                                data: {
                                    title: c.title || existing.title,
                                    type: c.type || existing.type,
                                    category: c.category || existing.category,
                                    tags: c.tags || existing.tags,
                                    accountId: resolvedAccountId || existing.accountId
                                }
                            });
                        }
                        contactMap[c.id] = existing.id;
                        contactsRestored++;
                    } catch (e) {
                        summary.errors.push(`Contact '${c.name}': ${e.message}`);
                    }
                }
            }

            // Pipelines & Stages
            if (Array.isArray(data.crm.pipelines)) {
                for (const p of data.crm.pipelines) {
                    try {
                        let existingPipe = await db.pipeline.findFirst({
                            where: { workspaceId, name: p.name },
                            include: { stages: true }
                        });

                        if (!existingPipe) {
                            existingPipe = await db.pipeline.create({
                                data: {
                                    workspaceId,
                                    userId: currentUserId,
                                    name: p.name,
                                    description: p.description,
                                    isDefault: p.isDefault || false,
                                    color: p.color || "#3b82f6"
                                }
                            });
                        }
                        pipelineMap[p.id] = existingPipe.id;

                        if (Array.isArray(p.stages)) {
                            for (const st of p.stages) {
                                let existingStage = await db.dealStage.findFirst({
                                    where: { pipelineId: existingPipe.id, name: st.name }
                                });

                                if (!existingStage) {
                                    existingStage = await db.dealStage.create({
                                        data: {
                                            pipelineId: existingPipe.id,
                                            name: st.name,
                                            order: st.order || 0,
                                            probability: st.probability || 50,
                                            color: st.color || "#3b82f6",
                                            isWon: st.isWon || false,
                                            isLost: st.isLost || false
                                        }
                                    });
                                }
                                stageMap[st.id] = existingStage.id;
                            }
                        }
                        pipelinesRestored++;
                    } catch (e) {
                        summary.errors.push(`Pipeline '${p.name}': ${e.message}`);
                    }
                }
            }

            // Deals
            if (Array.isArray(data.crm.deals)) {
                for (const d of data.crm.deals) {
                    try {
                        const targetPipelineId = pipelineMap[d.pipelineId] || Object.values(pipelineMap)[0];
                        const targetStageId = stageMap[d.stageId] || Object.values(stageMap)[0];
                        const targetContactId = d.contactId ? (contactMap[d.contactId] || null) : null;
                        const targetAccountId = d.accountId ? (accountMap[d.accountId] || null) : null;

                        if (targetPipelineId && targetStageId) {
                            let existingDeal = await db.deal.findFirst({
                                where: { workspaceId, title: d.title }
                            });

                            if (!existingDeal) {
                                existingDeal = await db.deal.create({
                                    data: {
                                        workspaceId,
                                        userId: currentUserId,
                                        title: d.title,
                                        value: Number(d.value) || 0,
                                        currency: d.currency || "INR",
                                        pipelineId: targetPipelineId,
                                        stageId: targetStageId,
                                        contactId: targetContactId,
                                        accountId: targetAccountId,
                                        expectedClose: d.expectedClose ? new Date(d.expectedClose) : null,
                                        closedAt: d.closedAt ? new Date(d.closedAt) : null,
                                        lossReason: d.lossReason,
                                        priority: d.priority || "MEDIUM",
                                        tags: d.tags || [],
                                        customFields: d.customFields || {}
                                    }
                                });
                            } else if (overwrite) {
                                existingDeal = await db.deal.update({
                                    where: { id: existingDeal.id },
                                    data: {
                                        value: Number(d.value) || existingDeal.value,
                                        stageId: targetStageId,
                                        contactId: targetContactId || existingDeal.contactId,
                                        accountId: targetAccountId || existingDeal.accountId
                                    }
                                });
                            }
                            dealMap[d.id] = existingDeal.id;
                            dealsRestored++;
                        }
                    } catch (e) {
                        summary.errors.push(`Deal '${d.title}': ${e.message}`);
                    }
                }
            }

            // Quotations
            if (Array.isArray(data.crm.quotations)) {
                for (const q of data.crm.quotations) {
                    try {
                        let existingQ = await db.quotation.findFirst({
                            where: { workspaceId, quotationNumber: q.quotationNumber }
                        });

                        if (!existingQ) {
                            existingQ = await db.quotation.create({
                                data: {
                                    workspaceId,
                                    userId: currentUserId,
                                    quotationNumber: q.quotationNumber,
                                    clientName: q.clientName,
                                    total: Number(q.total) || 0,
                                    status: q.status || "DRAFT",
                                    data: q.data || {}
                                }
                            });
                        } else if (overwrite) {
                            existingQ = await db.quotation.update({
                                where: { id: existingQ.id },
                                data: {
                                    clientName: q.clientName || existingQ.clientName,
                                    total: Number(q.total) || existingQ.total,
                                    status: q.status || existingQ.status,
                                    data: q.data || existingQ.data
                                }
                            });
                        }
                        quotationsRestored++;
                    } catch (e) {
                        summary.errors.push(`Quotation '${q.quotationNumber}': ${e.message}`);
                    }
                }
            }

            // CRM Activities
            if (Array.isArray(data.crm.crmActivities)) {
                for (const act of data.crm.crmActivities) {
                    try {
                        await db.crmActivity.create({
                            data: {
                                workspaceId,
                                userId: currentUserId,
                                type: act.type || "NOTE",
                                title: act.title || "Restored Activity",
                                description: act.description,
                                metadata: act.metadata || {},
                                contactId: act.contactId ? (contactMap[act.contactId] || null) : null,
                                accountId: act.accountId ? (accountMap[act.accountId] || null) : null,
                                dealId: act.dealId ? (dealMap[act.dealId] || null) : null
                            }
                        });
                        activitiesRestored++;
                    } catch (e) {
                        summary.errors.push(`CRM Activity '${act.title}': ${e.message}`);
                    }
                }
            }

            summary.modulesRestored.push('crm');
            summary.counts.crm = {
                accounts: accountsRestored,
                contactGroups: groupsRestored,
                contacts: contactsRestored,
                pipelines: pipelinesRestored,
                deals: dealsRestored,
                quotations: quotationsRestored,
                activities: activitiesRestored
            };
        }

        // ==========================================
        // 4. RESTORE KONNECT-LEGACY MODULE
        // ==========================================
        if (selectedModules.includes('konnect-legacy') && data.konnectLegacy) {
            let klSettingRestored = 0;
            let klTplGroupsRestored = 0;
            let klTplsRestored = 0;
            let klContactsRestored = 0;
            let klRulesRestored = 0;
            let klFlowsRestored = 0;
            let klCampaignsRestored = 0;
            let klMessagesRestored = 0;

            // Settings
            if (data.konnectLegacy.legacySetting) {
                try {
                    const s = data.konnectLegacy.legacySetting;
                    await db.konnectLegacySetting.upsert({
                        where: { workspaceId },
                        update: {
                            minDelaySeconds: s.minDelaySeconds || 5,
                            maxDelaySeconds: s.maxDelaySeconds || 15,
                            simulateTyping: s.simulateTyping ?? true,
                            batchSize: s.batchSize || 50,
                            batchCooldownMinutes: s.batchCooldownMinutes || 30,
                            autoReadIncoming: s.autoReadIncoming ?? true,
                            dailySafetyLimit: s.dailySafetyLimit || 500
                        },
                        create: {
                            workspaceId,
                            userId: currentUserId,
                            minDelaySeconds: s.minDelaySeconds || 5,
                            maxDelaySeconds: s.maxDelaySeconds || 15,
                            simulateTyping: s.simulateTyping ?? true,
                            batchSize: s.batchSize || 50,
                            batchCooldownMinutes: s.batchCooldownMinutes || 30,
                            autoReadIncoming: s.autoReadIncoming ?? true,
                            dailySafetyLimit: s.dailySafetyLimit || 500
                        }
                    });
                    klSettingRestored = 1;
                } catch (e) {
                    summary.errors.push(`Legacy setting restore: ${e.message}`);
                }
            }

            // Template Groups
            if (Array.isArray(data.konnectLegacy.legacyTemplateGroups)) {
                for (const grp of data.konnectLegacy.legacyTemplateGroups) {
                    try {
                        let existing = await db.konnectLegacyTemplateGroup.findFirst({
                            where: { workspaceId, name: grp.name }
                        });
                        if (!existing) {
                            existing = await db.konnectLegacyTemplateGroup.create({
                                data: {
                                    workspaceId,
                                    userId: currentUserId,
                                    name: grp.name,
                                    description: grp.description,
                                    color: grp.color || '#3b82f6'
                                }
                            });
                        }
                        klTemplateGroupMap[grp.id] = existing.id;
                        klTplGroupsRestored++;
                    } catch (e) {
                        summary.errors.push(`Legacy template group '${grp.name}': ${e.message}`);
                    }
                }
            }

            // Templates
            if (Array.isArray(data.konnectLegacy.legacyTemplates)) {
                for (const t of data.konnectLegacy.legacyTemplates) {
                    try {
                        const targetGroupId = t.groupId ? (klTemplateGroupMap[t.groupId] || null) : null;
                        await db.konnectLegacyTemplate.create({
                            data: {
                                workspaceId,
                                userId: currentUserId,
                                name: t.name,
                                category: t.category || "UTILITY",
                                language: t.language || "en",
                                headerType: t.headerType || "NONE",
                                headerText: t.headerText,
                                headerMedia: t.headerMedia,
                                body: t.body || "",
                                footer: t.footer,
                                buttons: t.buttons || [],
                                variables: t.variables || [],
                                groupId: targetGroupId
                            }
                        });
                        klTplsRestored++;
                    } catch (e) {
                        summary.errors.push(`Legacy template '${t.name}': ${e.message}`);
                    }
                }
            }

            // Contacts
            if (Array.isArray(data.konnectLegacy.legacyContacts)) {
                for (const c of data.konnectLegacy.legacyContacts) {
                    try {
                        if (c.phone) {
                            await db.konnectLegacyContact.upsert({
                                where: {
                                    workspaceId_phone: {
                                        workspaceId,
                                        phone: c.phone
                                    }
                                },
                                update: {
                                    name: c.name || undefined,
                                    whatsappName: c.whatsappName || undefined,
                                    email: c.email || undefined,
                                    tags: c.tags || undefined,
                                    notes: c.notes || undefined
                                },
                                create: {
                                    workspaceId,
                                    userId: currentUserId,
                                    name: c.name || "Legacy Contact",
                                    phone: c.phone,
                                    whatsappName: c.whatsappName,
                                    email: c.email,
                                    tags: c.tags || [],
                                    notes: c.notes,
                                    avatar: c.avatar
                                }
                            });
                            klContactsRestored++;
                        }
                    } catch (e) {
                        summary.errors.push(`Legacy contact '${c.phone}': ${e.message}`);
                    }
                }
            }

            // Chatbot Rules
            if (Array.isArray(data.konnectLegacy.legacyRules)) {
                for (const r of data.konnectLegacy.legacyRules) {
                    try {
                        await db.konnectLegacyChatbotRule.create({
                            data: {
                                workspaceId,
                                userId: currentUserId,
                                keyword: r.keyword,
                                matchType: r.matchType || "EXACT",
                                response: r.response || "",
                                active: r.active ?? true
                            }
                        });
                        klRulesRestored++;
                    } catch (e) {
                        summary.errors.push(`Legacy rule '${r.keyword}': ${e.message}`);
                    }
                }
            }

            // Flows
            if (Array.isArray(data.konnectLegacy.legacyFlows)) {
                for (const f of data.konnectLegacy.legacyFlows) {
                    try {
                        await db.konnectLegacyFlow.create({
                            data: {
                                workspaceId,
                                userId: currentUserId,
                                name: f.name,
                                description: f.description,
                                triggerKeyword: f.triggerKeyword,
                                welcomeMessage: f.welcomeMessage,
                                steps: f.steps || [],
                                active: f.active ?? true
                            }
                        });
                        klFlowsRestored++;
                    } catch (e) {
                        summary.errors.push(`Legacy flow '${f.name}': ${e.message}`);
                    }
                }
            }

            // Campaigns & Recipients
            if (Array.isArray(data.konnectLegacy.legacyCampaigns)) {
                for (const camp of data.konnectLegacy.legacyCampaigns) {
                    try {
                        const createdCamp = await db.konnectLegacyCampaign.create({
                            data: {
                                workspaceId,
                                userId: currentUserId,
                                name: camp.name,
                                description: camp.description,
                                messageText: camp.messageText || "",
                                mediaUrl: camp.mediaUrl,
                                status: camp.status || "COMPLETED",
                                minDelaySeconds: camp.minDelaySeconds || 5,
                                maxDelaySeconds: camp.maxDelaySeconds || 15
                            }
                        });

                        if (Array.isArray(camp.recipients)) {
                            for (const rec of camp.recipients) {
                                await db.konnectLegacyCampaignRecipient.create({
                                    data: {
                                        campaignId: createdCamp.id,
                                        phone: rec.phone,
                                        name: rec.name,
                                        status: rec.status || "PENDING",
                                        error: rec.error,
                                        sentAt: rec.sentAt ? new Date(rec.sentAt) : null
                                    }
                                }).catch(() => {});
                            }
                        }
                        klCampaignsRestored++;
                    } catch (e) {
                        summary.errors.push(`Legacy campaign '${camp.name}': ${e.message}`);
                    }
                }
            }

            // Messages
            if (Array.isArray(data.konnectLegacy.legacyMessages)) {
                for (const m of data.konnectLegacy.legacyMessages) {
                    try {
                        let safeWaId = m.waId;
                        if (safeWaId) {
                            const existing = await db.konnectLegacyMessage.findUnique({
                                where: { waId: safeWaId }
                            });
                            if (existing) {
                                if (existing.workspaceId === workspaceId) {
                                    await db.konnectLegacyMessage.update({
                                        where: { id: existing.id },
                                        data: { status: m.status || existing.status }
                                    });
                                    klMessagesRestored++;
                                    continue;
                                } else {
                                    // Suffix waId to avoid unique collision across distinct workspaces
                                    safeWaId = `${safeWaId}_m_${workspaceId.substring(0, 5)}`;
                                }
                            }
                        }

                        await db.konnectLegacyMessage.create({
                            data: {
                                workspaceId,
                                userId: currentUserId,
                                waId: safeWaId,
                                jid: m.jid || "unknown@s.whatsapp.net",
                                phoneNumber: m.phoneNumber,
                                pushName: m.pushName,
                                text: m.text || "",
                                fromMe: m.fromMe ?? false,
                                status: m.status || "SENT",
                                mediaType: m.mediaType,
                                mediaUrl: m.mediaUrl,
                                metadata: m.metadata || null,
                                timestamp: m.timestamp ? BigInt(m.timestamp) : BigInt(Date.now())
                            }
                        });
                        klMessagesRestored++;
                    } catch (e) {
                        // Suppress individual duplicate message warnings in bulk restore
                    }
                }
            }

            summary.modulesRestored.push('konnect-legacy');
            summary.counts.konnectLegacy = {
                settings: klSettingRestored,
                templateGroups: klTplGroupsRestored,
                templates: klTplsRestored,
                contacts: klContactsRestored,
                chatbotRules: klRulesRestored,
                flows: klFlowsRestored,
                campaigns: klCampaignsRestored,
                messages: klMessagesRestored
            };
        }

        // ==========================================
        // 5. RESTORE KONNECTX MODULE
        // ==========================================
        if (selectedModules.includes('konnectx') && data.konnectx) {
            let waAuthsRestored = 0;
            let waTplsRestored = 0;
            let waFlowsRestored = 0;
            let botFlowsRestored = 0;
            let waCampsRestored = 0;
            let waMsgsRestored = 0;

            // WhatsApp Auth
            if (Array.isArray(data.konnectx.whatsAppAuths)) {
                for (const auth of data.konnectx.whatsAppAuths) {
                    try {
                        let existing = await db.whatsAppAuth.findFirst({
                            where: { userId: currentUserId, sessionId: auth.sessionId }
                        });
                        if (!existing) {
                            await db.whatsAppAuth.create({
                                data: {
                                    userId: currentUserId,
                                    status: auth.status || "CONNECTED",
                                    sessionId: auth.sessionId,
                                    sessionName: auth.sessionName,
                                    deviceId: auth.deviceId,
                                    phoneNumber: auth.phoneNumber,
                                    deviceName: auth.deviceName,
                                    platform: auth.platform || "WHATSAPP_CLOUD"
                                }
                            });
                        }
                        waAuthsRestored++;
                    } catch (e) {
                        summary.errors.push(`WhatsApp Auth restore: ${e.message}`);
                    }
                }
            }

            // Message Templates
            if (Array.isArray(data.konnectx.messageTemplates)) {
                for (const t of data.konnectx.messageTemplates) {
                    try {
                        let existing = await db.messageTemplate.findFirst({
                            where: { userId: currentUserId, templateName: t.templateName }
                        });
                        if (!existing) {
                            await db.messageTemplate.create({
                                data: {
                                    userId: currentUserId,
                                    templateId: t.templateId || `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                                    name: t.name,
                                    templateName: t.templateName,
                                    approved: t.approved ?? true,
                                    category: t.category || "MARKETING",
                                    language: t.language || "en",
                                    type: t.type || "STANDARD",
                                    body: t.body || {}
                                }
                            });
                        }
                        waTplsRestored++;
                    } catch (e) {
                        summary.errors.push(`Template '${t.name}': ${e.message}`);
                    }
                }
            }

            // WhatsApp Flows
            if (Array.isArray(data.konnectx.whatsAppFlows)) {
                for (const wf of data.konnectx.whatsAppFlows) {
                    try {
                        let existing = await db.whatsAppFlow.findFirst({
                            where: { workspaceId, flowId: wf.flowId }
                        });
                        if (!existing) {
                            await db.whatsAppFlow.create({
                                data: {
                                    workspaceId,
                                    userId: currentUserId,
                                    name: wf.name,
                                    description: wf.description,
                                    flowId: wf.flowId,
                                    status: wf.status || "DRAFT",
                                    categories: wf.categories || [],
                                    screens: wf.screens || [],
                                    definition: wf.definition || {}
                                }
                            });
                        }
                        waFlowsRestored++;
                    } catch (e) {
                        summary.errors.push(`WhatsApp Flow '${wf.name}': ${e.message}`);
                    }
                }
            }

            // Bot Flows & Steps
            if (Array.isArray(data.konnectx.botFlows)) {
                for (const bf of data.konnectx.botFlows) {
                    try {
                        let existing = await db.botFlow.findFirst({
                            where: { workspaceId, name: bf.name }
                        });
                        if (!existing) {
                            existing = await db.botFlow.create({
                                data: {
                                    workspaceId,
                                    userId: currentUserId,
                                    name: bf.name,
                                    description: bf.description,
                                    active: bf.active ?? true,
                                    nodes: bf.nodes || []
                                }
                            });
                        }
                        botFlowMap[bf.id] = existing.id;

                        if (Array.isArray(bf.steps)) {
                            for (const step of bf.steps) {
                                await db.botFlowStep.create({
                                    data: {
                                        botFlowId: existing.id,
                                        type: step.type || "MESSAGE",
                                        config: step.config || {},
                                        positionX: step.positionX || 0,
                                        positionY: step.positionY || 0,
                                        order: step.order || 0
                                    }
                                }).catch(() => {});
                            }
                        }
                        botFlowsRestored++;
                    } catch (e) {
                        summary.errors.push(`Bot Flow '${bf.name}': ${e.message}`);
                    }
                }
            }

            // Campaigns & Recipients
            if (Array.isArray(data.konnectx.campaigns)) {
                for (const cmp of data.konnectx.campaigns) {
                    try {
                        const created = await db.campaign.create({
                            data: {
                                userId: currentUserId,
                                name: cmp.name,
                                description: cmp.description,
                                status: cmp.status || "COMPLETED",
                                messageType: cmp.messageType || "TEMPLATE",
                                messageTemplate: cmp.messageTemplate,
                                templateId: cmp.templateId,
                                credentialId: cmp.credentialId,
                                scheduledAt: cmp.scheduledAt ? new Date(cmp.scheduledAt) : null
                            }
                        });

                        if (Array.isArray(cmp.recipients)) {
                            for (const rc of cmp.recipients) {
                                await db.campaignRecipient.create({
                                    data: {
                                        campaignId: created.id,
                                        phone: rc.phone,
                                        status: rc.status || "PENDING",
                                        errorLog: rc.errorLog,
                                        variables: rc.variables || {},
                                        sentAt: rc.sentAt ? new Date(rc.sentAt) : null
                                    }
                                }).catch(() => {});
                            }
                        }
                        waCampsRestored++;
                    } catch (e) {
                        summary.errors.push(`Campaign '${cmp.name}': ${e.message}`);
                    }
                }
            }

            // WhatsApp Messages
            if (Array.isArray(data.konnectx.whatsAppMessages)) {
                for (const wm of data.konnectx.whatsAppMessages) {
                    try {
                        let safeWaId = wm.waId;
                        if (safeWaId) {
                            const existing = await db.whatsAppMessage.findUnique({
                                where: { waId: safeWaId }
                            });
                            if (existing) {
                                if (existing.userId === currentUserId) {
                                    await db.whatsAppMessage.update({
                                        where: { id: existing.id },
                                        data: { status: wm.status || existing.status }
                                    });
                                    waMsgsRestored++;
                                    continue;
                                } else {
                                    safeWaId = `${safeWaId}_m_${workspaceId.substring(0, 5)}`;
                                }
                            }
                        }

                        await db.whatsAppMessage.create({
                            data: {
                                userId: currentUserId,
                                waId: safeWaId,
                                jid: wm.jid || "unknown@s.whatsapp.net",
                                text: wm.text || "",
                                fromMe: wm.fromMe ?? false,
                                timestamp: wm.timestamp ? BigInt(wm.timestamp) : BigInt(Date.now()),
                                status: wm.status || "SENT",
                                metadata: wm.metadata || {}
                            }
                        });
                        waMsgsRestored++;
                    } catch (e) {
                        // Suppress individual duplicate warnings in bulk restore
                    }
                }
            }

            summary.modulesRestored.push('konnectx');
            summary.counts.konnectx = {
                authSessions: waAuthsRestored,
                templates: waTplsRestored,
                whatsappFlows: waFlowsRestored,
                botFlows: botFlowsRestored,
                campaigns: waCampsRestored,
                messages: waMsgsRestored
            };
        }

        // ==========================================
        // 6. RESTORE PRODUCTIVITY (Kanban)
        // ==========================================
        if (selectedModules.includes('productivity') && data.productivity) {
            let colsRestored = 0;
            let tasksRestored = 0;

            if (Array.isArray(data.productivity.kanbanColumns)) {
                for (const col of data.productivity.kanbanColumns) {
                    try {
                        let existingCol = await db.kanbanColumn.findFirst({
                            where: { workspaceId, title: col.title }
                        });

                        if (!existingCol) {
                            existingCol = await db.kanbanColumn.create({
                                data: {
                                    workspaceId,
                                    userId: currentUserId,
                                    title: col.title,
                                    order: col.order || 0
                                }
                            });
                        }
                        colMap[col.id] = existingCol.id;
                        colsRestored++;
                    } catch (e) {
                        summary.errors.push(`Kanban Column '${col.title}': ${e.message}`);
                    }
                }
            }

            if (Array.isArray(data.productivity.kanbanTasks)) {
                for (const t of data.productivity.kanbanTasks) {
                    try {
                        const targetColId = colMap[t.columnId] || Object.values(colMap)[0];
                        if (targetColId) {
                            const task = await db.kanbanTask.create({
                                data: {
                                    workspaceId,
                                    userId: currentUserId,
                                    columnId: targetColId,
                                    title: t.title,
                                    type: t.type || "TASK",
                                    content: t.content,
                                    priority: t.priority || "NORMAL",
                                    dueDate: t.dueDate ? new Date(t.dueDate) : null,
                                    order: t.order || 0,
                                    coverUrl: t.coverUrl
                                }
                            });

                            if (Array.isArray(t.checklists) && t.checklists.length > 0) {
                                for (const chk of t.checklists) {
                                    await db.kanbanChecklist.create({
                                        data: {
                                            taskId: task.id,
                                            title: chk.title,
                                            completed: chk.completed ?? chk.isDone ?? false,
                                            order: chk.order || 0
                                        }
                                    }).catch(() => {});
                                }
                            }
                            tasksRestored++;
                        }
                    } catch (e) {
                        summary.errors.push(`Kanban Task '${t.title}': ${e.message}`);
                    }
                }
            }

            summary.modulesRestored.push('productivity');
            summary.counts.productivity = {
                columns: colsRestored,
                tasks: tasksRestored
            };
        }

        // ==========================================
        // 7. RESTORE AUTOMATION (Workflows & Crons)
        // ==========================================
        if (selectedModules.includes('automation') && data.automation) {
            let workflowsRestored = 0;
            let cronsRestored = 0;
            let credsRestored = 0;

            if (Array.isArray(data.automation.workflows)) {
                for (const w of data.automation.workflows) {
                    try {
                        let existingW = await db.workflow.findFirst({
                            where: { workspaceId, name: w.name }
                        });

                        if (!existingW) {
                            await db.workflow.create({
                                data: {
                                    workspaceId,
                                    userId: currentUserId,
                                    name: w.name,
                                    description: w.description,
                                    nodes: w.nodes || [],
                                    edges: w.edges || [],
                                    definition: w.definition || {},
                                    status: w.status || "DRAFT",
                                    viewport: w.viewport || {},
                                    isTemplate: w.isTemplate || false,
                                    scheduleCron: w.scheduleCron,
                                    scheduleEnabled: w.scheduleEnabled || false
                                }
                            });
                        } else if (overwrite) {
                            await db.workflow.update({
                                where: { id: existingW.id },
                                data: {
                                    nodes: w.nodes || existingW.nodes,
                                    edges: w.edges || existingW.edges,
                                    definition: w.definition || existingW.definition,
                                    status: w.status || existingW.status
                                }
                            });
                        }
                        workflowsRestored++;
                    } catch (e) {
                        summary.errors.push(`Workflow '${w.name}': ${e.message}`);
                    }
                }
            }

            if (Array.isArray(data.automation.systemCrons)) {
                for (const c of data.automation.systemCrons) {
                    try {
                        let existingC = await db.systemCron.findFirst({
                            where: { workspaceId, name: c.name }
                        });

                        if (!existingC) {
                            await db.systemCron.create({
                                data: {
                                    workspaceId,
                                    userId: currentUserId,
                                    name: c.name,
                                    description: c.description,
                                    cronExpression: c.cronExpression,
                                    status: c.status || "ACTIVE",
                                    targetType: c.targetType,
                                    targetId: c.targetId,
                                    payload: c.payload || {}
                                }
                            });
                        }
                        cronsRestored++;
                    } catch (e) {
                        summary.errors.push(`System Cron '${c.name}': ${e.message}`);
                    }
                }
            }

            if (Array.isArray(data.automation.credentials)) {
                for (const cred of data.automation.credentials) {
                    try {
                        let existingCred = await db.credentials.findFirst({
                            where: { workspaceId, platform: cred.platform, profile: cred.profile }
                        });

                        if (!existingCred) {
                            await db.credentials.create({
                                data: {
                                    workspaceId,
                                    userId: currentUserId,
                                    platform: cred.platform,
                                    profile: cred.profile,
                                    type: cred.type || "DEFAULT",
                                    status: cred.status || "active",
                                    environment: cred.environment || "production",
                                    isDefault: cred.isDefault || false,
                                    verified: cred.verified || false,
                                    userInfo: cred.userInfo || {},
                                    credentials: cred.credentials || {}
                                }
                            });
                        }
                        credsRestored++;
                    } catch (e) {
                        summary.errors.push(`Credential '${cred.platform}': ${e.message}`);
                    }
                }
            }

            summary.modulesRestored.push('automation');
            summary.counts.automation = {
                workflows: workflowsRestored,
                systemCrons: cronsRestored,
                credentials: credsRestored
            };
        }

        // ==========================================
        // 8. RESTORE ATS (Jobs, Candidates)
        // ==========================================
        if (selectedModules.includes('ats') && data.ats) {
            let deptsRestored = 0;
            let jobsRestored = 0;
            let candsRestored = 0;
            let appsRestored = 0;

            if (Array.isArray(data.ats.departments)) {
                for (const d of data.ats.departments) {
                    try {
                        let existingD = await db.department.findFirst({
                            where: { workspaceId, name: d.name }
                        });
                        if (!existingD) {
                            existingD = await db.department.create({
                                data: {
                                    workspaceId,
                                    userId: currentUserId,
                                    name: d.name,
                                    description: d.description
                                }
                            });
                        }
                        deptMap[d.id] = existingD.id;
                        deptsRestored++;
                    } catch (e) {
                        summary.errors.push(`Department '${d.name}': ${e.message}`);
                    }
                }
            }

            if (Array.isArray(data.ats.jobs)) {
                for (const j of data.ats.jobs) {
                    try {
                        let existingJ = await db.job.findFirst({
                            where: { workspaceId, title: j.title }
                        });
                        if (!existingJ) {
                            existingJ = await db.job.create({
                                data: {
                                    workspaceId,
                                    userId: currentUserId,
                                    title: j.title,
                                    description: j.description || "",
                                    department: j.department,
                                    location: j.location,
                                    type: j.type,
                                    salaryRange: j.salaryRange,
                                    status: j.status || "OPEN",
                                    requirements: j.requirements || [],
                                    benefits: j.benefits || []
                                }
                            });
                        }
                        jobMap[j.id] = existingJ.id;
                        jobsRestored++;
                    } catch (e) {
                        summary.errors.push(`Job '${j.title}': ${e.message}`);
                    }
                }
            }

            if (Array.isArray(data.ats.candidates)) {
                for (const cd of data.ats.candidates) {
                    try {
                        let existingCd = null;
                        if (cd.email) {
                            existingCd = await db.candidate.findFirst({ where: { workspaceId, email: cd.email } });
                        }
                        if (!existingCd) {
                            existingCd = await db.candidate.create({
                                data: {
                                    workspaceId,
                                    userId: currentUserId,
                                    name: cd.name,
                                    email: cd.email,
                                    phone: cd.phone,
                                    location: cd.location,
                                    summary: cd.summary,
                                    skills: cd.skills || [],
                                    aiSummary: cd.aiSummary,
                                    aiMatchScore: cd.aiMatchScore,
                                    parsedData: cd.parsedData || {}
                                }
                            });
                        }
                        candMap[cd.id] = existingCd.id;
                        candsRestored++;
                    } catch (e) {
                        summary.errors.push(`Candidate '${cd.name}': ${e.message}`);
                    }
                }
            }

            if (Array.isArray(data.ats.jobApplications)) {
                for (const ja of data.ats.jobApplications) {
                    try {
                        const targetJobId = jobMap[ja.jobId];
                        const targetCandId = candMap[ja.candidateId];
                        if (targetJobId && targetCandId) {
                            await db.jobApplication.create({
                                data: {
                                    workspaceId,
                                    jobId: targetJobId,
                                    candidateId: targetCandId,
                                    stage: ja.stage || "APPLIED",
                                    status: ja.status || "ACTIVE",
                                    source: ja.source || "RESTORE",
                                    appliedAt: ja.appliedAt ? new Date(ja.appliedAt) : new Date()
                                }
                            });
                            appsRestored++;
                        }
                    } catch (e) {
                        summary.errors.push(`Application restore: ${e.message}`);
                    }
                }
            }

            summary.modulesRestored.push('ats');
            summary.counts.ats = {
                departments: deptsRestored,
                jobs: jobsRestored,
                candidates: candsRestored,
                applications: appsRestored
            };
        }

        // Log restore event in visitorLog for audit compliance
        await db.visitorLog.create({
            data: {
                workspaceId,
                path: `/workspace/${workspaceId}/system/setting#backup`,
                title: "WORKSPACE_FULL_RESTORE_EXECUTED",
                metadata: {
                    executedBy: session?.user?.name || session?.user?.email,
                    mode,
                    manifestSnapshotId: manifest?.snapshotId,
                    sourceWorkspace: manifest?.workspaceName,
                    modulesRestored: summary.modulesRestored,
                    counts: summary.counts,
                    errorsCount: summary.errors.length
                }
            }
        }).catch(() => {});

        revalidatePath(`/workspace/${workspaceId}`);

        return {
            success: true,
            summary
        };
    } catch (error) {
        console.error("[restoreWorkspaceBackupAction] Error:", error);
        return { success: false, error: error.message || "Failed to restore workspace backup" };
    }
}
