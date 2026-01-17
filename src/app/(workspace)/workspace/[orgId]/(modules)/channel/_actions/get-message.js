'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import useAuth from "@/hooks/useAuth";
import { MemberRole } from "@prisma/client";
import { CreateChannelMail } from "../_mails/create-channel";

const GetMessage = z.object({
    orgId: z.string(),
    channelId: z.string(),
    //userId: z.string(),

});

const handler = async (data) => {
    const { user } = await useAuth()
    const { orgId, channelId, userId, content } = data
    const MESSAGES_BATCH = 10;

    //console.log('send-message', data)

    let channel;
    let server;
    let messages = [];
    let message;

    try {

        messages = await db.message.findMany({
            //take: MESSAGES_BATCH,
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


    return { data: { server, channel, messages } };

}


export const getMessage = createSafeAction(GetMessage, handler);