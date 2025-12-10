'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import jwt from 'jsonwebtoken'
import { prisma } from "../../../../prisma/prisma";


const VerifyToken = z.object({
    token: z.string(),
});

const handler = async (data) => {

    const { token } = data;



    try {

        const auth = jwt.verify(token, process.env.APP_SECRET)

        console.log('auth', auth)


        const user = await prisma.user.update({
            where: { id: auth.id },
            data: { emailVerified: true }
        })



        //console.log(user)

    } catch (error) {
        console.log(error.message)
        return {
            error: {
                status: 500,
                message: "invalid verification link"
            }
        }
    }

    return { data: 'token verified' };

}


export const verifyToken = createSafeAction(VerifyToken, handler);