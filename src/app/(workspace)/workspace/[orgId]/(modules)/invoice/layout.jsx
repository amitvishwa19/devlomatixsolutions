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



    return (
        <InvoiceProvider allCategories={[]} allInvoices={[]} allServices={[]} allAppointments={[]}>
            <div>
                {children}
            </div>
        </InvoiceProvider>

    )
}
