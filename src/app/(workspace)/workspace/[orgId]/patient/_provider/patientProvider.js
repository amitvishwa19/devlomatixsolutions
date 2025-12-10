'use client'
import { useOrg } from '@/providers/OrgProvider'
import { ROLE } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'


export const PatientContext = createContext()


export const PatientProvider = ({ children }) => {
    const { data: session } = useSession()
    const { users } = useOrg()
    const [patients, setPatients] = useState()
    const [selectedPatient, setSelectedPatient] = useState(null)

    useEffect(() => {
        setPatients(users?.filter(user => user.role === ROLE.PATIENT))
    }, [])

    function patientsMapData() {
        return users?.filter(user => user.role === ROLE.PATIENT)
    }

    return (
        <PatientContext.Provider value={{ patients, patientsMapData, selectedPatient, setSelectedPatient }}>
            {children}
        </PatientContext.Provider>
    )

}

export const usePatient = () => useContext(PatientContext)