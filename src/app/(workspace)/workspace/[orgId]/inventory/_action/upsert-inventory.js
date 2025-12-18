'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";

const UpsertInventory = z.object({
    formData: z.any().optional(),
});

const handler = async (data) => {

    console.log('@Inventory server action', data)

    const { orgId, userId, formData } = data
    let inventory = {}
    let services = []



    try {

        inventory = await db.inventory.upsert({
            where: {
                id: formData.id || '000'
            },
            create: {
                name: formData.name,
                slug: slug(formData.name),
                description: formData.description,
                categoryId: formData.category,
                sku: formData.sku,
                quantity: formData.quantity,
                minStock: formData.minStock,
                unit: formData.unit,
                location: formData.location,
                expiryDate: formData.expiryDate,
                supplier: formData.supplier,
                unitPrise: formData.unitPrise,
            },
            update: {
                name: formData.name,
                slug: slug(formData.name),
                description: formData.description,
                categoryId: formData.category,
                sku: formData.sku,
                quantity: formData.quantity,
                minStock: formData.minStock,
                unit: formData.unit,
                location: formData.location,
                expiryDate: formData.expiryDate,
                supplier: formData.supplier,
                unitPrise: formData.unitPrise,
            },
            include: {
                category: true
            }
        })


    } catch (error) {
        console.log(error)
        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { inventory } };

}


export const upsertInventory = createSafeAction(UpsertInventory, handler);