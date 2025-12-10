// import useAuth from "@/hooks/useAuth";
// import { prisma } from "../../prisma/prisma";
// import { ACTION, ENTITY_TYPE } from "@prisma/client";


// export const createAuditLog = async (entityId, entityType, entityTitle, action) => {
//     try {


//         const { userId, name, email, avatar, organizations, organization } = await useAuth()

//         // if (!user || !orgId) {
//         //     throw new Error("User not found!");
//         // }

//         //const { entityId, entityType, entityTitle, action } = props;

//         await prisma.auditLog.create({
//             data: {
//                 orgId: organization.id,
//                 entityId,
//                 entityType,
//                 entityTitle,
//                 action,
//                 userId: userId,
//                 userImage: avatar,
//                 userName: name,
//             }
//         });
//     } catch (error) {
//         console.log("[AUDIT_LOG_ERROR]", error);
//     }
// }