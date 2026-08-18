'use server';

import { revalidatePath } from 'next/cache';

// Mock in-memory/fallback database for FlowForge workflows & logs
let mockWorkflows = [
    {
        id: 'wf-1',
        name: 'WhatsApp Order Confirmation & Invoice',
        description: 'Triggered when a new order is placed in eCommerce, generates invoice and sends via KonnectX.',
        trigger: 'eCommerce Order Created',
        status: 'active',
        runs24h: 1420,
        successRate: '99.8%',
        lastRun: '2 mins ago',
        nodesCount: 5,
        updatedAt: new Date().toISOString()
    },
    {
        id: 'wf-2',
        name: 'AI Candidate Resume Screening',
        description: 'Ingests new applications from HireFlow, evaluates score with FlowGenix and tags stage.',
        trigger: 'HireFlow New Application',
        status: 'active',
        runs24h: 310,
        successRate: '98.5%',
        lastRun: '15 mins ago',
        nodesCount: 4,
        updatedAt: new Date().toISOString()
    },
    {
        id: 'wf-3',
        name: 'Lead Qualification & WhatsApp Welcome',
        description: 'Captures form submissions, scores intent using AI and dispatches personalized WhatsApp outreach.',
        trigger: 'Form Submission',
        status: 'active',
        runs24h: 890,
        successRate: '100%',
        lastRun: '4 mins ago',
        nodesCount: 6,
        updatedAt: new Date().toISOString()
    },
    {
        id: 'wf-4',
        name: 'Daily Metric Snapshot to Slack & Email',
        description: 'Aggregates sales and campaign KPIs at midnight and sends executive digest to leadership.',
        trigger: 'Cron Schedule (00:00 UTC)',
        status: 'paused',
        runs24h: 1,
        successRate: '100%',
        lastRun: '8 hours ago',
        nodesCount: 3,
        updatedAt: new Date().toISOString()
    }
];

let mockLogs = [
    { id: 'log-101', workflowId: 'wf-1', workflowName: 'WhatsApp Order Confirmation', trigger: 'eCommerce Order #892', status: 'Success', duration: '280ms', timestamp: '2 mins ago', error: null },
    { id: 'log-102', workflowId: 'wf-3', workflowName: 'Lead Qualification', trigger: 'Form Submission (Enterprise)', status: 'Success', duration: '410ms', timestamp: '4 mins ago', error: null },
    { id: 'log-103', workflowId: 'wf-2', workflowName: 'AI Resume Screening', trigger: 'Candidate: Jane Doe', status: 'Success', duration: '1.2s', timestamp: '15 mins ago', error: null },
    { id: 'log-104', workflowId: 'wf-1', workflowName: 'WhatsApp Order Confirmation', trigger: 'eCommerce Order #891', status: 'Failed', duration: '120ms', timestamp: '35 mins ago', error: 'WhatsApp rate limit exceeded. Auto-retrying.' }
];

export async function getWorkflows(workspaceId) {
    try {
        return { success: true, data: mockWorkflows };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function createWorkflow(workspaceId, data) {
    try {
        const newWorkflow = {
            id: `wf-${Date.now()}`,
            name: data.name || 'Untitled Workflow',
            description: data.description || 'Custom automated workflow',
            trigger: data.trigger || 'Webhook',
            status: 'active',
            runs24h: 0,
            successRate: '100%',
            lastRun: 'Just now',
            nodesCount: 3,
            updatedAt: new Date().toISOString()
        };
        mockWorkflows.unshift(newWorkflow);
        revalidatePath(`/workspace/${workspaceId}/flowforge`);
        return { success: true, data: newWorkflow };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function toggleWorkflowStatus(workspaceId, workflowId) {
    try {
        const wf = mockWorkflows.find(w => w.id === workflowId);
        if (wf) {
            wf.status = wf.status === 'active' ? 'paused' : 'active';
            revalidatePath(`/workspace/${workspaceId}/flowforge`);
            return { success: true, data: wf };
        }
        return { success: false, error: 'Workflow not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteWorkflow(workspaceId, workflowId) {
    try {
        mockWorkflows = mockWorkflows.filter(w => w.id !== workflowId);
        revalidatePath(`/workspace/${workspaceId}/flowforge`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

let mockWebhookTriggers = [
    {
        id: 'wh-101',
        name: 'Shopify / Stripe Inbound Orders',
        endpointSlug: 'shopify-orders-live',
        method: 'POST',
        authType: 'HMAC SHA-256',
        targetWorkflow: 'WhatsApp Order Confirmation & Invoice',
        status: 'active',
        totalEvents: 4120,
        lastFired: '3 mins ago'
    },
    {
        id: 'wh-102',
        name: 'Custom CRM Lead Webhook',
        endpointSlug: 'crm-leads-ingest',
        method: 'POST',
        authType: 'Bearer Token',
        targetWorkflow: 'Lead Qualification & WhatsApp Welcome',
        status: 'active',
        totalEvents: 890,
        lastFired: '12 mins ago'
    },
    {
        id: 'wh-103',
        name: 'GitHub Repository Push & Release Dispatch',
        endpointSlug: 'github-deploy-events',
        method: 'POST',
        authType: 'Secret Signature',
        targetWorkflow: 'Daily Metric Snapshot to Slack & Email',
        status: 'active',
        totalEvents: 142,
        lastFired: '1 hour ago'
    }
];

export async function getExecutionLogs(workspaceId) {
    try {
        return { success: true, data: mockLogs };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getWebhookTriggers(workspaceId) {
    try {
        return { success: true, data: mockWebhookTriggers };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function createWebhookTrigger(workspaceId, data) {
    try {
        const slug = data.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
        const newTrigger = {
            id: `wh-${Date.now()}`,
            name: data.name || 'Custom Inbound Webhook',
            endpointSlug: slug,
            method: data.method || 'POST',
            authType: data.authType || 'HMAC SHA-256',
            targetWorkflow: data.targetWorkflow || 'Generic Workflow',
            status: 'active',
            totalEvents: 0,
            lastFired: 'Never'
        };
        mockWebhookTriggers.unshift(newTrigger);
        revalidatePath(`/workspace/${workspaceId}/flowforge/triggers`);
        return { success: true, data: newTrigger };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function toggleWebhookTrigger(workspaceId, triggerId) {
    try {
        const trig = mockWebhookTriggers.find(t => t.id === triggerId);
        if (trig) {
            trig.status = trig.status === 'active' ? 'paused' : 'active';
            revalidatePath(`/workspace/${workspaceId}/flowforge/triggers`);
            return { success: true, data: trig };
        }
        return { success: false, error: 'Webhook trigger not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteWebhookTrigger(workspaceId, triggerId) {
    try {
        mockWebhookTriggers = mockWebhookTriggers.filter(t => t.id !== triggerId);
        revalidatePath(`/workspace/${workspaceId}/flowforge/triggers`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
