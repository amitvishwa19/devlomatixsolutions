'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const DeletePrescription = z.object({
    id: z.string(),
    serverId: z.string(),
});

const handler = async (data) => {
    const { id, serverId } = data;
    try {
        await db.prescription.delete({
            where: { id },
        });
        revalidatePath(`/workspace/${serverId}/prescription`);
        return { data: { success: true } };
    } catch (error) {
        console.error('Error deleting prescription:', error);
        return { message: "Failed to delete prescription", error };
    }
};

export const deletePrescription = createSafeAction(DeletePrescription, handler);