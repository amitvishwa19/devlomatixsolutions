'use client'
import { useSession } from 'next-auth/react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'


export const InvoiceContext = createContext()


export const InvoiceProvider = ({ children, allCategories, allInvoices, allServices, allAppointments }) => {
    const [category, setCategory] = useState(null)
    const [invoices, setInvoices] = useState(null)
    const [services, setServices] = useState(null)
    const [appointments, setAppointments] = useState(null)
    const { data: session } = useSession()

    useEffect(() => {
        setCategory(allCategories)
        setInvoices(allInvoices)
        setServices(allServices)
        setAppointments(allAppointments)
    }, [allCategories, allInvoices, allServices, appointments])






    return (
        <InvoiceContext.Provider value={{ invoices, setInvoices, category, setCategory, services, appointments }}>
            {children}
        </InvoiceContext.Provider>
    )

}

export const useInvoice = () => useContext(InvoiceContext)