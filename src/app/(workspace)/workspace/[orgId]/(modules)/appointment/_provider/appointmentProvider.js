'use client'
import { useOrg } from '@/providers/OrgProvider'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'


export const AppointmentContext = createContext()


export const AppointmentProvider = ({ children, allCategories, allAppointments }) => {
    const { server } = useOrg()
    const [category, setCategory] = useState(null)
    const [appointments, setAppointments] = useState(null)



    useEffect(() => {
        setCategory(allCategories || [])
        setAppointments(allAppointments || [])
    }, [allCategories, allAppointments, server])






    return (
        <AppointmentContext.Provider value={{ category, setCategory, appointments, setAppointments }}>
            {children}
        </AppointmentContext.Provider>
    )

}

export const useAppointment = () => useContext(AppointmentContext)