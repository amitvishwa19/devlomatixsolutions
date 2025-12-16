'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'


export const ServiceContext = createContext()


export const ServiceProvider = ({ children, categories, allServices }) => {
    const [posts, setPosts] = useState([])
    const [department, setDepartment] = useState([])
    const [services, setServices] = useState([])
    const [tags, setTags] = useState([])

    useEffect(() => {
        setDepartment(categories)
        setServices(allServices)
    }, [categories, allServices])






    return (
        <ServiceContext.Provider value={{ department, services, setServices }}>
            {children}
        </ServiceContext.Provider>
    )

}

export const useService = () => useContext(ServiceContext)