'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from "@/lib/prisma";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { getValidUserId } from "./auth-helper";

// Default Preset Tasks per workspace
const DEFAULT_TASKS = [
    {
        id: 'task-101',
        title: 'Follow up on Enterprise Cloud Proposal',
        description: 'Send revised SLA terms and confirm payment milestone with Vikram Mehta.',
        type: 'WHATSAPP_FOLLOWUP',
        priority: 'URGENT',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // Today in 2 hours
        isCompleted: false,
        completedAt: null,
        dealId: 'deal-sample-1',
        dealTitle: 'Enterprise Cloud Migration & ERP Setup',
        contactId: 'contact-sample-1',
        contactName: 'Vikram Mehta',
        contactPhone: '+91 98201 22931',
        assignedTo: 'Amit Vishwakarma',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    {
        id: 'task-102',
        title: 'Schedule Technical Architecture Discovery Call',
        description: 'Deep dive call with Engineering Lead at Vertex Design Studio.',
        type: 'CALL',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(), // Today in 6 hours
        isCompleted: false,
        completedAt: null,
        dealId: 'deal-sample-2',
        dealTitle: 'FlowGenix AI Gateway Custom Plan',
        contactId: 'contact-sample-2',
        contactName: 'Sarah Connor',
        contactPhone: '+91 98110 44829',
        assignedTo: 'Sarah Jenkins',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
    },
    {
        id: 'task-103',
        title: 'Remit PayFlow Invoice Payment Reminder',
        description: 'Invoice INV-2026-087 is pending for Hyperion Logistics Ltd. Send 1-click payment link via WhatsApp.',
        type: 'PAYMENT_CHASE',
        priority: 'URGENT',
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // Overdue by 18 hours
        isCompleted: false,
        completedAt: null,
        dealId: 'deal-sample-3',
        dealTitle: 'Full-Suite ERP Integration',
        contactId: 'contact-sample-3',
        contactName: 'Rajesh Nair',
        contactPhone: '+91 97230 11928',
        assignedTo: 'Amit Vishwakarma',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
    },
    {
        id: 'task-104',
        title: 'Quarterly Executive Review Meeting',
        description: 'Review account metrics and platform expansion opportunities.',
        type: 'MEETING',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // In 2 days
        isCompleted: false,
        completedAt: null,
        dealId: null,
        dealTitle: null,
        contactId: 'contact-sample-1',
        contactName: 'Vikram Mehta',
        contactPhone: '+91 98201 22931',
        assignedTo: 'Amit Vishwakarma',
        createdAt: new Date().toISOString()
    },
    {
        id: 'task-105',
        title: 'Send WhatsApp Welcome & Case Study',
        description: 'Welcome newly onboarded lead from Inbound campaign.',
        type: 'WHATSAPP_FOLLOWUP',
        priority: 'LOW',
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        isCompleted: true,
        completedAt: new Date().toISOString(),
        dealId: null,
        dealTitle: null,
        contactId: 'contact-sample-4',
        contactName: 'Priya Sharma',
        contactPhone: '+91 99012 34567',
        assignedTo: 'Priya Patel',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString()
    }
];

let globalWorkspaceTasks = {};

function getWorkspaceTasks(workspaceId) {
    if (!globalWorkspaceTasks[workspaceId]) {
        globalWorkspaceTasks[workspaceId] = JSON.parse(JSON.stringify(DEFAULT_TASKS));
    }
    return globalWorkspaceTasks[workspaceId];
}

/**
 * Get all Tasks for a workspace with filters
 */
export async function getCrmTasksAction(workspaceId, filters = {}) {
    try {
        await ensureWorkspaceAccess(workspaceId);
        const { status = 'ALL', type, priority, dealId, contactId } = filters;

        let tasks = getWorkspaceTasks(workspaceId);

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        // Filter by Status
        if (status === 'PENDING') {
            tasks = tasks.filter(t => !t.isCompleted);
        } else if (status === 'COMPLETED') {
            tasks = tasks.filter(t => t.isCompleted);
        } else if (status === 'TODAY') {
            tasks = tasks.filter(t => {
                if (t.isCompleted) return false;
                const d = new Date(t.dueDate);
                return d >= startOfToday && d <= endOfToday;
            });
        } else if (status === 'OVERDUE') {
            tasks = tasks.filter(t => {
                if (t.isCompleted) return false;
                const d = new Date(t.dueDate);
                return d < now;
            });
        }

        // Filter by Type
        if (type && type !== 'ALL') {
            tasks = tasks.filter(t => t.type === type);
        }

        // Filter by Priority
        if (priority && priority !== 'ALL') {
            tasks = tasks.filter(t => t.priority === priority);
        }

        // Filter by Deal
        if (dealId) {
            tasks = tasks.filter(t => t.dealId === dealId);
        }

        // Filter by Contact
        if (contactId) {
            tasks = tasks.filter(t => t.contactId === contactId);
        }

        // Sort: Overdue & Urgent first, then by Due Date
        tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        return { success: true, data: tasks };
    } catch (error) {
        console.error("[GET_CRM_TASKS_ERROR]", error);
        return { success: false, error: error.message || "Failed to load tasks" };
    }
}

/**
 * Create a new Follow-up Task
 */
export async function createCrmTaskAction(workspaceId, data) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        const {
            title,
            description = '',
            type = 'WHATSAPP_FOLLOWUP',
            priority = 'MEDIUM',
            dueDate,
            dealId,
            contactId,
            assignedTo = 'Amit Vishwakarma'
        } = data;

        if (!title?.trim()) {
            return { success: false, error: "Task title is required" };
        }

        let contactName = '';
        let contactPhone = '';
        let dealTitle = '';

        if (contactId) {
            const contact = await prisma.contact.findUnique({ where: { id: contactId } });
            if (contact) {
                contactName = contact.name;
                contactPhone = contact.phone;
            }
        }

        if (dealId) {
            const deal = await prisma.deal.findUnique({ where: { id: dealId } });
            if (deal) {
                dealTitle = deal.title;
            }
        }

        const tasks = getWorkspaceTasks(workspaceId);
        const newTask = {
            id: `task-${Date.now()}`,
            title: title.trim(),
            description: description.trim(),
            type,
            priority,
            dueDate: dueDate || new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
            isCompleted: false,
            completedAt: null,
            dealId: dealId || null,
            dealTitle: dealTitle || null,
            contactId: contactId || null,
            contactName: contactName || null,
            contactPhone: contactPhone || null,
            assignedTo,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask);

        // Record Activity Timeline
        await prisma.crmActivity.create({
            data: {
                workspaceId,
                userId,
                dealId: dealId || null,
                contactId: contactId || null,
                type: "TASK",
                title: `Task Scheduled: ${newTask.title}`,
                description: `Due: ${new Date(newTask.dueDate).toLocaleString()} | Priority: ${priority}`,
                metadata: { taskId: newTask.id, type, priority }
            }
        });

        revalidatePath(`/workspace/${workspaceId}/crm/tasks`);
        return { success: true, data: newTask };
    } catch (error) {
        console.error("[CREATE_CRM_TASK_ERROR]", error);
        return { success: false, error: error.message || "Failed to create task" };
    }
}

/**
 * Toggle Task Status (Complete / Incomplete)
 */
export async function updateCrmTaskStatusAction(workspaceId, taskId, isCompleted) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = await getValidUserId(workspaceId, session);

        const tasks = getWorkspaceTasks(workspaceId);
        const task = tasks.find(t => t.id === taskId);

        if (!task) {
            return { success: false, error: "Task not found" };
        }

        task.isCompleted = isCompleted;
        task.completedAt = isCompleted ? new Date().toISOString() : null;

        if (isCompleted) {
            await prisma.crmActivity.create({
                data: {
                    workspaceId,
                    userId,
                    dealId: task.dealId || null,
                    contactId: task.contactId || null,
                    type: "NOTE",
                    title: `Task Completed: ${task.title}`,
                    description: `Marked completed by user.`
                }
            });
        }

        revalidatePath(`/workspace/${workspaceId}/crm/tasks`);
        return { success: true, data: task };
    } catch (error) {
        console.error("[UPDATE_CRM_TASK_STATUS_ERROR]", error);
        return { success: false, error: error.message || "Failed to update task" };
    }
}

/**
 * Delete a Task
 */
export async function deleteCrmTaskAction(workspaceId, taskId) {
    try {
        await ensureWorkspaceAccess(workspaceId);
        let tasks = getWorkspaceTasks(workspaceId);
        globalWorkspaceTasks[workspaceId] = tasks.filter(t => t.id !== taskId);
        revalidatePath(`/workspace/${workspaceId}/crm/tasks`);
        return { success: true };
    } catch (error) {
        console.error("[DELETE_CRM_TASK_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete task" };
    }
}
