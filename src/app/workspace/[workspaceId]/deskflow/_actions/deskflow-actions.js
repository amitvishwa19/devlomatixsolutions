'use server';

import { revalidatePath } from 'next/cache';

let mockTickets = [
    {
        id: 'TICK-1082',
        subject: 'Unable to complete checkout on international credit card',
        customer: 'Alex Rivera',
        email: 'alex.rivera@example.com',
        channel: 'WhatsApp',
        priority: 'Urgent',
        status: 'Open',
        assignedTo: 'Sarah Jenkins',
        sla: '22 mins remaining',
        lastReply: '3 mins ago',
        messages: [
            { sender: 'Alex Rivera', role: 'customer', text: 'Hi! I am trying to checkout with my Visa card from UK but getting 3DS verification failed error.', time: '10:14 AM' },
            { sender: 'Sarah Jenkins', role: 'agent', text: 'Hello Alex! Let me check the gateway logs right now for you.', time: '10:17 AM' }
        ]
    },
    {
        id: 'TICK-1081',
        subject: 'Inquiry regarding enterprise API rate limits for FlowGenix',
        customer: 'David Chen',
        email: 'd.chen@techcorp.io',
        channel: 'Email',
        priority: 'High',
        status: 'In Progress',
        assignedTo: 'AI Assistant (FlowGenix)',
        sla: 'SLA Met',
        lastReply: '12 mins ago',
        messages: [
            { sender: 'David Chen', role: 'customer', text: 'We are planning to route ~500k daily tokens through FlowGenix. What are the concurrency tiers?', time: '09:40 AM' },
            { sender: 'AI Assistant', role: 'agent', text: 'Enterprise tier supports unlimited concurrent LLM streams with custom failover routing.', time: '09:41 AM' }
        ]
    },
    {
        id: 'TICK-1080',
        subject: 'Requesting VAT invoice and billing currency change to EUR',
        customer: 'Elena Rostova',
        email: 'elena@rostova.de',
        channel: 'Live Chat',
        priority: 'Medium',
        status: 'Open',
        assignedTo: 'Unassigned',
        sla: '45 mins remaining',
        lastReply: '24 mins ago',
        messages: [
            { sender: 'Elena Rostova', role: 'customer', text: 'Can we get invoices issued with German VAT ID DE123456789?', time: '08:50 AM' }
        ]
    },
    {
        id: 'TICK-1079',
        subject: 'How to setup automated WhatsApp campaign schedules?',
        customer: 'Rajesh Sharma',
        email: 'rajesh@growthstudio.in',
        channel: 'WhatsApp',
        priority: 'Low',
        status: 'Resolved',
        assignedTo: 'Vikram Mehta',
        sla: 'Resolved in 6m',
        lastReply: '1 hour ago',
        messages: [
            { sender: 'Rajesh Sharma', role: 'customer', text: 'Where do I configure cron timing for my WhatsApp template broadcasts?', time: '07:30 AM' },
            { sender: 'Vikram Mehta', role: 'agent', text: 'You can go to KonnectX > Campaigns > Schedule Broadcast.', time: '07:36 AM' }
        ]
    }
];

let mockAgents = [
    { id: 'ag-1', name: 'Sarah Jenkins', email: 'sarah@devlomatix.com', role: 'Senior Support Lead', status: 'online', activeTickets: 4, rating: '4.9/5' },
    { id: 'ag-2', name: 'Vikram Mehta', email: 'vikram@devlomatix.com', role: 'WhatsApp Specialist', status: 'online', activeTickets: 3, rating: '4.8/5' },
    { id: 'ag-3', name: 'AI Copilot (FlowGenix)', email: 'ai-bot@devlomatix.com', role: 'Automated Responder', status: 'online', activeTickets: 12, rating: '4.7/5' },
    { id: 'ag-4', name: 'Marcus Vance', email: 'marcus@devlomatix.com', role: 'Billing Specialist', status: 'offline', activeTickets: 1, rating: '5.0/5' }
];

let mockCannedResponses = [
    { id: 'cr-1', shortcut: '!welcome', title: 'Standard Welcome Greeting', category: 'General', text: 'Hello! Thank you for reaching out to Devlomatix Support. How may I assist you today?' },
    { id: 'cr-2', shortcut: '!invoice', title: 'Invoice Download Link', category: 'Billing', text: 'You can view and download all your past tax invoices anytime from your workspace PayFlow > Invoices tab.' },
    { id: 'cr-3', shortcut: '!whatsapp-auth', title: 'WhatsApp Meta Credentials Help', category: 'Technical', text: 'Please ensure your Meta System User Token has the `whatsapp_business_messaging` permission enabled in Meta Business Manager.' }
];

export async function getTickets(workspaceId) {
    try {
        return { success: true, data: mockTickets };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function createTicket(workspaceId, data) {
    try {
        const newTicket = {
            id: `TICK-${1080 + mockTickets.length + 1}`,
            subject: data.subject || 'Support Ticket',
            customer: data.customer || 'Customer',
            email: data.email || 'customer@example.com',
            channel: data.channel || 'WhatsApp',
            priority: data.priority || 'Medium',
            status: 'Open',
            assignedTo: data.assignedTo || 'Unassigned',
            sla: '60 mins remaining',
            lastReply: 'Just now',
            messages: [
                { sender: data.customer || 'Customer', role: 'customer', text: data.message || data.subject, time: 'Just now' }
            ]
        };
        mockTickets.unshift(newTicket);
        revalidatePath(`/workspace/${workspaceId}/deskflow`);
        return { success: true, data: newTicket };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function updateTicketStatus(workspaceId, ticketId, status) {
    try {
        const t = mockTickets.find(ticket => ticket.id === ticketId);
        if (t) {
            t.status = status;
            revalidatePath(`/workspace/${workspaceId}/deskflow`);
            return { success: true, data: t };
        }
        return { success: false, error: 'Ticket not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function sendTicketReply(workspaceId, ticketId, messageText, senderName = 'Agent') {
    try {
        const t = mockTickets.find(ticket => ticket.id === ticketId);
        if (t) {
            t.messages.push({
                sender: senderName,
                role: 'agent',
                text: messageText,
                time: 'Just now'
            });
            t.lastReply = 'Just now';
            revalidatePath(`/workspace/${workspaceId}/deskflow`);
            return { success: true, data: t };
        }
        return { success: false, error: 'Ticket not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getAgents(workspaceId) {
    try {
        return { success: true, data: mockAgents };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getCannedResponses(workspaceId) {
    try {
        return { success: true, data: mockCannedResponses };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function saveCannedResponse(workspaceId, data) {
    try {
        const newCR = {
            id: `cr-${Date.now()}`,
            shortcut: data.shortcut.startsWith('!') ? data.shortcut : `!${data.shortcut}`,
            title: data.title,
            category: data.category || 'General',
            text: data.text
        };
        mockCannedResponses.push(newCR);
        revalidatePath(`/workspace/${workspaceId}/deskflow`);
        return { success: true, data: newCR };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function createAgent(workspaceId, data) {
    try {
        const newAgent = {
            id: `ag-${Date.now()}`,
            name: data.name || 'New Support Rep',
            email: data.email || 'agent@devlomatix.com',
            role: data.role || 'Support Representative',
            status: 'online',
            activeTickets: 0,
            rating: '5.0/5'
        };
        mockAgents.push(newAgent);
        revalidatePath(`/workspace/${workspaceId}/deskflow`);
        return { success: true, data: newAgent };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteCannedResponse(workspaceId, id) {
    try {
        mockCannedResponses = mockCannedResponses.filter(c => c.id !== id);
        revalidatePath(`/workspace/${workspaceId}/deskflow`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
