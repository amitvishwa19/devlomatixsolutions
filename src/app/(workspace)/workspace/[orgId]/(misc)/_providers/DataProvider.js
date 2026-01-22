"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { useOrg } from "@/providers/OrgProvider";
import { ROLE } from "@prisma/client";
import { setAppointments } from "../../(modules)/appointment/_redux/appointment-slice";

export const DataContext = createContext(null);

export default function DataProvider({ children }) {
    const { server } = useOrg()
    const dispatch = useDispatch()
    const appointment = { id: '12rerefe43ed', name: 'Devlomatix solutions' }
    const { users } = useOrg()
    const [topNav, setTopNav] = useState(false)


    useEffect(() => {
        if (server) {
            dispatch(setAppointments(JSON.stringify(server?.appointments)))
        }
    }, [server])

    const patients = users?.filter(user => user.role === ROLE.PATIENT)

    return (
        <DataContext.Provider value={{ appointment, patients, topNav, setTopNav }}>
            {children}
        </DataContext.Provider>
    );
}

export const useData = () => useContext(DataContext)