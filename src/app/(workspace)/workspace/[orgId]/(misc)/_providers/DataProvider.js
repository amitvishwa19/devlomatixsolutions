"use client";
import { createContext, useContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAppointments } from "../../appointment/_redux/appointment-slice";
import { useOrg } from "@/providers/OrgProvider";

export const DataContext = createContext(null);

export default function DataProvider({ children }) {
    const { server } = useOrg()
    const dispatch = useDispatch()
    const appointment = { id: '12rerefe43ed', name: 'Devlomatix solutions' }

    console.log('@DataProvider loaded')

    useEffect(() => {
        if (server) {
            dispatch(setAppointments(JSON.stringify(server?.appointments)))
        }
    }, [server])



    return (
        <DataContext.Provider value={appointment}>
            {children}
        </DataContext.Provider>
    );
}

export const useData = () => useContext(DataContext)