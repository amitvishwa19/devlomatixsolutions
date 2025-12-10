'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { put } from '@vercel/blob'




const UploadFileToVercel = z.object({
    file: z.any(),
    type: z.optional(z.string()),
    name: z.optional(z.string()),
    size: z.optional(z.number())

});

const handler = async (data) => {



    const { file, type, name, size } = data;

    let doc
    let blob

    try {


        console.log('uplad file server action', { type }, { name }, { size })

        ///const blob = new Blob(file, { type })

        //console.log(blob)
        //const blob = new Blob(file, { type })

        blob = await put(name, file.get('file'), {
            access: 'public'
        })

        console.log(blob)

        // doc = await db.document.create({
        //     data: {
        //         userId,
        //         name,
        //         url: blob.url,
        //         type: blob.contentType,
        //         size: size.toString()
        //     }
        // })

        //console.log(blob)

        //console.log(file.get('file'))



    } catch (error) {
        console.log(error)
        return {

            error: "Failed to upload file"

        }
    }

    //revalidatePath(`/org//${server.id}`)

    return { data: { doc, name: name, url: blob.url } };


}


export const uploadFileToVercel = createSafeAction(UploadFileToVercel, handler);