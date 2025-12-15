'use client'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { ArrowUpDown, Eye, FilePenLine, MoreHorizontal, Trash2, UserPlus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem, } from "@/components/ui/dropdown-menu"
import { ColumnDef, VisibilityState, flexRender, ColumnFiltersState, getFilteredRowModel, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useModal } from '@/hooks/useModal'
import { useOrg } from '@/providers/OrgProvider'
import { ROLE } from '@prisma/client'
import { getAge } from '@/utils/functions'
import moment from 'moment'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, } from "@/components/ui/button-group"
import { DynamicIcon } from 'lucide-react/dynamic'
import PatientSearchPage from './_component/patient-search/PatientSearchPage'
import MedicalRecordsPage from './_component/medical-records/MedicalRecordsPage'
import BillingManagementPage from './_component/billing-management/BillingManagementPage'
import PatientManagementPage from './_component/patient-search/PatientManagementPage'


export default function PatientPage() {

    const [loading, setLoading] = useState(true)
    const { onOpen, refresh } = useModal()
    const { users } = useOrg()
    const patients = users?.filter(user => user.role === ROLE.PATIENT)

    const [active, setActive] = useState({ title: 'Patients', icon: 'accessibility', component: <PatientManagementPage /> })
    const nav = [
        // { title: 'Patients', icon: 'accessibility', component: <PatientManagementPage /> },
        // { title: 'Medical Records', icon: 'square-activity', component: <MedicalRecordsPage /> },
        // { title: 'Billing', icon: 'square-activity', component: <BillingManagementPage /> }
    ]

    const tempData = users?.filter(user => user.role === ROLE.PATIENT)
        .map(user => ({
            id: user.id,
            uuid: user.uuid,
            displayName: user?.medicalProfile?.personal?.firstname ? (user?.medicalProfile?.personal?.firstname + ' ' + user?.medicalProfile?.personal?.lastname) : user?.displayName,
            age: getAge(user?.medicalProfile?.personal?.dob) ? getAge(user?.medicalProfile?.personal?.dob) + ' Yrs' : 'NA',
            gender: user?.medicalProfile?.personal?.gender ? user?.medicalProfile?.personal?.gender : 'NA',
            phone: user?.medicalProfile?.contact?.basic?.phone ? user?.medicalProfile?.contact?.basic?.phone : 'NA',
            bloodgroup: user?.medicalProfile?.medicalInformation?.bloodGroup ? user?.medicalProfile?.medicalInformation?.bloodGroup : 'NA',
            lastvisit: moment(user?.medicalProfile?.updatedAt).format('MMMM Do YYYY'),
            user: user
        }))


    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>
            <div className='w-full dark:bg-[#151D24] p-4 rounded-lg border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Patients</h2>
                    <h2 className='text-xs text-white/50'>
                        Search and access patient records using multiple criteria for efficient clinical operations
                    </h2>
                </div>
                {/* <Button variant='outline' size='sm' onClick={() => { onOpen("patient-crud", { type: 'add' }) }}>Add Patient</Button> */}
                <ButtonGroup>
                    {nav.map((item) => (
                        <Button
                            key={item.title} variant='ghost'
                            size={'sm'}
                            className={`border w-40 capitalize hover:bg-primary/20 dark:hover:bg-darkFocusColor ${active.title === item.title && 'bg-primary/20 dark:bg-darkFocusColor'}`}
                            onClick={() => { setActive(item) }}
                        >
                            <DynamicIcon name={item.icon} />
                            <span>{item.title}</span>
                        </Button>
                    ))}
                </ButtonGroup>
            </div>


            {/* <div className='w-full dark:bg-[#151D24] p-4 rounded-lg border'>
                <DataTable columns={columns} data={tempData} />
            </div> */}
            <div className='h-full flex flex-grow w-full dark:bg-darkSecondaryBackground rounded-md py-2'>
                <ScrollArea className='h-[85vh] w-full p-2'>
                    {active.component}
                </ScrollArea>
            </div>

        </div>
    )
}


