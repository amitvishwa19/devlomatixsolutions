'use server'

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";

import { revalidatePath } from "next/cache";

/**
 * Fetch kanban columns and tasks scoped to workspace
 */
export async function getKanbanDataAction(workspaceId) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return { success: false, error: "Unauthorized" };
        }

        const userId = session.user.userId || session.user.id;
        if (!userId) {
            return { success: false, error: "User ID not found in session" };
        }

        let columns = await db.kanbanColumn.findMany({
            where: { workspaceId },
            orderBy: { order: 'asc' },
            include: {
                tasks: {
                    include: {
                        assignee: {
                            select: {
                                id: true,
                                displayName: true,
                                avatar: true,
                                email: true,
                            }
                        },
                        checklists: {
                            orderBy: { order: 'asc' }
                        },
                        activities: {
                            orderBy: { createdAt: 'desc' },
                            take: 10,
                            include: {
                                user: {
                                    select: {
                                        displayName: true,
                                        avatar: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });

        // If workspace has no Kanban columns yet, auto-seed default stages & sample tasks
        if (columns.length === 0) {
            const defaultStages = [
                { title: 'To Do', order: 0 },
                { title: 'In Progress', order: 1 },
                { title: 'Review', order: 2 },
                { title: 'Done', order: 3 }
            ];

            const createdCols = [];
            for (const stage of defaultStages) {
                const col = await db.kanbanColumn.create({
                    data: {
                        title: stage.title,
                        order: stage.order,
                        workspaceId,
                        userId
                    }
                });
                createdCols.push(col);
            }

            const todoCol = createdCols[0];
            const inProgressCol = createdCols[1];
            const reviewCol = createdCols[2];
            const doneCol = createdCols[3];

            if (todoCol) {
                await db.kanbanTask.create({
                    data: {
                        title: 'Follow up on Enterprise Cloud Proposal',
                        content: 'Send revised SLA terms and confirm payment milestone with Vikram Mehta.',
                        type: 'task',
                        priority: 'urgent',
                        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2),
                        order: 0,
                        columnId: todoCol.id,
                        workspaceId,
                        userId,
                        checklists: {
                            create: [
                                { title: 'Review custom SLA with legal', completed: true, order: 0 },
                                { title: 'Send revised quotation PDF via email', completed: false, order: 1 },
                                { title: 'Confirm payment terms', completed: false, order: 2 }
                            ]
                        }
                    }
                });
                await db.kanbanTask.create({
                    data: {
                        title: 'Schedule Technical Architecture Discovery Call',
                        content: 'Deep dive call with Engineering Lead at Vertex Design Studio.',
                        type: 'task',
                        priority: 'high',
                        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 6),
                        order: 1,
                        columnId: todoCol.id,
                        workspaceId,
                        userId
                    }
                });
            }

            if (inProgressCol) {
                await db.kanbanTask.create({
                    data: {
                        title: 'Remit PayFlow Invoice Payment Reminder',
                        content: 'Invoice INV-2026-087 is pending for Hyperion Logistics Ltd. Send 1-click payment link via WhatsApp.',
                        type: 'task',
                        priority: 'urgent',
                        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 18),
                        order: 0,
                        columnId: inProgressCol.id,
                        workspaceId,
                        userId,
                        checklists: {
                            create: [
                                { title: 'Generate invoice summary', completed: true, order: 0 },
                                { title: 'Dispatch WhatsApp payment link', completed: false, order: 1 }
                            ]
                        }
                    }
                });
            }

            if (reviewCol) {
                await db.kanbanTask.create({
                    data: {
                        title: 'Quarterly Executive Review Meeting',
                        content: 'Review account metrics and platform expansion opportunities.',
                        type: 'task',
                        priority: 'medium',
                        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48),
                        order: 0,
                        columnId: reviewCol.id,
                        workspaceId,
                        userId
                    }
                });
            }

            if (doneCol) {
                await db.kanbanTask.create({
                    data: {
                        title: 'Send WhatsApp Welcome & Case Study',
                        content: 'Welcome newly onboarded lead from Inbound campaign.',
                        type: 'task',
                        priority: 'low',
                        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 2),
                        order: 0,
                        columnId: doneCol.id,
                        workspaceId,
                        userId
                    }
                });
            }

            // Fetch newly seeded columns and tasks
            columns = await db.kanbanColumn.findMany({
                where: { workspaceId },
                orderBy: { order: 'asc' },
                include: {
                    tasks: {
                        include: {
                            assignee: {
                                select: {
                                    id: true,
                                    displayName: true,
                                    avatar: true,
                                    email: true,
                                }
                            },
                            checklists: {
                                orderBy: { order: 'asc' }
                            },
                            activities: {
                                orderBy: { createdAt: 'desc' },
                                take: 10,
                                include: {
                                    user: {
                                        select: {
                                            displayName: true,
                                            avatar: true
                                        }
                                    }
                                }
                            }
                        },
                        orderBy: {
                            order: 'asc'
                        }
                    }
                }
            });
        }

        return { success: true, columns };
    } catch (error) {
        console.error("getKanbanDataAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Create a new kanban column with userId and workspaceId
 */
export async function createKanbanColumnAction(workspaceId, title, order) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { success: false, error: "Unauthorized" };

        const userId = session.user.userId || session.user.id;
        if (!userId) return { success: false, error: "User ID not found" };

        const maxOrder = await db.kanbanColumn.findFirst({
            where: { workspaceId },
            orderBy: { order: 'desc' },
            select: { order: true }
        });

        const column = await db.kanbanColumn.create({
            data: {
                title,
                workspaceId,
                userId,
                order: order ?? (maxOrder ? maxOrder.order + 1 : 0)
            }
        });

        return { success: true, column };
    } catch (error) {
        console.error("createKanbanColumnAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Update an existing kanban column title or order
 */
export async function updateKanbanColumnAction(columnId, title, order) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { success: false, error: "Unauthorized" };

        const updatedData = {};
        if (title !== undefined) updatedData.title = title;
        if (order !== undefined) updatedData.order = order;

        const column = await db.kanbanColumn.update({
            where: { id: columnId },
            data: updatedData
        });

        return { success: true, column };
    } catch (error) {
        console.error("updateKanbanColumnAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a kanban column
 */
export async function deleteKanbanColumnAction(columnId) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { success: false, error: "Unauthorized" };

        await db.kanbanColumn.delete({
            where: { id: columnId }
        });

        return { success: true };
    } catch (error) {
        console.error("deleteKanbanColumnAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Create a new kanban task with userId and workspaceId
 */
export async function createKanbanTaskAction(workspaceId, taskData) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { success: false, error: "Unauthorized" };

        const userId = session.user.userId || session.user.id;
        if (!userId) return { success: false, error: "User ID not found" };

        const { title, content, type, priority, dueDate, columnId, coverUrl, assigneeId, checklists } = taskData;

        const maxOrder = await db.kanbanTask.findFirst({
            where: { columnId },
            orderBy: { order: 'desc' },
            select: { order: true },
        });

        const task = await db.kanbanTask.create({
            data: {
                title,
                content: content || null,
                type: type || 'task',
                priority: priority || 'medium',
                dueDate: dueDate ? new Date(dueDate) : null,
                order: maxOrder ? maxOrder.order + 1 : 0,
                columnId,
                workspaceId,
                userId,
                assigneeId: assigneeId || null,
                coverUrl: coverUrl || null,
                checklists: checklists?.length
                    ? { create: checklists.map((item, idx) => ({ title: typeof item === 'string' ? item : item.title, completed: !!item.completed, order: idx })) }
                    : undefined,
            },
            include: {
                assignee: { select: { id: true, displayName: true, email: true, avatar: true } },
                checklists: { orderBy: { order: 'asc' } },
            },
        });

        await db.kanbanActivity.create({
            data: {
                type: 'created',
                description: `Created task "${title}"`,
                taskId: task.id,
                userId,
            },
        });

        // Sync with CRM Activity Feed
        try {
            await db.crmActivity.create({
                data: {
                    workspaceId,
                    userId,
                    type: "TASK",
                    title: `Task Scheduled: ${title}`,
                    description: `Priority: ${priority || 'medium'} | Type: ${type || 'task'}`,
                    metadata: { taskId: task.id, type, priority }
                }
            });
        } catch (crmErr) {
            console.warn("[CRM_ACTIVITY_KANBAN_CREATE_LOG_IGNORED]", crmErr?.message);
        }

        revalidatePath(`/workspace/${workspaceId}/productivity/kanban`);
        revalidatePath(`/workspace/${workspaceId}/crm/tasks`);

        return { success: true, task };
    } catch (error) {
        console.error("createKanbanTaskAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Update an existing kanban task
 */
export async function updateKanbanTaskAction(taskId, taskData) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { success: false, error: "Unauthorized" };

        const userId = session.user.userId || session.user.id;
        const { title, content, type, priority, dueDate, columnId, coverUrl, assigneeId, checklists } = taskData;

        // Delete existing checklists if new checklists are provided
        if (checklists !== undefined) {
            await db.kanbanChecklist.deleteMany({ where: { taskId } });
        }

        const task = await db.kanbanTask.update({
            where: { id: taskId },
            data: {
                title: title !== undefined ? title : undefined,
                content: content !== undefined ? content : undefined,
                type: type !== undefined ? type : undefined,
                priority: priority !== undefined ? priority : undefined,
                dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
                columnId: columnId !== undefined ? columnId : undefined,
                coverUrl: coverUrl !== undefined ? coverUrl : undefined,
                assigneeId: assigneeId !== undefined ? (assigneeId || null) : undefined,
                checklists: checklists?.length
                    ? { create: checklists.map((item, idx) => ({ title: typeof item === 'string' ? item : item.title, completed: !!item.completed, order: idx })) }
                    : undefined,
            },
            include: {
                assignee: { select: { id: true, displayName: true, email: true, avatar: true } },
                checklists: { orderBy: { order: 'asc' } },
            },
        });

        if (userId) {
            await db.kanbanActivity.create({
                data: {
                    type: 'updated',
                    description: `Updated task "${task.title}"`,
                    taskId: task.id,
                    userId,
                },
            });
        }

        revalidatePath(`/workspace/${task.workspaceId}/productivity/kanban`);
        revalidatePath(`/workspace/${task.workspaceId}/crm/tasks`);

        return { success: true, task };
    } catch (error) {
        console.error("updateKanbanTaskAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Update task column and position order (drag and drop)
 */
export async function updateTaskOrderAction(taskId, columnId, order) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { success: false, error: "Unauthorized" };

        const userId = session.user.userId || session.user.id;

        const updatedTask = await db.kanbanTask.update({
            where: { id: taskId },
            data: {
                columnId,
                order
            },
            include: {
                column: { select: { title: true } }
            }
        });

        // Sync with CRM Activity if task is moved to a completion stage
        try {
            const colTitle = updatedTask.column?.title?.toLowerCase() || '';
            if (colTitle.includes('done') || colTitle.includes('complete')) {
                await db.crmActivity.create({
                    data: {
                        workspaceId: updatedTask.workspaceId,
                        userId,
                        type: "TASK",
                        title: `Task Completed: ${updatedTask.title}`,
                        description: `Moved to ${updatedTask.column?.title || 'Done'} on Kanban Board`
                    }
                });
            }
        } catch (crmErr) {
            console.warn("[CRM_ACTIVITY_KANBAN_STAGE_CHANGE_LOG_IGNORED]", crmErr?.message);
        }

        revalidatePath(`/workspace/${updatedTask.workspaceId}/productivity/kanban`);
        revalidatePath(`/workspace/${updatedTask.workspaceId}/crm/tasks`);

        return { success: true, task: updatedTask };
    } catch (error) {
        console.error("updateTaskOrderAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Toggle completion status of a checklist item
 */
export async function toggleChecklistItemAction(itemId, completed) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { success: false, error: "Unauthorized" };

        const updatedItem = await db.kanbanChecklist.update({
            where: { id: itemId },
            data: { completed }
        });

        return { success: true, item: updatedItem };
    } catch (error) {
        console.error("toggleChecklistItemAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a kanban task
 */
export async function deleteKanbanTaskAction(taskId) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { success: false, error: "Unauthorized" };

        await db.kanbanTask.delete({
            where: { id: taskId }
        });

        return { success: true };
    } catch (error) {
        console.error("deleteKanbanTaskAction Error:", error);
        return { success: false, error: error.message };
    }
}
