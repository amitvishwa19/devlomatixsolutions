'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from'react'
import { useParams } from'next/navigation'
import { toast } from'sonner'


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
  const response = await fetch(`/api/workspace/${workspaceId}/access`)
  if (!response.ok) throw new Error(`Failed to fetch access data: ${response.status}`)
  
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Expected JSON but received:", text.substring(0, 100));
    return;
  }

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
    // Fallback to real user roles logic (needs user integration)
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
      activePermissions
    }}>
 {children}
 </AccessContext.Provider>
 )

}

export const useAccess = () => useContext(AccessContext)