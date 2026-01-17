'use client'
import { ROLE } from '@prisma/client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'


export const FlowContext = createContext()


export const FlowProvider = ({ children, allUsers }) => {
    const [patients, setPatients] = useState(null)
    const [doctors, setDoctors] = useState(null)
    const [appointments, setAppointments] = useState(null)

    useEffect(() => {
        setPatients(allUsers?.filter(usr => usr.role === ROLE.PATIENT))
        setDoctors(allUsers?.filter(usr => usr.role === ROLE.DOCTOR))
    }, [])






    return (
        <FlowContext.Provider value={{ patients, doctors }}>
            {children}
        </FlowContext.Provider>
    )

}

export const useFlow = () => useContext(FlowContext)