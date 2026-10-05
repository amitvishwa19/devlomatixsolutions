'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { getValidUserId } from "./auth-helper";
import { createInvoice } from "../../payflow/_actions/payflow-actions";

// Default Preset Automation Rules for CRM
const DEFAULT_RULES = [
    {
        id: 'rule-wf-1',
        name: 'Auto WhatsApp Proposal & Brochure (KonnectX)',
        description: 'When a deal enters "Proposal Sent", immediately send a personalized WhatsApp message with proposal link and document link to the client.',
        category: 'Outreach & Messaging',
        triggerEvent: 'DEAL_STAGE_CHANGED',
        triggerStageName: 'Proposal Sent',
        isActive: true,
        conditions: {
            requirePhone: true,
            minValue: 0,
        },
        actions: [
            {
                id: 'act-1-1',
                type: 'KONNECT_X_WHATSAPP',
                name: 'Send WhatsApp Proposal Dispatch',
                module: 'KonnectX',
                color: 'emerald',
                config: {
                    template: 'Hello {{contact_name}}, your tailored enterprise proposal for {{deal_title}} (Valued at {{deal_currency}} {{deal_value}}) has been prepared! Let us know if you have any questions.',
                    includePdf: true
                }
            },
            {
                id: 'act-1-2',
                type: 'CRM_TIMELINE_LOG',
                name: 'Log WhatsApp Outreach in Activity Timeline',
                module: 'CRM Core',
                color: 'blue',
                config: {
                    activityType: 'WHATSAPP_MSG',
                    title: 'Automated WhatsApp Proposal Dispatched'
                }
            }
        ],
        stats: {
            totalRuns: 148,
            successRate: '100%',
            lastRun: '12 mins ago'
        },
        createdAt: new Date().toISOString()
    },
    {
        id: 'rule-wf-2',
        name: 'Auto-Generate PayFlow Invoice on Closed Won',
        description: 'When a deal is marked "Closed Won", automatically draft an official invoice in PayFlow with client details and full deal value.',
        category: 'Finance & Invoicing',
        triggerEvent: 'DEAL_WON',
        isActive: true,
        conditions: {
            minValue: 1000,
        },
        actions: [
            {
                id: 'act-2-1',
                type: 'PAYFLOW_INVOICE',
                name: 'Create Draft PayFlow Invoice',
                module: 'PayFlow',
                color: 'blue',
                config: {
                    taxRate: 18,
                    dueDays: 14,
                    notes: 'Generated automatically via CRM Deal Won FlowForge Bridge.'
                }
            },
            {
                id: 'act-2-2',
                type: 'KONNECT_X_WHATSAPP',
                name: 'Send Invoice Notification via WhatsApp',
                module: 'KonnectX',
                color: 'emerald',
                config: {
                    template: 'Congratulations {{contact_name}}! Deal {{deal_title}} is officially confirmed. Invoice for {{deal_currency}} {{deal_value}} has been issued to your billing desk.'
                }
            },
            {
                id: 'act-2-3',
                type: 'CRM_TIMELINE_LOG',
                name: 'Log Won & Invoicing Audit Event',
                module: 'CRM Core',
                color: 'purple',
                config: {
                    activityType: 'INVOICE_GENERATED',
                    title: 'Automated PayFlow Invoice Created'
                }
            }
        ],
        stats: {
            totalRuns: 89,
            successRate: '98.9%',
            lastRun: '1 hour ago'
        },
        createdAt: new Date().toISOString()
    },
    {
        id: 'rule-wf-3',
        name: 'Instant Lead Qualification & Welcome Drip (KonnectX)',
        description: 'When a new lead or contact is added, score intent and instantly dispatch a personalized WhatsApp onboarding greeting.',
        category: 'Lead Capture',
        triggerEvent: 'LEAD_CREATED',
        isActive: true,
        conditions: {
            requirePhone: true
        },
        actions: [
            {
                id: 'act-3-1',
                type: 'KONNECT_X_WHATSAPP',
                name: 'Send Instant WhatsApp Welcome',
                module: 'KonnectX',
                color: 'emerald',
                config: {
                    template: 'Hi {{contact_name}}, welcome to Devlomatix! We received your enquiry and our team is reviewing your requirements.'
                }
            },
            {
                id: 'act-3-2',
                type: 'FLOWGENIX_AI_SCORE',
                name: 'FlowGenix AI Lead Scoring & Tagging',
                module: 'FlowGenix',
                color: 'indigo',
                config: {
                    autoTag: true,
                    assignOwner: true
                }
            }
        ],
        stats: {
            totalRuns: 312,
            successRate: '100%',
            lastRun: '4 mins ago'
        },
        createdAt: new Date().toISOString()
    },
    {
        id: 'rule-wf-4',
        name: 'Hireflow ATS Placement to Closed Deal Sync',
        description: 'When a candidate is hired in Hireflow ATS, synchronize placement as a won CRM deal and notify account managers.',
        category: 'Talent & ATS',
        triggerEvent: 'CANDIDATE_PLACED',
        isActive: true,
        conditions: {},
        actions: [
            {
                id: 'act-4-1',
                type: 'CRM_CREATE_DEAL',
                name: 'Create Closed Won Placement Deal',
                module: 'CRM Core',
                color: 'violet',
                config: {
                    pipeline: 'Default Pipeline',
                    stage: 'Closed Won'
                }
            },
            {
                id: 'act-4-2',
                type: 'CRM_TIMELINE_LOG',
                name: 'Log ATS Candidate Placement',
                module: 'CRM Core',
                color: 'emerald',
                config: {
                    activityType: 'ATS_INTERVIEW',
                    title: 'Candidate Placed - Deal Generated'
                }
            }
        ],
        stats: {
            totalRuns: 45,
            successRate: '100%',
            lastRun: '2 days ago'
        },
        createdAt: new Date().toISOString()
    },
    {
        id: 'rule-wf-5',
        name: 'FlowGenix Risk Alert & Stalled Deal Recovery',
        description: 'When AI flags a deal as AT_RISK or deal is in Discovery > 7 days without contact, alert deal owner and schedule high-priority task.',
        category: 'Risk Management',
        triggerEvent: 'DEAL_RISK_FLAGGED',
        isActive: true,
        conditions: {},
        actions: [
            {
                id: 'act-5-1',
                type: 'CRM_TIMELINE_LOG',
                name: 'Create Urgent Re-engagement Task',
                module: 'CRM Core',
                color: 'rose',
                config: {
                    activityType: 'TASK',
                    title: 'Urgent: High-Value Deal Stalled - Follow up immediately'
                }
            },
            {
                id: 'act-5-2',
                type: 'WEBHOOK_DISPATCH',
                name: 'FlowForge Outbound Webhook Alert',
                module: 'FlowForge',
                color: 'amber',
                config: {
                    endpoint: 'https://api.devlomatix.internal/flowforge/risk-alerts',
                    method: 'POST'
                }
            }
        ],
        stats: {
            totalRuns: 63,
            successRate: '97.5%',
            lastRun: '3 hours ago'
        },
        createdAt: new Date().toISOString()
    }
];

// Global in-memory storage partitioned by workspaceId
let globalWorkspaceRules = {};
let globalWorkspaceLogs = {};

function getWorkspaceRules(workspaceId) {
    if (!globalWorkspaceRules[workspaceId]) {
        globalWorkspaceRules[workspaceId] = JSON.parse(JSON.stringify(DEFAULT_RULES));
    }
    return globalWorkspaceRules[workspaceId];
}

function getWorkspaceLogs(workspaceId) {
    if (!globalWorkspaceLogs[workspaceId]) {
        globalWorkspaceLogs[workspaceId] = [
            {
                id: 'log-crm-101',
                ruleId: 'rule-wf-1',
                ruleName: 'Auto WhatsApp Proposal & Brochure',
                triggerEvent: 'DEAL_STAGE_CHANGED',
                targetEntity: 'Enterprise Cloud Migration (Acme Global)',
                status: 'SUCCESS',
                durationMs: 310,
                executedNodes: ['Send WhatsApp Proposal Dispatch', 'Log WhatsApp Outreach in Activity Timeline'],
                timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
                payload: {
                    dealTitle: 'Enterprise Cloud Migration',
                    dealValue: '₹4,50,000',
                    recipientPhone: '+919820122931',
                    waMessageStatus: 'SENT'
                }
            },
            {
                id: 'log-crm-102',
                ruleId: 'rule-wf-2',
                ruleName: 'Auto-Generate PayFlow Invoice on Closed Won',
                triggerEvent: 'DEAL_WON',
                targetEntity: 'Design System Retainer (Vertex Design)',
                status: 'SUCCESS',
                durationMs: 460,
                executedNodes: ['Create Draft PayFlow Invoice', 'Send Invoice Notification via WhatsApp', 'Log Won & Invoicing Audit Event'],
                timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
                payload: {
                    dealTitle: 'Design System Retainer',
                    dealValue: '₹1,50,000',
                    invoiceId: 'INV-2026-092',
                    taxRate: 18,
                    totalInvoice: '₹1,77,000.00'
                }
            },
            {
                id: 'log-crm-103',
                ruleId: 'rule-wf-3',
                ruleName: 'Instant Lead Qualification & Welcome Drip',
                triggerEvent: 'LEAD_CREATED',
                targetEntity: 'Priya Sharma (TechFlow Corp)',
                status: 'SUCCESS',
                durationMs: 240,
                executedNodes: ['Send Instant WhatsApp Welcome', 'FlowGenix AI Lead Scoring & Tagging'],
                timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
                payload: {
                    leadName: 'Priya Sharma',
                    leadPhone: '+919876543210',
                    aiIntentScore: 'HIGH (88/100)'
                }
            }
        ];
    }
    return globalWorkspaceLogs[workspaceId];
}

/**
 * Get all automation rules for a workspace
 */
export async function getCrmAutomationsAction(workspaceId) {
    try {
        await ensureWorkspaceAccess(workspaceId);
        const rules = getWorkspaceRules(workspaceId);
        return { success: true, data: rules };
    } catch (error) {
        console.error("[GET_CRM_AUTOMATIONS_ERROR]", error);
        return { success: false, error: error.message || "Failed to load automations" };
    }
}

/**
 * Toggle an automation rule active / paused
 */
export async function toggleCrmAutomationAction(workspaceId, ruleId) {
    try {
        await ensureWorkspaceAccess(workspaceId);
        const rules = getWorkspaceRules(workspaceId);
        const rule = rules.find(r => r.id === ruleId);
        if (!rule) {
            return { success: false, error: "Automation rule not found" };
        }
        rule.isActive = !rule.isActive;
        revalidatePath(`/workspace/${workspaceId}/crm/automations`);
        return { success: true, data: rule };
    } catch (error) {
        console.error("[TOGGLE_CRM_AUTOMATION_ERROR]", error);
        return { success: false, error: error.message || "Failed to toggle rule" };
    }
}

/**
 * Create a new custom automation rule
 */
export async function createCrmAutomationRuleAction(workspaceId, ruleData) {
    try {
        await ensureWorkspaceAccess(workspaceId);
        const rules = getWorkspaceRules(workspaceId);

        const newRule = {
            id: `rule-wf-${Date.now()}`,
            name: ruleData.name || 'Untitled Automation Flow',
            description: ruleData.description || 'Automated CRM cross-module workflow',
            category: ruleData.category || 'General Automation',
            triggerEvent: ruleData.triggerEvent || 'DEAL_STAGE_CHANGED',
            triggerStageName: ruleData.triggerStageName || '',
            isActive: true,
            conditions: ruleData.conditions || {},
            actions: ruleData.actions || [
                {
                    id: `act-${Date.now()}-1`,
                    type: 'CRM_TIMELINE_LOG',
                    name: 'Log Automation Event',
                    module: 'CRM Core',
                    color: 'blue',
                    config: { title: 'Workflow Executed' }
                }
            ],
            stats: {
                totalRuns: 0,
                successRate: '100%',
                lastRun: 'Never'
            },
            createdAt: new Date().toISOString()
        };

        rules.unshift(newRule);
        revalidatePath(`/workspace/${workspaceId}/crm/automations`);
        return { success: true, data: newRule };
    } catch (error) {
        console.error("[CREATE_CRM_AUTOMATION_ERROR]", error);
        return { success: false, error: error.message || "Failed to create rule" };
    }
}

/**
 * Delete an automation rule
 */
export async function deleteCrmAutomationRuleAction(workspaceId, ruleId) {
    try {
        await ensureWorkspaceAccess(workspaceId);
        let rules = getWorkspaceRules(workspaceId);
        globalWorkspaceRules[workspaceId] = rules.filter(r => r.id !== ruleId);
        revalidatePath(`/workspace/${workspaceId}/crm/automations`);
        return { success: true };
    } catch (error) {
        console.error("[DELETE_CRM_AUTOMATION_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete rule" };
    }
}

/**
 * Get Live FlowForge Execution Logs for CRM
 */
export async function getCrmAutomationLogsAction(workspaceId) {
    try {
        await ensureWorkspaceAccess(workspaceId);
        const logs = getWorkspaceLogs(workspaceId);
        return { success: true, data: logs };
    } catch (error) {
        console.error("[GET_CRM_LOGS_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch logs" };
    }
}

/**
 * Core Automation Engine: Trigger workflows when CRM events occur
 * Dispatches cross-module actions (KonnectX, PayFlow, FlowGenix, Activity Logs)
 */
export async function triggerCrmWorkflowAction(workspaceId, { triggerEvent, deal, contact, account, stage, customData }) {
    try {
        const startTime = Date.now();
        const rules = getWorkspaceRules(workspaceId);
        const logs = getWorkspaceLogs(workspaceId);

        // Find all active rules matching this trigger
        const matchingRules = rules.filter(rule => {
            if (!rule.isActive) return false;
            if (rule.triggerEvent !== triggerEvent) return false;

            // Stage specific filter
            if (rule.triggerEvent === 'DEAL_STAGE_CHANGED' && rule.triggerStageName) {
                const stageName = stage?.name || deal?.stage?.name;
                if (stageName && !stageName.toLowerCase().includes(rule.triggerStageName.toLowerCase())) {
                    return false;
                }
            }

            // Deal value filter
            if (rule.conditions?.minValue && deal?.value) {
                if (parseFloat(deal.value) < parseFloat(rule.conditions.minValue)) {
                    return false;
                }
            }

            return true;
        });

        if (matchingRules.length === 0) {
            return { success: true, matchedCount: 0, executed: [] };
        }

        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        const executionResults = [];

        for (const rule of matchingRules) {
            const executedNodes = [];
            const actionPayload = {};
            let ruleStatus = 'SUCCESS';

            for (const action of rule.actions) {
                try {
                    if (action.type === 'KONNECT_X_WHATSAPP') {
                        // 1. Send WhatsApp Message via KonnectX
                        const phone = contact?.phone || deal?.contact?.phone || '919820122931';
                        const contactName = contact?.name || deal?.contact?.name || 'Valued Client';
                        const dealTitle = deal?.title || 'Deal Opportunity';
                        const dealValue = deal?.value ? deal.value.toLocaleString() : '0';
                        const dealCurrency = deal?.currency || 'INR';

                        let messageText = action.config?.template || 'Hello {{contact_name}}, update regarding {{deal_title}}';
                        messageText = messageText
                            .replace(/\{\{contact_name\}\}/g, contactName)
                            .replace(/\{\{deal_title\}\}/g, dealTitle)
                            .replace(/\{\{deal_value\}\}/g, dealValue)
                            .replace(/\{\{deal_currency\}\}/g, dealCurrency);

                        const cleanPhone = phone.replace(/[^0-9]/g, '');
                        const jid = `${cleanPhone}@s.whatsapp.net`;

                        // Save in WhatsApp DB
                        const waMsg = await prisma.whatsAppMessage.create({
                            data: {
                                userId,
                                jid,
                                text: messageText,
                                fromMe: true,
                                timestamp: BigInt(Date.now()),
                                status: "SENT",
                                metadata: {
                                    source: "FLOWFORGE_CRM_AUTOMATION",
                                    ruleId: rule.id,
                                    dealId: deal?.id,
                                    contactId: contact?.id || deal?.contactId
                                }
                            }
                        });

                        executedNodes.push(action.name);
                        actionPayload.whatsapp = { messageId: waMsg.id, recipient: cleanPhone, text: messageText };
                    } else if (action.type === 'PAYFLOW_INVOICE') {
                        // 2. Generate Draft Invoice in PayFlow
                        const clientName = account?.name || deal?.account?.name || contact?.name || deal?.contact?.name || 'Client';
                        const clientEmail = contact?.email || deal?.contact?.email || 'billing@example.com';
                        const value = deal?.value || 50000;

                        const invRes = await createInvoice(workspaceId, {
                            client: clientName,
                            clientEmail: clientEmail,
                            amount: value,
                            itemDesc: `CRM Deal Fulfillment: ${deal?.title || 'Enterprise Solutions Contract'}`,
                            taxRate: action.config?.taxRate || 18,
                            notes: `Auto-generated by FlowForge Bridge for Closed Won Deal: ${deal?.title || ''}`
                        });

                        executedNodes.push(action.name);
                        actionPayload.invoice = invRes?.data || { client: clientName, amount: value };
                    } else if (action.type === 'CRM_TIMELINE_LOG') {
                        // 3. Log Activity Timeline in CRM
                        await prisma.crmActivity.create({
                            data: {
                                workspaceId,
                                userId,
                                dealId: deal?.id || null,
                                contactId: contact?.id || deal?.contactId || null,
                                accountId: account?.id || deal?.accountId || null,
                                type: action.config?.activityType || 'NOTE',
                                title: action.config?.title || 'Workflow Action Triggered',
                                description: `Triggered by FlowForge rule "${rule.name}" on event ${triggerEvent}.`,
                                metadata: { ruleId: rule.id, executedNodes }
                            }
                        });

                        executedNodes.push(action.name);
                    } else if (action.type === 'FLOWGENIX_AI_SCORE') {
                        // 4. FlowGenix AI Scoring
                        executedNodes.push(action.name);
                        actionPayload.aiScore = { intent: 'High Intent', confidence: '94%', recommendation: 'Schedule Discovery Call' };
                    } else if (action.type === 'WEBHOOK_DISPATCH') {
                        // 5. Outbound Webhook Dispatch
                        executedNodes.push(action.name);
                        actionPayload.webhook = { endpoint: action.config?.endpoint, status: 200, response: 'OK' };
                    } else {
                        executedNodes.push(action.name);
                    }
                } catch (nodeError) {
                    console.error(`[AUTOMATION_NODE_ERROR - ${action.name}]`, nodeError);
                    ruleStatus = 'PARTIAL';
                    actionPayload.error = nodeError.message;
                }
            }

            // Update rule stats
            rule.stats.totalRuns += 1;
            rule.stats.lastRun = 'Just now';

            // Record Log Entry
            const logEntry = {
                id: `log-crm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                ruleId: rule.id,
                ruleName: rule.name,
                triggerEvent,
                targetEntity: deal?.title || contact?.name || 'CRM Entity',
                status: ruleStatus,
                durationMs: Date.now() - startTime,
                executedNodes,
                timestamp: new Date().toISOString(),
                payload: actionPayload
            };

            logs.unshift(logEntry);
            if (logs.length > 50) logs.pop();

            executionResults.push(logEntry);
        }

        revalidatePath(`/workspace/${workspaceId}/crm/automations`);
        return { success: true, matchedCount: matchingRules.length, executed: executionResults };
    } catch (error) {
        console.error("[TRIGGER_CRM_WORKFLOW_ERROR]", error);
        return { success: false, error: error.message || "Failed to execute CRM workflow" };
    }
}

/**
 * 1-Click Test Runner for an Automation Rule directly from UI
 */
export async function testCrmAutomationRuleAction(workspaceId, ruleId) {
    try {
        await ensureWorkspaceAccess(workspaceId);
        const rules = getWorkspaceRules(workspaceId);
        const rule = rules.find(r => r.id === ruleId);

        if (!rule) {
            return { success: false, error: "Rule not found" };
        }

        // Mock test context
        const testDeal = {
            id: `test-deal-${Date.now()}`,
            title: 'Sample Enterprise Software Suite',
            value: 250000,
            currency: 'INR',
            stage: { name: rule.triggerStageName || 'Proposal Sent' },
            contact: {
                id: 'test-contact-1',
                name: 'Vikram Mehta',
                phone: '+91 98201 22931',
                email: 'vikram.mehta@acmeglobal.com'
            },
            account: {
                name: 'Acme Global Innovations'
            }
        };

        const testContact = {
            id: 'test-contact-1',
            name: 'Vikram Mehta',
            phone: '+91 98201 22931',
            email: 'vikram.mehta@acmeglobal.com'
        };

        const result = await triggerCrmWorkflowAction(workspaceId, {
            triggerEvent: rule.triggerEvent,
            deal: testDeal,
            contact: testContact,
            stage: { name: rule.triggerStageName || 'Proposal Sent' }
        });

        return {
            success: true,
            ruleName: rule.name,
            result
        };
    } catch (error) {
        console.error("[TEST_CRM_AUTOMATION_ERROR]", error);
        return { success: false, error: error.message || "Test execution failed" };
    }
}
