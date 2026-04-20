'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

const GetInvoices = z.object({
    serverId: z.string(),
});

const handler = async (data) => {
    const { serverId } = data;
    try {
        const invoices = await db.invoice.findMany({
            where: { serverId },
            include: {
                patient: true,
                items: true,
                payments: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return { data: { invoices } };
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return { message: "Failed to fetch invoices", error };
    }
};

export const getInvoices = createSafeAction(GetInvoices, handler);
