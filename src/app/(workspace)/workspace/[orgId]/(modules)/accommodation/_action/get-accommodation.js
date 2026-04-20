'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const GetAccommodation = z.object({
    serverId: z.string(),
});

const handler = async (data) => {
    const { serverId } = data;
    try {
        const rooms = await db.room.findMany({
            where: { serverId },
            include: {
                beds: {
                    include: {
                        admissions: {
                            where: { status: 'admitted' },
                            include: { patient: true }
                        }
                    }
                }
            },
            orderBy: {
                name: 'asc',
            },
        });
        return { data: { rooms } };
    } catch (error) {
        console.error('Error fetching accommodation:', error);
        return { message: "Failed to fetch accommodation", error };
    }
};

export const getAccommodation = createSafeAction(GetAccommodation, handler);
