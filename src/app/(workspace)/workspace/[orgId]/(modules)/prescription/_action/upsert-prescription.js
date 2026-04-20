'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const UpsertPrescription = z.object({
    id: z.string().optional(),
    serverId: z.string(),
    patientId: z.string(),
    doctorId: z.string(),
    appointmentId: z.string().optional(),
    diagnosis: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(["ACTIVE", "ONHOLD", "COMPLETED", "DISCONTINUED"]).optional(),
    refillsRemaining: z.number().optional(),
    items: z.array(z.object({
        medicineId: z.string().optional(),
        medicineName: z.string(),
        dosage: z.string(),
        frequency: z.string(),
        duration: z.string(),
        route: z.string().optional(),
        instructions: z.string().optional(),
        quantity: z.number().optional(),
    })),
});

const handler = async (data) => {
    const { id, serverId, patientId, doctorId, appointmentId, diagnosis, notes, status, refillsRemaining, items } = data;

    try {
        let prescription;

        if (id) {
            // Update
            prescription = await db.prescription.update({
                where: { id },
                data: {
                    diagnosis,
                    notes,
                    status,
                    refillsRemaining,
                    items: {
                        deleteMany: {}, // Simplest way to update nested items in this context
                        create: items,
                    },
                },
            });
        } else {
            // Create
            prescription = await db.prescription.create({
                data: {
                    serverId,
                    patientId,
                    doctorId,
                    appointmentId,
                    diagnosis,
                    notes,
                    status,
                    refillsRemaining,
                    items: {
                        create: items,
                    },
                },
            });
        }

        revalidatePath(`/workspace/${serverId}/prescription`);
        return { data: { prescription } };
    } catch (error) {
        console.error('Error upserting prescription:', error);
        return { message: "Failed to save prescription", error };
    }
};

export const upsertPrescription = createSafeAction(UpsertPrescription, handler);