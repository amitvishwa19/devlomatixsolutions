'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const UpsertInvoice = z.object({
    id: z.string().optional(),
    serverId: z.string(),
    patientId: z.string(),
    invoiceNumber: z.string(),
    dueDate: z.date().optional(),
    status: z.enum(["UNPAID", "PARTIAL", "PAID", "CANCELLED", "VOID"]).optional(),
    items: z.array(z.object({
        description: z.string(),
        quantity: z.number().default(1),
        unitPrice: z.number(),
        total: z.number(),
        source: z.string().optional(),
        sourceId: z.string().optional(),
    })),
});

const handler = async (data) => {
    const { id, serverId, patientId, invoiceNumber, dueDate, status, items } = data;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.0; // Placeholder for tax logic if needed
    const total = subtotal + tax;

    try {
        let invoice;
        const itemData = {
            deleteMany: {},
            create: items,
        };

        if (id) {
            // Fetch existing to handle balance logic
            const existing = await db.invoice.findUnique({ where: { id } });
            const amountPaid = existing ? existing.amountPaid : 0;
            const balance = total - amountPaid;

            invoice = await db.invoice.update({
                where: { id },
                data: {
                    subtotal,
                    tax,
                    total,
                    balance,
                    status: balance <= 0 ? "PAID" : (amountPaid > 0 ? "PARTIAL" : "UNPAID"),
                    dueDate,
                    items: itemData,
                },
            });
        } else {
            invoice = await db.invoice.create({
                data: {
                    serverId,
                    patientId,
                    invoiceNumber,
                    subtotal,
                    tax,
                    total,
                    balance: total,
                    status: "UNPAID",
                    dueDate,
                    items: { create: items },
                },
            });
        }

        revalidatePath(`/workspace/${serverId}/billing`);
        return { data: { invoice } };
    } catch (error) {
        console.error('Error upserting invoice:', error);
        return { message: "Failed to save invoice", error };
    }
};

export const upsertInvoice = createSafeAction(UpsertInvoice, handler);
