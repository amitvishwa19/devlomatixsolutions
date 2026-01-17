'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'


export const AppointmentContext = createContext()


export const AppointmentProvider = ({ children, allCategories }) => {
    const [category, setCategory] = useState(null)
    const [invoices, setInvoices] = useState(null)
    const [services, setServices] = useState(null)
    const [appointments, setAppointments] = useState(null)

    useEffect(() => {
        setCategory(allCategories)
    }, [allCategories])






    return (
        <AppointmentContext.Provider value={{ category, setCategory }}>
            {children}
        </AppointmentContext.Provider>
    )

}

export const useAppointment = () => useContext(AppointmentContext)