'use server'
import { z } from"zod";
import { createSafeAction } from"@/utils/CreateSafeAction";
import { db } from"@/lib/db";
import { v4 as uuidv4 } from'uuid'
import { ROLE } from"@prisma/client";
import { slug } from"@/utils/functions";

const DeleteUser = z.object({
 userId: z.string(),
 deleteUserId: z.string()
});

const handler = async (data) => {



 const { deleteUserId } = data
 let user




 try {

 user = await db.user.delete({
 where: {
 id: deleteUserId
 }
 })


 } catch (error) {
 console.log(error)
 return {
 message:"Oops!, something went wrong", error
 }
 }

 //revalidatePath(`/org/${orgId}`)
 return { data: { user } };

}


export const deleteUser = createSafeAction(DeleteUser, handler);