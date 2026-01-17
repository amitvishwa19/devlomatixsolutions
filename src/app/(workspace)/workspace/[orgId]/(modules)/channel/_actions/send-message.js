'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import useAuth from "@/hooks/useAuth";
import { MemberRole } from "@prisma/client";
import { CreateChannelMail } from "../_mails/create-channel";

const SendMessage = z.object({
    id: z.string(),
    orgId: z.string(),
    channelId: z.string(),
    userId: z.string(),
    content: z.any(),
});

const handler = async (data) => {
    const { user } = await useAuth()
    const { id, orgId, channelId, userId, content } = data
    const MESSAGES_BATCH = 10;

    //console.log('send-message', data)

    let channel;
    let server;
    let messages = [];
    let message;

    try {

        messages = await db.message.findMany({
            take: MESSAGES_BATCH,
            where: {
                channelId,
            },
            include: {
                member: {
                    include: {
                        user: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc",
            }
        });

        server = await db.server.findFirst({
            where: {
                id: orgId,
                members: {
                    some: { userId }
                }
            },
            include: {
                members: true
            }
        })

        const member = server.members.find((member) => member.userId === userId)

        message = await db.message.create({
            data: {
                id,
                content,
                sent: true,
                memberId: member.id,
                channelId
            }
        })


        let nextCursor = null;

        if (messages.length === MESSAGES_BATCH) {
            nextCursor = messages[MESSAGES_BATCH - 1].id;
        }


    } catch (error) {
        console.log(error)
        return {
            error: "Failed to send message"
        }
    }


    return { data: { server, channel } };

}


export const sendMessage = createSafeAction(SendMessage, handler);