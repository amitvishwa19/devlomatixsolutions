'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const UpsertLabOrder = z.object({
    id: z.string().optional(),
    serverId: z.string(),
    patientId: z.string(),
    requesterId: z.string(),
    appointmentId: z.string().optional(),
    priority: z.enum(["ROUTINE", "URGENT", "STAT"]).optional(),
    status: z.enum(["ORDERED", "SAMPLE_COLLECTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
    notes: z.string().optional(),
    results: z.array(z.object({
        testName: z.string(),
        value: z.string(),
        unit: z.string().optional(),
        range: z.string().optional(),
        status: z.string().optional(),
        notes: z.string().optional(),
    })).optional(),
});

const handler = async (data) => {
    const { id, serverId, patientId, requesterId, appointmentId, priority, status, notes, results } = data;

    try {
        let order;
        const resultData = results ? {
            deleteMany: {},
            create: results,
        } : undefined;

        if (id) {
            order = await db.labOrder.update({
                where: { id },
                data: {
                    priority,
                    status,
                    notes,
                    results: resultData,
                    sampleCollectedAt: status === 'SAMPLE_COLLECTED' ? new Date() : undefined,
                    completedAt: status === 'COMPLETED' ? new Date() : undefined,
                },
            });
        } else {
            order = await db.labOrder.create({
                data: {
                    serverId,
                    patientId,
                    requesterId,
                    appointmentId,
                    priority,
                    status,
                    notes,
                    results: results ? { create: results } : undefined,
                },
            });
        }

        revalidatePath(`/workspace/${serverId}/laboratory`);
        return { data: { order } };
    } catch (error) {
        console.error('Error upserting lab order:', error);
        return { message: "Failed to save lab order", error };
    }
};

export const upsertLabOrder = createSafeAction(UpsertLabOrder, handler);
