'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'


export const ServiceContext = createContext()


export const ServiceProvider = ({ children, categories, allServices }) => {

    const [department, setDepartment] = useState([])
    const [services, setServices] = useState([])


    useEffect(() => {
        setDepartment(categories)
        setServices(allServices)
    }, [categories, allServices])






    return (
        <ServiceContext.Provider value={{ department, setDepartment, services, setServices }}>
            {children}
        </ServiceContext.Provider>
    )

}

export const useService = () => useContext(ServiceContext)