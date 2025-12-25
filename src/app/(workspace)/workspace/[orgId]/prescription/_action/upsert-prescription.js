'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";

const UpsertPrescription = z.object({
    formData: z.any(),
});

const handler = async (data) => {



    const { formData } = data
    console.log('@Prescription server action', formData)

    let prescription

    try {

        prescription = await db.prescription.upsert({
            where: {
                id: formData.id || '000'
            },
            create: {
                sku: formData.sku,
                appointmentId: formData.appointmentId,
                diagnosis: formData.diagnosis,
                items: formData.items,
                categoryId: formData.category,
                notes: formData.notes,
                status: formData.status
            },
            update: {
                sku: formData.sku,
                appointmentId: formData.appointmentId,
                diagnosis: formData.diagnosis,
                items: formData.items,
                categoryId: formData.category,
                notes: formData.notes,
                status: formData.status
            },
            include: {
                category: true,
                appointment: {
                    include: {
                        patient: true,
                        doctor: {
                            include: {
                                profile: true
                            }
                        }
                    }
                }
            }
        })




    } catch (error) {
        console.log(error)
        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { prescription } };

}


export const upsertPrescription = createSafeAction(UpsertPrescription, handler);