'use server'
import { z } from"zod";
import { createSafeAction } from"@/utils/CreateSafeAction";
import { db } from"@/lib/db";
import { v4 as uuidv4 } from'uuid'
import { ROLE } from"@prisma/client";
import { slug } from"@/utils/functions";
import { connect } from"http2";

const UpsertRole = z.object({
 userId: z.string(),
 formData: z.any(),
});

const handler = async (data) => {
 const { userId, formData } = data
 let role
 let temprole

 try {



 //const perms = formData?.permissions.map((i) => { return { id: i.id }; })
 const perms = formData.permissions
 .filter((p) => p.status === true)
 .map((p) => ({ id: p.id }));

 //console.log('@role server action', formData.permissions.length, perms)


 role = await db.role.upsert({
 where: {
 id: formData.id ||'000'
 },
 create: {
 title: formData?.title,
 description: formData?.description,
 color: formData?.color,
 permissions: {
 connect: perms
 }
 },
 update: {
 title: formData?.title,
 description: formData?.description,
 color: formData?.color,
 permissions: {
 set: perms
 }
 },
 include: {
 permissions: true
 },
 })





 } catch (error) {
 //console.log(error)
 return {
 message:"Oops!, something went wrong", error
 }
 }

 //revalidatePath(`/org/${orgId}`)
 return { data: { role } };

}


export const upsertRole = createSafeAction(UpsertRole, handler);