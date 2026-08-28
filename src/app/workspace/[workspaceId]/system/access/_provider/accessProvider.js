'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { getAccessData } from '../_actions/get-access-data'

export const AccessContext = createContext()

export const AccessProvider = ({ children }) => {
  const { workspaceId } = useParams()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [previewRole, setPreviewRole] = useState(null)

  const fetchAccessData = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getAccessData({ workspaceId })
      if (result?.data) {
        setUsers(result.data.users || [])
        setRoles(result.data.roles || [])
        setPermissions(result.data.permissions || [])
        setDepartments(result.data.departments || [])
      } else {
        throw new Error(result?.message || 'Failed to load access data')
      }
    } catch (error) {
      console.error('Error fetching access data via server action:', error)
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

  const resolveRolePermissions = useCallback((roleId) => {
    if (!roleId) return [];
    const role = roles.find(r => r.id === roleId);
    if (!role) return [];

    let allPermissions = [...(role.permissions || [])];
    
    // Recursive inheritance
    if (role.parentId) {
      const parentPermissions = resolveRolePermissions(role.parentId);
      // Merge unique permissions
      parentPermissions.forEach(pp => {
        if (!allPermissions.find(p => p.id === pp.id)) {
          allPermissions.push(pp);
        }
      });
    }
    
    return allPermissions;
  }, [roles]);

  const activePermissions = useMemo(() => {
    if (previewRole) {
      return resolveRolePermissions(previewRole.id);
    }
    return [];
  }, [previewRole, resolveRolePermissions]);

  return (
    <AccessContext.Provider value={{ 
      users, setUsers, 
      permissions, setPermissions, 
      roles, setRoles, 
      departments, setDepartments, 
      loading, 
      previewRole, setPreviewRole,
      resolveRolePermissions,
      activePermissions,
      fetchAccessData
    }}>
      {children}
    </AccessContext.Provider>
  )
}

export const useAccess = () => useContext(AccessContext)