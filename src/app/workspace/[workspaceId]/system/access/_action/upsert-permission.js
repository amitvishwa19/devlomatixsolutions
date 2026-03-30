'use server'
import { z } from"zod";
import { createSafeAction } from"@/utils/CreateSafeAction";
import { db } from"@/lib/db";
import { v4 as uuidv4 } from'uuid'
import { ROLE } from"@prisma/client";
import { slug } from"@/utils/functions";
import { color } from"framer-motion";

const UpsertPermission = z.object({
 userId: z.string(),
 formData: z.any(),
});

const handler = async (data) => {



 const { orgId, userId, formData } = data
 let permission
 let permissions
 let services = []



 try {

 // 🚀 THE FIX: Use an Interactive Transaction to properly honor the timeout
 permissions = await db.$transaction(async (tx) => {
 return await Promise.all(formData.map(async (item) => {
 const isNew = String(item.id).startsWith("new-");
 
 return tx.permission.upsert({
 where: { id: isNew ?'000': item.id },
 update: {
 title: item?.title,
 value: item?.value,
 description: item?.description,
 category: item?.category,
 status: item.status,
 color: item.color
 },
 create: {
 // Let Prisma generate a proper CUID for new items
 title: item?.title,
 value: item?.value,
 description: item?.description,
 category: item?.category,
 status: item.status,
 color: item.color
 },
 include: {
 roles: {
 include: {
 users: true
 }
 }
 },
 });
 }));
 }, {
 timeout: 30000 // Increase timeout to 30 seconds for bulk operations
 });

 console.log(formData)

 // permission = await db.permission.upsert({
 // where: {
 // id: formData.id ||'000'
 // },
 // create: {
 // title: formData?.title,
 // description: formData?.description,
 // color: formData?.color
 // },
 // update: {
 // title: formData?.title,
 // description: formData?.description,
 // color: formData?.color
 // },
 // include: {
 // roles: true
 // },
 // })


 } catch (error) {
 console.log(error)
 return {
 message:"Oops!, something went wrong", error
 }
 }

 //revalidatePath(`/org/${orgId}`)
 return { data: { permissions } };

}


export const upsertPermission = createSafeAction(UpsertPermission, handler);