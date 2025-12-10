'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { prisma } from "../../../../prisma/prisma";
import { cookies } from "next/headers";


const GetUser = z.object({

});

const handler = async (data) => {
    let user = null
    let organizations = null

    try {

        const cookieValue = cookies().get('DEVUSR');





        if (cookieValue) {
            user = JSON.parse(cookieValue.value);
        }

        //console.log('user', user.id)
        if (user) {

            user = await prisma.user.findUnique({
                where: { id: user.id },
                select: {
                    id: true,
                    displayName: true,
                    email: true,
                    avatar: true,

                },
            })

            organizations = await prisma.organization.findMany({
                where: { userId: user.id },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    avatar: true,
                    status: true,
                    active: true
                },
                orderBy: { title: 'asc' }
            });

        }

        console.log('username', totalOrg)


    } catch (error) {
        //cookies().delete('DEVUSR')
        //cookies().delete('DEVUSRAT')
        //cookies().delete('DEVUSRRT')
    }

    return { data: { user, organizations } };

}


export const getUser = createSafeAction(GetUser, handler);