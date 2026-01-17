import React from 'react'
import { AppointmentProvider } from './_provider/appointmentProvider'
import { db } from '@/lib/db'

export const metadata = {
    title: {
        default: 'Appointments',
        template: `%s | ${process.env.APP_NAME}`
    },
    description: 'Devlomatix',
}

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

    const appointments = await db.appointment.findMany({
        include: {
            doctor: {
                include: {
                    profile: true
                }
            },
            patient: {
                include: {
                    profile: true
                }
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    })


    return (
        <AppointmentProvider allCategories={categories} allAppointments={appointments}>
            <div>
                {children}
            </div>
        </AppointmentProvider>
    )
}
