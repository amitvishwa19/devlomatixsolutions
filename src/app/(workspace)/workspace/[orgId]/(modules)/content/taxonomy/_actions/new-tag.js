'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug, slugify } from "@/utils/functions";

const NewTag = z.object({
    formData: z.any()
});

const handler = async (data) => {
    let tag
    let tags


    console.log('add new tag server action', data)

    const { name, description, slug, status } = data


    try {

        // tag = await db.tag.create({
        //     data: {
        //         name: data.formData.name,
        //         slug: slugify(data.formData.name),
        //         color: data.formData.color,
        //         description: data.formData.description,
        //         //categories: data.formData.categories
        //     }
        // })

        tag = await db.tag.upsert({
            where: {
                slug: slugify(data.formData.name)
            },
            update: {
                description: data.formData.description
            },
            create: {
                name: data.formData.name,
                slug: slugify(data.formData.name),
                color: data.formData.color,
                description: data.formData.description,
            }
        })


    } catch (error) {
        console.log(error)
        return {
            message: "Oops!, something went wrong", error
        }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { tags, tag } };

}


export const newTag = createSafeAction(NewTag, handler);