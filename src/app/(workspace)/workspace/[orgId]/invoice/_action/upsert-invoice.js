'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";

const UpsertInvoice = z.object({
    payload: z.any().optional(),
});

const handler = async (data) => {



    const { payload } = data
    console.log('@Inventory server action', payload)

    let invoice

    try {

        // invoice = await db.invoice.upsert({
        //     where: {
        //         id: payload.id || '000'
        //     },
        //     create: {
        //         appointmentId: payload?.appointmentId,
        //         issueDate: payload?.issueDate,
        //         dueDate: payload?.issueDate,
        //         statue: payload?.status,
        //         subTotal: payload?.subTotal,
        //         tax: payload.tax,
        //         discount: payload.discount,
        //         totalAmount: payload?.todalAmount,
        //         notes: payload.notes
        //     },
        //     update: {
        //         appointmentId: payload?.appointmentId,
        //         issueDate: payload?.issueDate,
        //         dueDate: payload?.issueDate,
        //         statue: payload?.status,
        //         subTotal: payload?.subTotal,
        //         tax: payload.tax,
        //         discount: payload.discount,
        //         totalAmount: payload?.todalAmount,
        //         notes: payload.notes
        //     },
        //     include: {
        //         category: true
        //     }
        // })

        invoice = await db.invoice.create({
            data: {
                appointmentId: payload?.appointmentId,
                issueDate: payload?.issueDate?.toString(),
                dueDate: payload?.dueDate?.toString(),
                statue: payload?.status,
                subtotal: payload?.subTotal,
                tax: payload.tax,
                discount: payload.discount,
                totalAmount: payload?.totalAmount,
                notes: payload.notes
            }
        })


    } catch (error) {
        console.log(error)
        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { invoice } };

}


export const upsertInvoice = createSafeAction(UpsertInvoice, handler);