'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const GetPrescriptions = z.object({
    serverId: z.string(),
    patientId: z.string().optional(),
});

const handler = async (data) => {
    const { serverId, patientId } = data;
    try {
        const query = {
            where: {
                serverId,
            },
            include: {
                patient: true,
                doctor: true,
                items: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        };

        if (patientId) {
            query.where.patientId = patientId;
        }

        const prescriptions = await db.prescription.findMany(query);
        return { data: { prescriptions } };
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        return { message: "Failed to fetch prescriptions", error };
    }
};

export const getPrescriptions = createSafeAction(GetPrescriptions, handler);
