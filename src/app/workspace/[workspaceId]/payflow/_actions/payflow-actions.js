'use server';

import { revalidatePath } from 'next/cache';

let mockInvoices = [
    {
        id: 'INV-2026-089',
        client: 'Acme Global Enterprises',
        clientEmail: 'billing@acmeglobal.com',
        amount: '₹3,45,000.00',
        date: 'Aug 16, 2026',
        dueDate: 'Aug 30, 2026',
        status: 'Paid',
        gateway: 'Razorpay Auto-Debit',
        currency: 'INR',
        taxRate: 18,
        notes: 'Thank you for your business. Remit payment via UPI or IMPS/NEFT bank transfer.',
        items: [
            { desc: 'Enterprise SaaS Platform License - Q3', qty: 1, rate: 290000 },
            { desc: 'Dedicated WhatsApp Cloud API High-Throughput Routing', qty: 1, rate: 55000 }
        ]
    },
    {
        id: 'INV-2026-088',
        client: 'Vertex Design Studio',
        clientEmail: 'accounts@vertexdesign.co',
        amount: '₹1,50,000.00',
        date: 'Aug 14, 2026',
        dueDate: 'Aug 28, 2026',
        status: 'Pending',
        gateway: 'Razorpay Smart Link',
        currency: 'INR',
        taxRate: 18,
        notes: 'Payment due within 14 days. Instant UPI and NetBanking supported.',
        items: [
            { desc: 'FlowGenix AI Gateway Custom Plan (2M Tokens)', qty: 1, rate: 150000 }
        ]
    },
    {
        id: 'INV-2026-087',
        client: 'Hyperion Logistics Ltd',
        clientEmail: 'finance@hyperion.com',
        amount: '₹5,25,000.00',
        date: 'Aug 10, 2026',
        dueDate: 'Aug 24, 2026',
        status: 'Overdue',
        gateway: 'WhatsApp Reminder Sent',
        currency: 'INR',
        taxRate: 18,
        notes: 'Late fee of 1.5% applies after due date.',
        items: [
            { desc: 'Full-Suite Workspace Setup & Custom ERP Integration', qty: 1, rate: 525000 }
        ]
    }
];

let mockSubscriptions = [
    { id: 'sub-1', client: 'Acme Global Enterprises', plan: 'Enterprise Growth Tier', amount: '₹95,000/mo', status: 'Active', nextBilling: 'Sep 01, 2026', gateway: 'Razorpay' },
    { id: 'sub-2', client: 'Vertex Design Studio', plan: 'Pro Business Tier', amount: '₹35,000/mo', status: 'Active', nextBilling: 'Sep 05, 2026', gateway: 'Razorpay' },
    { id: 'sub-3', client: 'Aura Analytics Inc', plan: 'Starter Workspace', amount: '₹7,999/mo', status: 'Active', nextBilling: 'Sep 12, 2026', gateway: 'Razorpay' },
    { id: 'sub-4', client: 'PixelCraft Agency', plan: 'Pro Business Tier', amount: '₹35,000/mo', status: 'Paused', nextBilling: 'Paused', gateway: 'Razorpay' }
];

let mockTransactions = [
    { id: 'txn-901', client: 'Acme Global Enterprises', amount: '₹3,45,000.00', status: 'Succeeded', method: 'Razorpay UPI (acme@oksbi)', date: 'Aug 16, 2026 10:14 AM' },
    { id: 'txn-900', client: 'Nexus Interactive Labs', amount: '₹1,85,000.00', status: 'Succeeded', method: 'HDFC NetBanking (Ref #98210)', date: 'Aug 05, 2026 04:30 PM' },
    { id: 'txn-899', client: 'Hyperion Logistics Ltd', amount: '₹5,25,000.00', status: 'Failed', method: 'ICICI Corporate Card •••• 8821', date: 'Aug 10, 2026 11:22 AM' }
];

let mockCustomers = [
    { id: 'cust-1', name: 'Acme Global Enterprises', email: 'billing@acmeglobal.com', phone: '+91 98201 22931', taxId: '27AAACA1234A1Z5', totalSpent: '₹18,50,000', invoicesCount: 6, status: 'Active Client' },
    { id: 'cust-2', name: 'Vertex Design Studio', email: 'accounts@vertexdesign.co', phone: '+91 98110 44829', taxId: '07BBBCD5678B1Z2', totalSpent: '₹6,20,000', invoicesCount: 4, status: 'Active Client' },
    { id: 'cust-3', name: 'Hyperion Logistics Ltd', email: 'finance@hyperion.com', phone: '+91 97230 11928', taxId: '24CCCCE9012C1Z8', totalSpent: '₹12,80,000', invoicesCount: 3, status: 'Payment Overdue' },
    { id: 'cust-4', name: 'Nexus Interactive Labs', email: 'contact@nexuslabs.dev', phone: '+91 99012 34567', taxId: '29DDDDF3456D1Z1', totalSpent: '₹4,90,000', invoicesCount: 2, status: 'Active Client' }
];

export async function getInvoices(workspaceId) {
    try {
        return { success: true, data: mockInvoices };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function createInvoice(workspaceId, data) {
    try {
        const items = data.items && data.items.length > 0 ? data.items : [
            { desc: data.itemDesc || 'Professional Service Retainer', qty: 1, rate: Number(data.amount || 10000) }
        ];
        const subtotal = items.reduce((acc, item) => acc + (Number(item.qty || 1) * Number(item.rate || 0)), 0);
        const taxRate = Number(data.taxRate || 0);
        const total = subtotal + (subtotal * (taxRate / 100));

        const newInvoice = {
            id: `INV-2026-${100 + mockInvoices.length + 1}`,
            client: data.client || 'Client Company',
            clientEmail: data.clientEmail || 'client@example.com',
            amount: `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
            dueDate: data.dueDate || 'In 14 Days',
            status: 'Pending',
            gateway: data.gateway || 'Razorpay Smart Link',
            currency: data.currency || 'INR',
            taxRate: taxRate,
            notes: data.notes || 'Thank you for your business. Please remit payment by the due date.',
            items: items
        };
        mockInvoices.unshift(newInvoice);
        revalidatePath(`/workspace/${workspaceId}/payflow`);
        return { success: true, data: newInvoice };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function markInvoiceStatus(workspaceId, invoiceId, status) {
    try {
        const inv = mockInvoices.find(i => i.id === invoiceId);
        if (inv) {
            inv.status = status;
            revalidatePath(`/workspace/${workspaceId}/payflow`);
            return { success: true, data: inv };
        }
        return { success: false, error: 'Invoice not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteInvoice(workspaceId, invoiceId) {
    try {
        mockInvoices = mockInvoices.filter(i => i.id !== invoiceId);
        revalidatePath(`/workspace/${workspaceId}/payflow`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function createSubscription(workspaceId, data) {
    try {
        const amt = Number(data.amount || 35000);
        const newSub = {
            id: `sub-${mockSubscriptions.length + 1}`,
            client: data.client || 'Client Account',
            plan: data.plan || 'Pro Business Tier',
            amount: `₹${amt.toLocaleString('en-IN')}/${data.interval || 'mo'}`,
            status: 'Active',
            nextBilling: 'Sep 01, 2026',
            gateway: data.gateway || 'Razorpay'
        };
        mockSubscriptions.unshift(newSub);
        revalidatePath(`/workspace/${workspaceId}/payflow`);
        return { success: true, data: newSub };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function toggleSubscriptionStatus(workspaceId, id) {
    try {
        const sub = mockSubscriptions.find(s => s.id === id);
        if (sub) {
            sub.status = sub.status === 'Active' ? 'Paused' : 'Active';
            revalidatePath(`/workspace/${workspaceId}/payflow`);
            return { success: true, data: sub };
        }
        return { success: false, error: 'Subscription not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getSubscriptions(workspaceId) {
    try {
        return { success: true, data: mockSubscriptions };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getPaymentTransactions(workspaceId) {
    try {
        return { success: true, data: mockTransactions };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function refundTransaction(workspaceId, txnId, reason) {
    try {
        const txn = mockTransactions.find(t => t.id === txnId);
        if (txn) {
            txn.status = 'Refunded';
            txn.refundReason = reason || 'Customer request';
            revalidatePath(`/workspace/${workspaceId}/payflow`);
            return { success: true, data: txn };
        }
        return { success: false, error: 'Transaction not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getCustomers(workspaceId) {
    try {
        return { success: true, data: mockCustomers };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function createCustomer(workspaceId, data) {
    try {
        const newCust = {
            id: `cust-${mockCustomers.length + 1}`,
            name: data.name || 'New Client Company',
            email: data.email || 'billing@example.com',
            phone: data.phone || '+91 98000 00000',
            taxId: data.taxId || 'GSTIN-PENDING',
            totalSpent: '₹0.00',
            invoicesCount: 0,
            status: 'Active Client'
        };
        mockCustomers.unshift(newCust);
        revalidatePath(`/workspace/${workspaceId}/payflow`);
        return { success: true, data: newCust };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
