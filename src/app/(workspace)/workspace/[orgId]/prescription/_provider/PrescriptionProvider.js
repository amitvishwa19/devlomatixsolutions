'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'


export const PrescriptionContext = createContext()


export const PrescriptionProvider = ({ children, allCategories, allPrescriptions, allAppointments }) => {
    const [category, setCategory] = useState(null)
    const [prescriptions, setPrescriptions] = useState(null)
    const [appointments, setAppointments] = useState(null)

    useEffect(() => {
        setAppointments(allAppointments)
        setCategory(allCategories)
        setPrescriptions(allPrescriptions)
    }, [allCategories, allPrescriptions])






    return (
        <PrescriptionContext.Provider value={{ category, setCategory, prescriptions, setPrescriptions, appointments }}>
            {children}
        </PrescriptionContext.Provider>
    )

}

export const usePrescription = () => useContext(PrescriptionContext)