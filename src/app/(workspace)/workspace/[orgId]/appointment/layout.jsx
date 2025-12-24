import React from 'react'
import { AppointmentProvider } from './_provider/appointmentProvider'
import { db } from '@/lib/db'

export default async function AppointmentLayout({ children }) {

    const categories = await db.category.findFirst({
        where: {
            slug: 'appointment-scheduling'
        },
        include: {
            children: {
                include: {
                    children: {
                        include: {
                            children: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })




    return (
        <AppointmentProvider allCategories={categories}>
            <div>
                {children}
            </div>
        </AppointmentProvider>
    )
}
