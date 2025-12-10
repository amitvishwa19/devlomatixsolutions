'use client'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import React, { useState } from 'react'
import { InventoryDialog } from './_components/InventoryDialog';
import { useModal } from '@/hooks/useModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, } from "@/components/ui/button-group"
import { InventoryDashboard } from './_components/InventoryDashboard';
import { InventoryTable } from './_components/InventoryTable';




export default function InventoryPage() {
    const [active, setActive] = useState({ id: 'dashboard', component: <InventoryDashboard /> })
    const nav = [
        { id: 'dashboard', icon: '', component: <InventoryDashboard /> },
        { id: 'inventory', icon: '', component: <InventoryTable /> }
    ]
    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-lg border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Inventory</h2>
                    <h2 className='text-xs text-muted-foreground'>Manage hospital inventory items</h2>
                </div>
                <div>
                    {/* <Button variant='outline' size='sm' onClick={() => setAddDialogOpen(true)}>
                        Add Prescription
                    </Button> */}
                    <ButtonGroup>
                        {nav.map(item => (
                            <Button
                                variant={'ghost'}
                                size='sm' key={item.id}
                                className={`border w-32 ${active.id === item.id && 'bg-primary/20 dark:bg-darkFocusColor'}`}
                                onClick={() => { setActive(item) }}
                            >
                                <p className=' capitalize'> {item.id}</p>
                            </Button>
                        ))}
                    </ButtonGroup>
                </div>
            </div>

            <ScrollArea className='h-[85vh] flex flex-grow dark:bg-darkSecondaryBackground p-2 rounded-md pr-4'>
                <div>
                    {active.component}
                </div>
            </ScrollArea>

        </div >
    )
}
