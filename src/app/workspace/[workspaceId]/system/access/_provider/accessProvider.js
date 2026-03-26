'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'


export const AccessContext = createContext()


export const AccessProvider = ({ children }) => {
    const { workspaceId } = useParams()
    const [users, setUsers] = useState([])
    const [roles, setRoles] = useState([])
    const [permissions, setPermissions] = useState([])
    const [departments, setDepartments] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchAccessData = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/workspace/${workspaceId}/access`)
            if (!response.ok) throw new Error('Failed to fetch access data')
            const data = await response.json()
            
            setUsers(data.users || [])
            setRoles(data.roles || [])
            setPermissions(data.permissions || [])
            setDepartments(data.departments || [])
        } catch (error) {
            console.error('Error fetching access data:', error)
            toast.error('Failed to load access management data')
        } finally {
            setLoading(false)
        }
    }, [workspaceId])

    useEffect(() => {
        if (workspaceId) {
            fetchAccessData()
        }
    }, [workspaceId, fetchAccessData])

    return (
        <AccessContext.Provider value={{ users, setUsers, permissions, setPermissions, roles, setRoles, departments, setDepartments, loading }}>
            {children}
        </AccessContext.Provider>
    )

}

export const useAccess = () => useContext(AccessContext)