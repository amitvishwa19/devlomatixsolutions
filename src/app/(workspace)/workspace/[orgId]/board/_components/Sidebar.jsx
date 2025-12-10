'use client'
import { Accordion } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { AppContext } from '@/providers/AppProvider'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import React, { useContext, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider';
import { SidebarNav } from './SidebarNav'
import { useLocalStorage } from '@uidotdev/usehooks'

export function Sidebar({ storageKey = 'sidebar-state' }) {

    const { activeOrg, handleUserLogout, user, roles, organizations, handleUserOrganizations } = useAuth()
    const [expanded, setExpanded] = useLocalStorage(storageKey, {})

    useEffect(() => {
        console.log('defaultAccordianValue', defaultAccordianValue)
    }, [])

    const defaultAccordianValue = Object.keys(expanded)
        .reduce((acc, key) => {
            if (expanded[key]) {
                acc.push(key)
            }
            return acc;
        }, [])

    const onExpand = (i) => {
        setExpanded((curr) => ({
            ...curr,
            [i]: !Boolean(expanded[i])
        }))
    }

    return (
        <>
            <div className='flex font-medium text-md mb-1 items-center'>

                <span>
                    Workspaces
                </span>


                <Button type='button' size='sm' variant='ghost' className='ml-auto' asChild>
                    <Link href={''}>
                        <Plus className=' h-4 w-4' />
                    </Link>
                </Button>
            </div>
            <Accordion type='multiple' defaultValue={defaultAccordianValue} className='space-y-2    '>

                {
                    organizations?.map((org) => (
                        'sidenav',
                        < SidebarNav
                            key={org?.id}
                            isActive={activeOrg?.id === org.id}
                            organization={org}
                            isExpanded={expanded[org.id]}
                            onExpand={onExpand}
                        />


                    ))
                }
            </Accordion>
        </>
    )
}
