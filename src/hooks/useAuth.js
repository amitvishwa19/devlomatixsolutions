'use server'
import { cookies } from 'next/headers';
import React from 'react'
import { getSession } from '@/lib/auth'
import { getSession } from '@/lib/auth'

async function useAuth() {
    const currentUser = {}
    //const cookie = cookies().get('session');

    const session = await getSession()
    const user_id = session?.data?.id
    let roles = []

    try {

        console.log('userID', user_id)
        //console.log('getting session in user auth', session?.data?.id)

        //const cookieValue = JSON.parse(cookie?.value)


        // Placeholder for roles and organizations, should be fetched from external API if needed
        const userRoles = { roles: [] };
        roles = userRoles.roles;
        const user = { id: user_id, email: session?.data?.email, name: session?.data?.name };


        const organizations = user.organizations
        let organization

        organizations?.forEach((i) => {
            if (i.active) {
                organization = i
            }
        })

        const userId = user.id
        const name = user.displayName
        const email = user.email
        const avatar = user.avatar

        const test = () => {
            console.log('test function in useAuth')
        }


        return { user, roles, userId, name, email, avatar, organizations, organization, test }
    } catch (error) {
        return currentUser
    }


}

export default useAuth