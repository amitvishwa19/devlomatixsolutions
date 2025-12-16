"use client";
import { createContext, useContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAppointments } from "../../appointment/_redux/appointment-slice";
import { useOrg } from "@/providers/OrgProvider";
import { ROLE } from "@prisma/client";

export const DataContext = createContext(null);

export default function DataProvider({ children }) {
    const { server } = useOrg()
    const dispatch = useDispatch()
    const appointment = { id: '12rerefe43ed', name: 'Devlomatix solutions' }
    const { users } = useOrg()


    useEffect(() => {
        if (server) {
            dispatch(setAppointments(JSON.stringify(server?.appointments)))
        }
    }, [server])

    const patients = users?.filter(user => user.role === ROLE.PATIENT)

    return (
        <DataContext.Provider value={{ appointment, patients }}>
            {children}
        </DataContext.Provider>
    );
}

export const useData = () => useContext(DataContext)