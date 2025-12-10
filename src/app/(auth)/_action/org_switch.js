'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { prisma } from "../../../../prisma/prisma";


const SwitchOrg = z.object({
    orgId: z.string(),
    userId: z.string()
});

const handler = async (data) => {

    const { orgId, userId } = data;
    let organizations
    let org

    try {

        organizations = await prisma.organization.findMany({
            where: { userId }
        })

        organizations.forEach(async (i) => {

            if (i.id === orgId) {
                await prisma.organization.update({ where: { id: i.id }, data: { active: true } })
            } else {
                await prisma.organization.update({ where: { id: i.id }, data: { active: false } })
            }
        });

        organizations = await prisma.organization.findMany({
            where: { userId },
            orderBy: { title: 'asc' }
        })


    } catch (error) {
        console.log(error.message)
        return {
            error: "Failed to create."
        }
    }

    return { data: organizations };

}


export const orgSwitch = createSafeAction(SwitchOrg, handler);