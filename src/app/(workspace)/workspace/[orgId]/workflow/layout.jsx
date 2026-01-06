import { db } from '@/lib/db'
import React from 'react'
import { FlowProvider } from './_provider/flowProvider'


export const metadata = {
    title: {
        default: 'Workflow',
        template: `%s | ${process.env.APP_NAME}`
    },
    description: 'Devlomatix',
}


export default async function IpdOpdLayout({ children }) {

    const users = await db.user.findMany({

        orderBy: {
            createdAt: 'desc'
        }
    })



    return (
        <FlowProvider allUsers={users}>
            <div>
                {children}
            </div>
        </FlowProvider>
    )
}
