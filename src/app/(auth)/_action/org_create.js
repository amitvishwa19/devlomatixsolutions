'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { prisma } from "../../../../prisma/prisma";


const CreateOrg = z.object({
    title: z.string({
        required_error: "Title is required",
        invalid_type_error: "Title is required",
    }).min(3, {
        message: "Title is too short",
    }),
    description: z.string(),
    avatar: z.string(),
    userId: z.string(),
});

const handler = async (data) => {

    const { title, description, avatar, userId } = data;
    let organization
    let organizations
    let setActive = true

    try {

        const organizations = await prisma.organization.findMany({
            where: { userId: userId }
        });

        if (organizations) {
            organizations.length > 0 ? setActive = false : setActive = true
        }



        organization = await prisma.organization.create({
            data: { title, description, avatar, userId, active: setActive },
            select: {
                id: true,
                title: true,
                description: true,
                avatar: true,
                status: true,
                active: true
            },
        })

        console.log('new org created', organization)


    } catch (error) {
        console.log(error.message)
        return {
            error: "Failed to create."
        }
    }

    return { data: organization };

}


export const createOrganization = createSafeAction(CreateOrg, handler);