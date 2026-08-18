'use server';

import { revalidatePath } from 'next/cache';

let mockActivities = [
    { id: 'act-1', module: 'eCommerce', title: 'New Order Received', desc: 'Order #1094 for ₹34,500.00 from Alex Rivera', time: '4 mins ago', icon: 'ShoppingBag', color: 'text-amber-500', rawPayload: { orderId: 'ORD-1094', customer: 'Alex Rivera', amount: '₹34,500.00', items: 3, gateway: 'Razorpay UPI' } },
    { id: 'act-2', module: 'KonnectX', title: 'WhatsApp Broadcast Completed', desc: 'August VIP Campaign delivered to 4,200 recipients (98.4% delivery)', time: '18 mins ago', icon: 'MessageCircle', color: 'text-emerald-500', rawPayload: { campaign: 'August VIP Promo', sent: 4200, delivered: 4132, read: 3820, ctr: '38.2%' } },
    { id: 'act-3', module: 'HireFlow', title: 'Candidate Stage Advanced', desc: 'Elena Rostova moved to Technical Interview by HR Lead', time: '35 mins ago', icon: 'Users', color: 'text-sky-500', rawPayload: { candidate: 'Elena Rostova', role: 'Staff React Engineer', score: '94/100', interviewer: 'CTO' } },
    { id: 'act-4', module: 'FlowGenix', title: 'High Token Throughput', desc: 'Claude 3.5 Sonnet router processed 240k tokens in 1 hour', time: '1 hour ago', icon: 'Bot', color: 'text-purple-500', rawPayload: { model: 'Claude 3.5 Sonnet', tokens: 240000, latency: '420ms', estimatedCost: '₹180.00' } },
    { id: 'act-5', module: 'PayFlow', title: 'Invoice Auto-Settled', desc: 'Invoice INV-2026-089 (₹3,45,000.00) paid via Razorpay', time: '2 hours ago', icon: 'IndianRupee', color: 'text-emerald-500', rawPayload: { invoiceId: 'INV-2026-089', client: 'Acme Global Enterprises', amount: '₹3,45,000.00', method: 'UPI Auto-Debit' } }
];

let mockReports = [
    { id: 'rep-1', title: 'Q3 Executive Business Summary', frequency: 'Monthly', status: 'Ready', generatedAt: 'Aug 01, 2026', size: '2.4 MB PDF', summary: 'Comprehensive cross-workspace growth report covering ₹64.9L gross volume, 98.2% CSAT, and 1.84M AI token usage.' },
    { id: 'rep-2', title: 'Weekly WhatsApp Campaign ROI & Delivery', frequency: 'Weekly', status: 'Ready', generatedAt: 'Aug 14, 2026', size: '1.1 MB PDF', summary: 'Analysis of 42.8k WhatsApp messages with 96.2% verified delivery and ₹12.4L attributed eCommerce pipeline.' },
    { id: 'rep-3', title: 'FlowGenix AI Gateway Token Usage & Costs', frequency: 'On-Demand', status: 'Ready', generatedAt: 'Aug 17, 2026', size: '850 KB PDF', summary: 'Token breakdown across Claude 3.5 Sonnet, GPT-4o, and Gemini 1.5 Pro with cost per prompt analytics.' }
];

export async function getActivityStream(workspaceId) {
    try {
        return { success: true, data: mockActivities };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getReports(workspaceId) {
    try {
        return { success: true, data: mockReports };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function generateReport(workspaceId, data) {
    try {
        const title = typeof data === 'string' ? data : (data?.title || 'Executive Performance Digest');
        const newRep = {
            id: `rep-${Date.now()}`,
            title: title,
            frequency: data?.frequency || 'On-Demand',
            status: 'Ready',
            generatedAt: 'Just now',
            size: '1.8 MB PDF',
            summary: data?.notes || `Generated analytics digest for ${data?.timeframe || 'current period'} including eCommerce, DeskFlow, and PayFlow.`
        };
        mockReports.unshift(newRep);
        revalidatePath(`/workspace/${workspaceId}/metricpulse`);
        return { success: true, data: newRep };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
