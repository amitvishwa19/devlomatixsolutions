'use server';

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { revalidatePath } from "next/cache";

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
        return { success: true, message: "Department deleted successfully" };
    } catch (error) {
        console.error("[DELETE_DEPARTMENT_ACTION_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete department" };
    }
}
