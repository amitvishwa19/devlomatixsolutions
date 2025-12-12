'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { uploadToBlob } from "@/utils/uploadToBlob";
import { slug } from "@/utils/functions";

const UpsertPost = z.object({
    postData: z.any(),
    orgId: z.string(),
    userId: z.string(),
    status: z.string(),
    edit: z.boolean()
});

const handler = async (data) => {

    const { userId, orgId, postData, status, edit } = data
    let post = null
    let posts = []
    let thumbnailUrl = null

    try {
        console.log('@Post data upsert server action', status)

        if (postData.thumbnail) {
            thumbnailUrl = await uploadToBlob({
                file: postData.thumbnail,
            })
        }

        const categories = postData.categories.map((cat) => cat.id)
        const categoryIds = postData.categories.map(cat => cat.id);

        post = await db.post.upsert({
            where: {
                id: postData?.id || '000'
            },
            update: {
                userId,
                serverId: orgId,
                title: postData?.title,
                slug: slug(postData?.title),
                description: postData?.description,
                excerpt: postData?.excerpt,
                content: postData?.content,
                thumbnail: thumbnailUrl,
                status,
                categories: { connect: categoryIds.map(id => ({ id })) },
                tags: {
                    connectOrCreate: postData.tags.map(tagName => ({
                        where: { slug: slug(tagName) },
                        create: { name: tagName, slug: slug(tagName) }
                    }))
                }
            },
            create: {
                userId,
                serverId: orgId,
                title: postData?.title,
                slug: slug(postData?.title),
                description: postData?.description,
                excerpt: postData?.excerpt,
                content: postData?.content,
                thumbnail: thumbnailUrl,
                status,
                categories: { connect: categoryIds.map(id => ({ id })) },
                tags: {
                    connectOrCreate: postData.tags.map(tagName => ({
                        where: { slug: slug(tagName) },
                        create: { name: tagName, slug: slug(tagName) }
                    }))
                },

            },
            include: {
                categories: true,
                tags: true
            }
        })


    } catch (error) {
        console.log(error)
        return { message: "Oops!, something went wrong", error }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { post, edit } };

}


export const upsertPost = createSafeAction(UpsertPost, handler);