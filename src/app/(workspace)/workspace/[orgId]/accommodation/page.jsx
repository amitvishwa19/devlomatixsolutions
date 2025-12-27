'use client'
import React, { useMemo, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bed, BedDouble, DoorOpen, Users, Activity, Hospital, Search, Plus, LayoutDashboard } from 'lucide-react';
import { useHospitalData } from './_hooks/useHospitalData';
import { toast } from 'sonner';
import { Tabs } from '@/components/ui/tabs';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, } from "@/components/ui/button-group"
import { Button } from '@/components/ui/button';
import { DynamicIcon } from 'lucide-react/dynamic';
import { LiveIndicator } from './_components/shared/LiveIndicator';
import Dashboard from './_components/page/Dashboard';
import Rooms from './_components/page/Rooms';
import Beds from './_components/page/Beds';
import Status from './_components/page/Status';



const roomTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'general', label: 'General' },
    { value: 'icu', label: 'ICU' },
    { value: 'private', label: 'Private' },
    { value: 'semi-private', label: 'Semi-Private' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'pediatric', label: 'Pediatric' },
    { value: 'maternity', label: 'Maternity' },
];



export default function AccommodationDashboard() {

    const routes = [
        { label: 'Dashboard', value: 'dashboard', icon: 'layout-dashboard', component: <Dashboard /> },
        { label: 'Rooms', value: 'rooms', icon: 'door-open', component: <Rooms /> },
        { label: 'Beds', value: 'beds', icon: 'bed-double', component: <Beds /> },

    ]

    const { rooms, allBeds, stats, lastUpdate, assignPatientToBed, dischargeBed, addRoom, addBed } = useHospitalData();
    const [active, setActive] = useState(routes[0])

    const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
    const [isCreateRoomDialogOpen, setIsCreateRoomDialogOpen] = useState(false);





    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-md border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl flex flex-row items-center gap-2'>
                        <Bed className='h-5 w-5 text-sky-500' />
                        Inpatient Accommodation Management
                    </h2>
                    <h2 className='text-xs text-muted-foreground'>Centralized management of hospital rooms and beds to optimize occupancy and improve patient flow.</h2>
                </div>

                <LiveIndicator lastUpdate={lastUpdate} />

                <div>
                    <ButtonGroup>
                        {routes?.map((item) => (
                            <Button
                                key={item.value}
                                size='sm' variant='outline'
                                className={`bg-primary/10 hover:bg-primary/20 dark:hover:bg-darkFocusColor ${active.value === item.value && 'bg-primary/20 dark:bg-darkFocusColor'}`}
                                onClick={() => { setActive(item) }}
                            >
                                <div className='flex flex-row gap-2 items-center'>
                                    <DynamicIcon name={item.icon} className={`${active.value === item.value && 'text-sky-500'}`} />
                                    <span>{item.label}</span>
                                </div>
                            </Button>
                        ))}

                    </ButtonGroup>
                </div>

            </div>

            <ScrollArea className='h-[85vh] flex flex-grow dark:bg-darkSecondaryBackground rounded-md p-2 border'>
                {active.component}
            </ScrollArea>
        </div>
    )
}
