const DEFAULT_RULES = [
    {
        id: 'rule-wf-1',
        name: 'Auto WhatsApp Proposal & Brochure',
        description: 'When a deal enters "Proposal Sent", send a personalized WhatsApp message with proposal and brochure links.',
        category: 'Outreach & Messaging',
        triggerEvent: 'DEAL_STAGE_CHANGED',
        triggerStageName: 'Proposal Sent',
        isActive: true,
        conditions: { requirePhone: true, minValue: 0 },
        actions: [
            { id: 'act-1-1', type: 'KONNECT_X_WHATSAPP', name: 'Send WhatsApp Proposal Dispatch', module: 'KonnectX', color: 'emerald', config: { includePdf: true } },
            { id: 'act-1-2', type: 'CRM_TIMELINE_LOG', name: 'Log WhatsApp Outreach', module: 'CRM Core', color: 'blue', config: { activityType: 'WHATSAPP_MSG', title: 'Automated WhatsApp Proposal Dispatched' } }
        ],
        stats: { totalRuns: 148, successRate: '100%', lastRun: '12 mins ago' },
        createdAt: new Date().toISOString()
    },
    {
        id: 'rule-wf-2',
        name: 'Auto-Generate PayFlow Invoice on Closed Won',
        description: 'When a deal is marked "Closed Won", draft an invoice in PayFlow and notify the client.',
        category: 'Finance & Invoicing',
        triggerEvent: 'DEAL_WON',
        isActive: true,
        conditions: { minValue: 1000 },
        actions: [
            { id: 'act-2-1', type: 'PAYFLOW_INVOICE', name: 'Create Draft PayFlow Invoice', module: 'PayFlow', color: 'blue', config: { taxRate: 18, dueDays: 14 } },
            { id: 'act-2-2', type: 'KONNECT_X_WHATSAPP', name: 'Send Invoice Notification', module: 'KonnectX', color: 'emerald', config: {} },
            { id: 'act-2-3', type: 'CRM_TIMELINE_LOG', name: 'Log Won & Invoicing Audit Event', module: 'CRM Core', color: 'purple', config: { activityType: 'INVOICE_GENERATED', title: 'Automated PayFlow Invoice Created' } }
        ],
        stats: { totalRuns: 89, successRate: '98.9%', lastRun: '1 hour ago' },
        createdAt: new Date().toISOString()
    },
    {
        id: 'rule-wf-3',
        name: 'Instant Lead Qualification & Welcome Drip',
        description: 'When a new lead is added, score intent and dispatch a WhatsApp onboarding greeting.',
        category: 'Lead Capture',
        triggerEvent: 'LEAD_CREATED',
        isActive: true,
        conditions: { requirePhone: true },
        actions: [
            { id: 'act-3-1', type: 'KONNECT_X_WHATSAPP', name: 'Send Instant WhatsApp Welcome', module: 'KonnectX', color: 'emerald', config: {} },
            { id: 'act-3-2', type: 'FLOWGENIX_AI_SCORE', name: 'FlowGenix AI Lead Scoring', module: 'FlowGenix', color: 'indigo', config: { autoTag: true, assignOwner: true } }
        ],
        stats: { totalRuns: 312, successRate: '100%', lastRun: '4 mins ago' },
        createdAt: new Date().toISOString()
    },
    {
        id: 'rule-wf-4',
        name: 'HireFlow Placement to Closed Deal Sync',
        description: 'When a candidate is hired in HireFlow, create a won CRM deal and notify account managers.',
        category: 'Talent & ATS',
        triggerEvent: 'CANDIDATE_PLACED',
        isActive: true,
        conditions: {},
        actions: [
            { id: 'act-4-1', type: 'CRM_CREATE_DEAL', name: 'Create Closed Won Placement Deal', module: 'CRM Core', color: 'violet', config: { pipeline: 'Default Pipeline', stage: 'Closed Won' } },
            { id: 'act-4-2', type: 'CRM_TIMELINE_LOG', name: 'Log ATS Candidate Placement', module: 'CRM Core', color: 'emerald', config: { activityType: 'ATS_INTERVIEW', title: 'Candidate Placed - Deal Generated' } }
        ],
        stats: { totalRuns: 45, successRate: '100%', lastRun: '2 days ago' },
        createdAt: new Date().toISOString()
    },
    {
        id: 'rule-wf-5',
        name: 'FlowGenix Risk Alert & Stalled Deal Recovery',
        description: 'When AI flags a deal as at risk, alert the owner and schedule a high-priority task.',
        category: 'Risk Management',
        triggerEvent: 'DEAL_RISK_FLAGGED',
        isActive: true,
        conditions: {},
        actions: [
            { id: 'act-5-1', type: 'CRM_TIMELINE_LOG', name: 'Create Urgent Re-engagement Task', module: 'CRM Core', color: 'rose', config: { activityType: 'TASK', title: 'Urgent: High-Value Deal Stalled' } },
            { id: 'act-5-2', type: 'WEBHOOK_DISPATCH', name: 'FlowForge Outbound Webhook Alert', module: 'FlowForge', color: 'amber', config: { method: 'POST' } }
        ],
        stats: { totalRuns: 63, successRate: '97.5%', lastRun: '3 hours ago' },
        createdAt: new Date().toISOString()
    }
];

const DEFAULT_LOGS = [
    { id: 'log-crm-101', ruleId: 'rule-wf-1', ruleName: 'Auto WhatsApp Proposal & Brochure', triggerEvent: 'DEAL_STAGE_CHANGED', targetEntity: 'Enterprise Cloud Migration (Acme Global)', status: 'SUCCESS', durationMs: 310, executedNodes: ['Send WhatsApp Proposal Dispatch', 'Log WhatsApp Outreach'], timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), payload: { dealTitle: 'Enterprise Cloud Migration', dealValue: '₹4,50,000' } },
    { id: 'log-crm-102', ruleId: 'rule-wf-2', ruleName: 'Auto-Generate PayFlow Invoice on Closed Won', triggerEvent: 'DEAL_WON', targetEntity: 'Design System Retainer (Vertex Design)', status: 'SUCCESS', durationMs: 460, executedNodes: ['Create Draft PayFlow Invoice', 'Send Invoice Notification', 'Log Won & Invoicing Audit Event'], timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(), payload: { dealTitle: 'Design System Retainer', invoiceId: 'INV-2026-092' } },
    { id: 'log-crm-103', ruleId: 'rule-wf-3', ruleName: 'Instant Lead Qualification & Welcome Drip', triggerEvent: 'LEAD_CREATED', targetEntity: 'Priya Sharma (TechFlow Corp)', status: 'SUCCESS', durationMs: 240, executedNodes: ['Send Instant WhatsApp Welcome', 'FlowGenix AI Lead Scoring'], timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(), payload: { leadName: 'Priya Sharma', aiIntentScore: 'HIGH (88/100)' } }
];

const rulesByWorkspace = {};
const logsByWorkspace = {};

export function getRules(workspaceId) {
    if (!rulesByWorkspace[workspaceId]) {
        rulesByWorkspace[workspaceId] = JSON.parse(JSON.stringify(DEFAULT_RULES));
    }
    return rulesByWorkspace[workspaceId];
}

export function getLogs(workspaceId) {
    if (!logsByWorkspace[workspaceId]) {
        logsByWorkspace[workspaceId] = JSON.parse(JSON.stringify(DEFAULT_LOGS));
    }
    return logsByWorkspace[workspaceId];
}

export function toggleRule(workspaceId, ruleId) {
    const rule = getRules(workspaceId).find((r) => r.id === ruleId);
    if (!rule) return null;
    rule.isActive = !rule.isActive;
    return rule;
}

export function deleteRule(workspaceId, ruleId) {
    rulesByWorkspace[workspaceId] = getRules(workspaceId).filter((r) => r.id !== ruleId);
    return true;
}

export function createRule(workspaceId, ruleData = {}) {
    const rule = {
        id: `rule-wf-${Date.now()}`,
        name: ruleData.name || 'Untitled Automation Flow',
        description: ruleData.description || 'Automated CRM cross-module workflow',
        category: ruleData.category || 'General Automation',
        triggerEvent: ruleData.triggerEvent || 'DEAL_STAGE_CHANGED',
        triggerStageName: ruleData.triggerStageName || '',
        isActive: true,
        conditions: ruleData.conditions || {},
        actions: ruleData.actions || [
            { id: `act-${Date.now()}`, type: 'CRM_TIMELINE_LOG', name: 'Log Automation Event', module: 'CRM Core', color: 'blue', config: { title: 'Workflow Executed' } }
        ],
        stats: { totalRuns: 0, successRate: '100%', lastRun: 'Never' },
        createdAt: new Date().toISOString()
    };
    getRules(workspaceId).unshift(rule);
    return rule;
}

export function testRule(workspaceId, ruleId) {
    const rule = getRules(workspaceId).find((r) => r.id === ruleId);
    if (!rule) return null;

    rule.stats.totalRuns += 1;
    rule.stats.lastRun = 'Just now';

    const log = {
        id: `log-crm-${Date.now()}`,
        ruleId: rule.id,
        ruleName: rule.name,
        triggerEvent: rule.triggerEvent,
        targetEntity: 'Manual Test Run',
        status: 'SUCCESS',
        durationMs: 120 + Math.floor(Math.random() * 300),
        executedNodes: rule.actions.map((a) => a.name),
        timestamp: new Date().toISOString(),
        payload: { test: true }
    };
    getLogs(workspaceId).unshift(log);
    return { rule, log };
}
