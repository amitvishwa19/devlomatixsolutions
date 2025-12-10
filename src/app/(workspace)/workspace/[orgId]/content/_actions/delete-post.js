'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { uploadToBlob } from "@/utils/uploadToBlob";
import { slug } from "@/utils/functions";

const DeletePost = z.object({
    userId: z.string(),
    postId: z.string()
});

const handler = async (data) => {
    const { userId, postId } = data
    let posts
    let post

    try {

        console.log('Delete post')
        post = await db.post.delete({
            where: { id: postId, userId },
        })



    } catch (error) {
        console.log(error)
        return { message: "Oops!, something went wrong", error }
    }

    //revalidatePath(`/org/${orgId}`)
    return { data: { post } };

}


export const deletePost = createSafeAction(DeletePost, handler);