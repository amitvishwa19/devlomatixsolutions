'use server'

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";

/**
 * Fetch kanban columns and user-scoped tasks
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

        const columns = await db.kanbanColumn.findMany({
            where: { workspaceId },
            orderBy: { order: 'asc' },
            include: {
                tasks: {
                    where: {
                        OR: [
                            { userId },
                            { assigneeId: userId }
                        ]
                    },
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

        const updatedTask = await db.kanbanTask.update({
            where: { id: taskId },
            data: {
                columnId,
                order
            }
        });

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
