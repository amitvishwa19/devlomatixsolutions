'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'


export const AccessContext = createContext()


export const AccessProvider = ({ children, allUsers, allRoles, allPermissions, allDepartments }) => {

    const [users, setUsers] = useState(null)
    const [permissions, setPermissions] = useState(null)
    const [roles, setRoles] = useState(null)
    const [departments, setDepartments] = useState(null)

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