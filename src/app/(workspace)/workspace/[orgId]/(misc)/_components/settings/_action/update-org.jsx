'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { put } from '@vercel/blob'

const UpdateOrg = z.object({
    userId: z.string(),
    serverId: z.string(),
    orgData: z.any(),
    type: z.optional(z.string()),
    file: z.optional(z.any()),
    fileName: z.optional(z.string()),
    size: z.optional(z.number())
});

const handler = async (data) => {
    const { serverId, userId, orgData, type, file, fileName, size } = data;
    let server = {}
    let servers = []
    let imgUrl = null;
    let blob;


    try {


        if (file) {
            const formFile = file.get('file')

            console.log('@update org', formFile)
            blob = await put(fileName, file.get('file'), {
                access: 'public',
                allowOverwrite: true
            })
            imgUrl = blob.url

            const doc = await db.document.create({
                data: {
                    userId,
                    name: fileName,
                    url: blob.url,
                    type: blob.contentType,
                    size: size.toString()
                }
            })
        }


        server = await db.server.update({
            where: { id: serverId, userId: userId },
            data: {
                name: orgData.name,
                description: orgData.description,
                imageUrl: imgUrl,
            }
        })


    } catch (error) {
        console.log(error)
        return {
            error: "Failed to copy the list."
        }
    }

    //revalidatePath(`/org//${orgId}`)
    return { data: { server, servers } };

}


export const updateOrg = createSafeAction(UpdateOrg, handler);