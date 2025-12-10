import { db } from '@/lib/db'
import React from 'react'
import { ModalProvider } from './_provider/ModalProvider'

export default async function WorkflowLayout({ children }) {

    //const workflows = await db.workflow.findMany()


    //console.log('workflows', workflows)

    return (
        <div className='  flex h-full w-full flex-1'>
            <ModalProvider />
            {children}
        </div>
    )
}
