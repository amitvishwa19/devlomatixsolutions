'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const ManageAccommodation = z.object({
    type: z.enum(["ADMIT", "TRANSFER", "DISCHARGE", "MAINTENANCE", "CLEAN"]),
    serverId: z.string(),
    patientId: z.string().optional(),
    bedId: z.string(),
    targetBedId: z.string().optional(), // For transfer
    notes: z.string().optional(),
    reason: z.string().optional(),
});

const handler = async (data) => {
    const { type, serverId, patientId, bedId, targetBedId, notes, reason } = data;

    try {
        if (type === "ADMIT") {
            // 1. Create Admission record
            await db.admission.create({
                data: {
                    serverId,
                    patientId,
                    bedId,
                    reason,
                    notes,
                    status: "admitted",
                },
            });
            // 2. Update Bed status
            await db.bed.update({
                where: { id: bedId },
                data: { status: "OCCUPIED" },
            });
        } else if (type === "TRANSFER") {
            // 1. Update existing admission
            const admission = await db.admission.findFirst({
                where: { bedId, patientId, status: "admitted" },
            });
            if (admission) {
                await db.admission.update({
                    where: { id: admission.id },
                    data: { status: "transferred", dischargedAt: new Date() },
                });
            }
            // 2. Create new admission for target bed
            await db.admission.create({
                data: {
                    serverId,
                    patientId,
                    bedId: targetBedId,
                    reason: `Transferred from ${bedId}`,
                    status: "admitted",
                },
            });
            // 3. Update Bed statuses
            await db.bed.update({ where: { id: bedId }, data: { status: "AVAILABLE", housekeeping: "NEEDS_CLEANING" } });
            await db.bed.update({ where: { id: targetBedId }, data: { status: "OCCUPIED" } });
        } else if (type === "DISCHARGE") {
            // 1. Update admission
            const admission = await db.admission.findFirst({
                where: { bedId, status: "admitted" },
            });
            if (admission) {
                await db.admission.update({
                    where: { id: admission.id },
                    data: { status: "discharged", dischargedAt: new Date(), notes },
                });
            }
            // 2. Update Bed status
            await db.bed.update({
                where: { id: bedId },
                data: { status: "AVAILABLE", housekeeping: "NEEDS_CLEANING" },
            });
        } else if (type === "CLEAN") {
            await db.bed.update({
                where: { id: bedId },
                data: { housekeeping: "CLEAN" },
            });
        } else if (type === "MAINTENANCE") {
            await db.bed.update({
                where: { id: bedId },
                data: { status: "MAINTENANCE" },
            });
        }

        revalidatePath(`/workspace/${serverId}/accommodation`);
        return { data: { success: true } };
    } catch (error) {
        console.error('Error managing accommodation:', error);
        return { message: "Failed to update accommodation", error };
    }
};

export const manageAccommodation = createSafeAction(ManageAccommodation, handler);
