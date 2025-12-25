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

    const categories = await db.category.findFirst({
        where: {
            slug: 'prescription-services'
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

    const prescriptions = await db.prescription.findMany({
        include: {
            category: true,
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const appointments = await db.appointment.findMany({
        include: {
            patient: true,
            doctor: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return (
        <PrescriptionProvider allCategories={categories} allPrescriptions={prescriptions} allAppointments={appointments}>
            <div>
                {children}
            </div>
        </PrescriptionProvider>
    )
}
