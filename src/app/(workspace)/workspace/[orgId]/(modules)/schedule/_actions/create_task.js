'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import CardNotification from "@/emails/CardNotification";
import { AppMailer } from "@/utils/AppMailer";
import useAuth from "@/hooks/useAuth";

const CreateTask = z.object({
    title: z.string(),
    description: z.string(),
    listId: z.optional(z.string()),
    boardId: z.optional(z.string()),
    orgId: z.optional(z.string()),
    color: z.optional(z.string()),
    dueDate: z.date(),
    status: z.boolean(),
    assigneeId: z.string(),
    userId: z.string()
});

const handler = async (data) => {

    console.log('create card', data)


    const { title, description, listId, boardId, orgId, color, priority, assigneeId, status, dueDate, userId, } = data;
    let server;
    let board;
    let list;
    let card;

    const col = [
        { id: 0, display: 'Low', value: 'LOW', color: '#2563EB' },
        { id: 1, display: 'Medium', value: 'MEDIUM', color: '#059669' },
        { id: 2, display: 'High', value: 'HIGH', color: '#D97706' }
    ]


    try {

        // const lastCard = await db.task.findFirst({
        //     where: { listId },
        //     orderBy: { order: "desc" },
        //     select: { order: true },
        // });

        //const newOrder = lastCard ? lastCard.order + 1 : 1;

        card = await db.task.create({
            data: {
                serverId: orgId,
                title,
                description,
                color: color,
                order: 1,
                assigneeId,
                status,
                dueDate
            }
        })

        console.log(card)


        // server = await db.server.findFirst({
        //     where: {
        //         id: orgId
        //     },
        //     include: {
        //         channels: {
        //             orderBy: {
        //                 createdAt: "desc",
        //             },
        //         },
        //         boards: {
        //             where: {
        //                 status: true
        //             },
        //             include: {
        //                 lists: {
        //                     include: {
        //                         cards: true
        //                     }
        //                 }
        //             },
        //             orderBy: {
        //                 createdAt: "desc",
        //             },
        //         },
        //         members: {
        //             include: {
        //                 user: true,
        //             },
        //             orderBy: {
        //                 role: "desc",
        //             }
        //         },

        //     }
        // })


        ///board = server?.boards?.find(i => i.id === boardId)
        //list = board?.lists?.find(i => i.id === listId)

        //console.log('Create task card', `${process.env.APP_URL}/workspace/${server.id}/board/${board.id}`)

        // if (card) {
        //     server.members.forEach(async (i) => {

        //         await AppMailer({
        //             to: i.user.email,
        //             from: 'Devlomatix <noreply@devlomatix.online>',
        //             subject: `New Task ${card.title} created`,
        //         }, < CardNotification
        //             mailData={
        //                 {
        //                     type: 'create',
        //                     user: i.user,
        //                     server,
        //                     board,
        //                     list,
        //                     card,
        //                     link: `${process.env.APP_URL}/workspace/${server.id}/board/${board.id}`
        //                 }
        //             }
        //         />)
        //     })
        // }




    } catch (error) {
        console.log(error)
        return {
            error: "Failed to create new Task Card"
        }
    }

    //revalidatePath(`/dashboard/org/${orgId}/board/${boardId}`)
    return { data: { card, server } };

}


export const createTask = createSafeAction(CreateTask, handler);