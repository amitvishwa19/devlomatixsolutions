'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'


export const AccessContext = createContext()


export const AccessProvider = ({ children, allUsers, allRoles, allPermissions }) => {

    const [users, setUsers] = useState(null)
    const [permissions, setPermissions] = useState(null)
    const [roles, setRoles] = useState(null)

    useEffect(() => {
        setUsers(allUsers)
        setRoles(allRoles)
        setPermissions(allPermissions)
    }, [allUsers, allRoles, allPermissions])






    return (
        <AccessContext.Provider value={{ users, setUsers, permissions, setPermissions, roles, setRoles }}>
            {children}
        </AccessContext.Provider>
    )

}

export const useAccess = () => useContext(AccessContext)