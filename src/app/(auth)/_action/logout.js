'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { replace } from "lodash";

const Logout = z.object({

});

const handler = async (data) => {
    let user


    try {

        cookies().delete('DEVUSR')
        cookies().delete('DEVUSRAT')
        cookies().delete('DEVUSRRT')




    } catch (error) {
        console.log(error)
        return {

            error: "Failed to logout user."
        }
    }

    return { data: 'Logout Success' };

}


export const logoutUser = createSafeAction(Logout, handler);