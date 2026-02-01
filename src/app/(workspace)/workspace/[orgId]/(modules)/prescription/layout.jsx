import React from 'react'
import { PrescriptionProvider } from './_provider/PrescriptionProvider'
import { db } from '@/lib/db'

export const metadata = {
    title: {
        default: 'Prescriptions',
        template: `%s | ${process.env.APP_NAME}`
    },
    description: 'Devlomatix',
}

export default async function PrescriptionLayout({ children }) {

    return (
        <PrescriptionProvider>
            <div>
                {children}
            </div>
        </PrescriptionProvider>
    )
}
