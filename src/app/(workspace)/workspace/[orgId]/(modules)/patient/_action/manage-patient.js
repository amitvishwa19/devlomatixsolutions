'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { uuid } from "@/utils/functions";

const ManagePatient = z.object({
    userId: z.string().optional(),
    personal: z.any(),
    contact: z.any(),
    medicalInformation: z.any(),
    type: z.string()
});

const handler = async (data) => {

    const { userId, personal, contact, medicalInformation, type } = data
    let medicalProfile
    let user
    let message

    console.log('@new patient server', data)

    try {

        if (type === 'add') {
            user = await db.user.findFirst({
                where: {
                    email: personal.email
                }
            })

            if (user) {
                return { data: { status: 501, message: 'user already exists with this email' } }
            } else {
                user = await db.user.create({
                    data: {
                        email: personal.email,
                        name: personal.firstname + ' ' + personal.lastname,
                        displayName: personal.firstname + ' ' + personal.lastname,
                        uuid: uuid(),
                        profile: {
                            create: {
                                displayname: personal.firstname + ' ' + personal.lastname,
                            }
                        },
                        medicalProfile: {
                            create: {
                                contact, personal, medicalInformation
                            }
                        },
                        credit: {
                            create: {
                                value: 100
                            }
                        },
                    }
                })
            }
        }



        // medicalProfile = await db.medicalProfile.findFirst({
        //     where: {
        //         userId
        //     }
        // })

        medicalProfile = await db.medicalProfile.update({
            where: {
                userId
            },
            data: {
                userId,
                personal,
                contact,
                medicalInformation
            }
        })




    } catch (error) {

        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { medicalProfile } };

}


export const managePatient = createSafeAction(ManagePatient, handler);