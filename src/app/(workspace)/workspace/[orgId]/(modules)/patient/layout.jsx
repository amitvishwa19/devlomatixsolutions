import React from 'react'
import { PatientProvider } from './_provider/patientProvider'
import { db } from '@/lib/db'
import { ROLE } from '@prisma/client'


export const metadata = {
    title: {
        default: 'Patients',
        template: `%s | ${process.env.APP_NAME}`
    },
    description: 'Devlomatix',
}

export default async function PatientsLayout({ children }) {

    const categories = await db.category.findFirst({
        where: {
            slug: 'patient-management'
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

    const patients = await db.user.findMany({
        where: {
            role: ROLE.PATIENT
        },
        orderBy: {
            createdAt: 'desc'
        }
    })


    return (
        <PatientProvider allCategories={categories} allPatients={patients}>
            <div>
                {children}
            </div>
        </PatientProvider>


    )
}
