'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ROLE } from "@prisma/client";

const GetPatients = z.object({
    serverId: z.string(),
});

const handler = async (data) => {
    const { serverId } = data;
    try {
        const patients = await db.user.findMany({
            where: {
                hospitalId: serverId, // In this schema, hospitalId seems to be the equivalent of serverId for the tenant
                role: ROLE.PATIENT,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return { data: { patients } };
    } catch (error) {
        console.error('Error fetching patients:', error);
        return { message: "Failed to fetch patients", error };
    }
};

export const getPatients = createSafeAction(GetPatients, handler);
