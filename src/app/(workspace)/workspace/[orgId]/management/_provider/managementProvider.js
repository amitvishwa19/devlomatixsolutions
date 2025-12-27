'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'


export const ManagementContext = createContext()


export const ManagementProvider = ({ children, allUsers, allRoles, allPermissions }) => {

    const [users, setUsers] = useState(null)
    const [permissions, setPermissions] = useState(null)
    const [roles, setRoles] = useState(null)

    useEffect(() => {
        setUsers(allUsers)
        setRoles(allRoles)
        setPermissions(allPermissions)
    }, [allUsers, allRoles, allPermissions])






    return (
        <ManagementContext.Provider value={{ users, setUsers, permissions, setPermissions, roles, setRoles }}>
            {children}
        </ManagementContext.Provider>
    )

}

export const useManagement = () => useContext(ManagementContext)