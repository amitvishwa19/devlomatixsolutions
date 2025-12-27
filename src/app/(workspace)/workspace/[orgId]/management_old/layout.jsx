'use client'
import React, { useEffect } from 'react'
import { ManagementModalProvider } from './_provider/ManagementModalProvider'
import { useDispatch } from 'react-redux'
import { management } from './_action/management'
import { useAction } from '@/hooks/use-action'
import { useOrg } from '@/providers/OrgProvider'
import { setLoading } from '@/redux/slices/org'
import { setPermissions, setRoles, setUsers } from './_redux/management-slice'
import { toast } from 'sonner'

export default function ManagementLayout({ children }) {
    const dispatch = useDispatch()
    const { server } = useOrg()

    useEffect(() => {
        dispatch(setLoading(true))
        execute({ serverId: server?.id })

    }, [server])


    const { execute } = useAction(management, {
        onSuccess: (data) => {
            //console.log(data)
            dispatch(setLoading(false))
            dispatch(setUsers(JSON.stringify(data.users)))
            dispatch(setPermissions(JSON.stringify(data?.permissions)))
            dispatch(setRoles(JSON.stringify(data?.roles)))

        },
        onError: (error) => {
            setLoading(false)
            console.log(error.message)
        }
    })


    return (
        <div>
            <ManagementModalProvider />
            {children}
        </div>
    )
}
