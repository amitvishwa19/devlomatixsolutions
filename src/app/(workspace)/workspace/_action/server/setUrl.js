'use server'
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { prisma } from "../../../../../../prisma/prisma";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole } from "@prisma/client";
import useAuth from "@/hooks/useAuth";
import { db } from "@/lib/db";


const SetUrl = z.object({
    url: z.string()
});

const handler = async (data) => {

    try {



    } catch (error) {
        console.log(error)
        return {
            error: "Failed to create channel"
        }
    }

    //revalidatePath(`/org//${server.id}`)
    return { data: name };

}


export const setUrl = createSafeAction(SetUrl, handler);