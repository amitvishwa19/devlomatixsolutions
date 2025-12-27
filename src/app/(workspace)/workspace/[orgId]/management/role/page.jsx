'use client'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Shield, ShieldUser } from 'lucide-react'
import React, { useState } from 'react'
import RoleEditor from '../_components/role/RoleEditor'

export default function RolePage() {

    const [roleEditor, setRoleEditor] = useState({
        isOpen: false,
        mode: 'add',
        role: null
    })

    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-md border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Roles</h2>
                    <h2 className='text-xs text-muted-foreground'>Manage user roles and their associated permissions.</h2>
                </div>

                <div>
                    <Button variant={'save'} size='sm' onClick={() => {
                        setRoleEditor({
                            isOpen: true
                        })
                    }}>
                        <ShieldUser className='h-4 w-4' />
                        Add Role
                    </Button>
                </div>
            </div>

            <ScrollArea className='h-[85vh] flex flex-grow dark:bg-darkSecondaryBackground rounded-md pr-4 border'>
                <div className='flex flex-col gap-4 p-2'>









                </div>
                <RoleEditor
                    isOpen={roleEditor.isOpen}
                    onClose={() => {
                        setRoleEditor({
                            isOpen: false,
                            role: null
                        })
                    }}
                />
            </ScrollArea>
        </div>
    )
}
