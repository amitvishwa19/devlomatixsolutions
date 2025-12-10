'use server'
import { cookies } from 'next/headers';
import React from 'react'
import { prisma } from '../../prisma/prisma';
import { redirect } from 'next/navigation';


async function useDevAuth() {
    const currentUser = {}
    const cookie = cookies().get('DEVUSR');


    try {


        const cookieValue = JSON.parse(cookie?.value)


        const user = await prisma.user.findUnique({
            where: { id: cookieValue.id },


        })




        //const roles = user.roles


        // const organizations = user.organizations
        //let organization

        // organizations?.forEach((i) => {
        //     if (i.active) {
        //         organization = i
        //     }
        // })

        const userId = user.id
        const name = user.displayName
        const email = user.email
        const avatar = user.avatar






        return { user, userId, name, email, avatar, organizations, organization, test }
    } catch (error) {
        console.log(error)
        return currentUser
    }


}

export default useDevAuth