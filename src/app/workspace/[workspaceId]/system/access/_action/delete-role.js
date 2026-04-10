'use server'
import { z } from"zod";
import { createSafeAction } from"@/utils/CreateSafeAction";
import { db } from"@/lib/db";
import { v4 as uuidv4 } from'uuid'
import { ROLE } from"@prisma/client";
import { slug } from"@/utils/functions";

const DeleteRole = z.object({
 userId: z.string(),
 roleId: z.string()
});

const handler = async (data) => {



 const { roleId } = data
 let role




 try {

 role = await db.role.delete({
 where: {
 id: roleId
 }
 })


 } catch (error) {
 console.log(error)
 return {
 message:"Oops!, something went wrong", error
 }
 }

 //revalidatePath(`/org/${orgId}`)
 return { data: { role } };

}


export const deleteRole = createSafeAction(DeleteRole, handler);