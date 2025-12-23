'use client'
import { useOrg } from '@/providers/OrgProvider'
import { ROLE } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'


export const PatientContext = createContext()


export const PatientProvider = ({ children, allCategories, allPatients }) => {
    const [patients, setPatients] = useState(allPatients)
    const [category, setCategory] = useState(allCategories)
    const [selectedPatient, setSelectedPatient] = useState(null)

    useEffect(() => {
        setPatients(allPatients)
    }, [])



    function patientsMapData() {
        return users?.filter(user => user.role === ROLE.PATIENT)
    }

    return (
        <PatientContext.Provider value={{ patients, patientsMapData, selectedPatient, setSelectedPatient, category, setCategory }}>
            {children}
        </PatientContext.Provider>
    )

}

export const usePatient = () => useContext(PatientContext)