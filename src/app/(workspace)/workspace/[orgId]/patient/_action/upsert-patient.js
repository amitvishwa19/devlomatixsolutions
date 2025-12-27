'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { generatePatientSku, uuid } from "@/utils/functions";

const Upsertpatient = z.object({
    formData: z.any(),
    type: z.string()
});

const handler = async (data) => {

    const { formData, type } = data
    let medicalProfile
    let user
    let mode

    console.log('@new patient server', data)

    try {



        if (type === 'demographic') {
            console.log('upsert user data')

            const existingUser = await db.user.findFirst({
                where: {
                    OR: [
                        formData.email ? { email: formData.email } : undefined,
                        formData.primaryPhone ? { phone: formData.primaryPhone } : undefined,
                    ].filter(Boolean),
                },
            });

            const sku = generatePatientSku({ fullName: formData.fullName, dateOfBirth: formData.dateOfBirth, gender: formData.gender, primaryPhone: formData.primaryPhone })


            if (existingUser) {
                // Step 2: Update if found
                user = await db.user.update({
                    where: { id: existingUser.id },
                    data: {
                        name: formData.fullName,
                        displayName: formData.fullName,
                        phone: formData.primaryPhone,
                        role: ROLE.PATIENT,
                        demographic: formData,
                        uuid: sku
                    },
                });
                mode = 'edit'
            } else {
                // Step 3: Create new user
                user = await db.user.create({
                    data: {
                        sku,
                        name: formData.fullName,
                        displayName: formData.fullName,
                        phone: formData.primaryPhone,
                        role: ROLE.PATIENT,
                        demographic: formData,
                        uuid: sku
                    },
                });
                mode = 'add'
            }

            console.log('existingUser', existingUser)











        }








    } catch (error) {
        console.log(error)
        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { user, mode } };

}


export const upsertpatient = createSafeAction(Upsertpatient, handler);