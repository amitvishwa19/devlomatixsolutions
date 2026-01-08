import React from 'react'
import { db } from '@/lib/db'
import { AccessProvider } from './_provider/accessProvider'




export const metadata = {
    title: {
        default: 'Access Control',
        template: `%s | ${process.env.APP_NAME}`
    },
    description: 'Devlomatix',
}



export default async function AccessLayout({ children }) {

    const user = await db.user.findMany({
        include: {
            roles: true,
            departments: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const roles = await db.role.findMany({
        include: {
            permissions: true,
            users: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const departments = await db.department.findMany({
        where: {
            isActive: true
        }
    })


    const permissions = await db.permission.findMany({
        orderBy: {
            createdAt: 'desc'
        },

    })

    return (
        <AccessProvider allUsers={user} allRoles={roles} allPermissions={permissions} allDepartments={departments}>
            <div>
                {children}
            </div>
        </AccessProvider>
    )
}
