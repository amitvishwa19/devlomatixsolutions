import React from 'react'
import { db } from '@/lib/db'
import { ManagementProvider } from './_provider/managementProvider'



export const metadata = {
    title: {
        default: 'Management',
        template: `%s | ${process.env.APP_NAME}`
    },
    description: 'Devlomatix',
}



export default async function ManagementLayout({ children }) {

    const user = await db.user.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    })

    const roles = await db.role.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    })


    const permissions = await db.permission.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            category: true
        }
    })

    return (
        <ManagementProvider allUsers={user} allRoles={roles} allPermissions={permissions}>
            <div>
                {children}
            </div>
        </ManagementProvider>
    )
}
