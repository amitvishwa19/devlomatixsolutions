'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'


export const AccessContext = createContext()


export const AccessProvider = ({ children, allUsers, allRoles, allPermissions, allDepartments }) => {
    const initialized = useRef(false)
    const [users, setUsers] = useState([])
    const [roles, setRoles] = useState([])
    const [permissions, setPermissions] = useState([])
    const [departments, setDepartments] = useState([])


    // const [users, setUsers] = useState(allUsers)
    // const [roles, setRoles] = useState(allRoles)
    // const [permissions, setPermissions] = useState(allPermissions)
    // const [departments, setDepartments] = useState(allDepartments)

    useEffect(() => {
        setUsers(allUsers)
        setRoles(allRoles)
        setPermissions(allPermissions)
        setDepartments(allDepartments)
    }, [allUsers, allRoles, allPermissions, allDepartments])



    return (
        <AccessContext.Provider value={{ users, setUsers, permissions, setPermissions, roles, setRoles, departments, setDepartments }}>
            {children}
        </AccessContext.Provider>
    )

}

export const useAccess = () => useContext(AccessContext)