'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { MemberRole } from "@prisma/client";
import { db } from "@/lib/db";


const AppSeed = z.object({
    seed: z.boolean(),
    seedData: z.any()
});

const handler = async (data) => {
    const { seedData } = data
    console.log('@@ Server App Seeder', seedData.users)
    try {
        let users = []
        let roles = []

        users = seedData.users.forEach(async (item, index) => {
            await db.user.create({
                data: {
                    firstName: item.firstName,
                    lastName: item.lastName,
                    email: item.email,
                    displayName: item.displayName,
                    avatar: item.avatar,
                    role: item.role,
                    profile: {
                        create: {
                            firstname: item.firstName,
                            lastname: item.lastName,
                            displayname: item.displayName,
                            gender: item.gender,
                        }
                    }
                }
            })
        })


        await db.role.createMany({
            data: seedData.userRoles
        })


        // await db.user.create({
        //     data: {
        //         firstName: 'item.firstName',
        //         lastName: 'item.lastName',
        //         email: 'tem.emailll@gmaail.com',

        //     }
        // })



    } catch (error) {
        return {
            error: error
        }
    }

    //revalidatePath(`/org//${server.id}`)
    return { data: { status: 200 } };

}


export const appSeed = createSafeAction(AppSeed, handler);