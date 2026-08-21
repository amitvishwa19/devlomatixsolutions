'use server';

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

/**
 * Get all departments for a workspace
 */
export async function getDepartmentsAction(workspaceId) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        // Find root parent category for ATS Departments if it exists
        const rootParent = await prisma.category.findUnique({
            where: {
                workspaceId_slug: {
                    workspaceId,
                    slug: 'ats-departments'
                }
            }
        });

        const departments = await prisma.category.findMany({
            where: {
                workspaceId,
                OR: [
                    { type: 'ATS_DEPARTMENT' },
                    { type: 'DEPARTMENT' },
                    ...(rootParent ? [{ parentId: rootParent.id }] : [])
                ]
            },
            include: {
                _count: {
                    select: { jobs: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, data: departments };
    } catch (error) {
        console.error("[GET_DEPARTMENTS_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to fetch departments" };
    }
}

/**
 * Create a new department
 */
export async function createDepartmentAction(workspaceId, data) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const { name, description, color } = data;

        // Find or ensure the root parent category exists for ATS Departments
        let rootParent = await prisma.category.findUnique({
            where: {
                workspaceId_slug: {
                    workspaceId,
                    slug: 'ats-departments'
                }
            }
        });

        if (!rootParent) {
            rootParent = await prisma.category.create({
                data: {
                    name: 'ATS Departments',
                    slug: 'ats-departments',
                    workspaceId,
                    type: 'SYSTEM',
                    color: '#3b82f6'
                }
            });
        }

        const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const slug = `${baseSlug}-${Date.now().toString(36)}`;

        const department = await prisma.category.create({
            data: {
                name,
                slug,
                description: description || null,
                color: color || '#3b82f6',
                type: 'ATS_DEPARTMENT',
                parentId: rootParent.id,
                workspaceId,
                userId
            }
        });

        revalidatePath(`/workspace/${workspaceId}/hireflow/departments`);
        revalidatePath(`/workspace/${workspaceId}/hireflow/jobs`);
        return { success: true, data: department };
    } catch (error) {
        console.error("[CREATE_DEPARTMENT_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to create department" };
    }
}

/**
 * Update a department
 */
export async function updateDepartmentAction(workspaceId, departmentId, data) {
    try {
        await ensureWorkspaceAccess(workspaceId);

        const { name, description, color } = data;

        const department = await prisma.category.update({
            where: { id: departmentId, workspaceId },
            data: {
                name: name !== undefined ? name : undefined,
                description: description !== undefined ? description : undefined,
                color: color !== undefined ? color : undefined
            }
        });

        revalidatePath(`/workspace/${workspaceId}/hireflow/departments`);
        revalidatePath(`/workspace/${workspaceId}/hireflow/jobs`);
        return { success: true, data: department };
    } catch (error) {
        console.error("[UPDATE_DEPARTMENT_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to update department" };
    }
}

/**
 * Delete a department
 */
export async function deleteDepartmentAction(departmentId, workspaceId) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return { success: false, error: "Unauthorized" };
        }

        if (!departmentId || !workspaceId) {
            return { success: false, error: "Missing required parameters" };
        }

        // Unlink any jobs attached to this department category first
        await prisma.job.updateMany({
            where: { categoryId: departmentId, workspaceId },
            data: { categoryId: null }
        });

        // Delete the category corresponding to the department
        await prisma.category.delete({
            where: {
                id: departmentId,
                workspaceId
            }
        });

        revalidatePath(`/workspace/${workspaceId}/hireflow/departments`);
        revalidatePath(`/workspace/${workspaceId}/hireflow/jobs`);
        return { success: true, message: "Department deleted successfully" };
    } catch (error) {
        console.error("[DELETE_DEPARTMENT_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete department" };
    }
}
