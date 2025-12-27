import React from 'react'
import { InvoiceProvider } from './_provider/invoiceProvider'
import { db } from '@/lib/db'


export const metadata = {
    title: {
        default: 'Invoices',
        template: `%s | ${process.env.APP_NAME}`
    },
    description: 'Devlomatix',
}

export default async function Invoicelayout({ children }) {

    const categories = await db.category.findFirst({
        where: {
            slug: 'billing-invoicing'
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


    const invoices = await db.invoice.findMany({
        include: {
            category: true,
            patient: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const services = await db.service.findMany({
        where: {
            status: true
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
        <InvoiceProvider allCategories={categories} allInvoices={invoices} allServices={services} allAppointments={appointments}>
            <div>
                {children}
            </div>
        </InvoiceProvider>

    )
}
