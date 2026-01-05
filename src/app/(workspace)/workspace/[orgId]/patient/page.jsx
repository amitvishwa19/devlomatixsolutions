'use client'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { ArrowUpDown, Eye, FilePenLine, MoreHorizontal, Pencil, Save, Trash2, UserPlus } from "lucide-react"
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
import PatientEditor from './_component/patient-management/PatientEditor'

import CategoryHierarchy from '../../_components/CategoryHierarchy'
import { usePatient } from './_provider/patientProvider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import PatientAdd from './_component/patient-management/PatientAdd'
import { ContentTopbar } from '../(misc)/_components/ContentTopbar'
import { DataTable } from '../(misc)/_components/DataTable'


export default function PatientPage() {

    const { category, setCategory, patients, setPatients } = usePatient()
    const [loading, setLoading] = useState(true)
    const { onOpen, refresh } = useModal()

    const [patientEditor, setPatientEditor] = useState({
        isOpen: false,
        mode: 'add',
        patient: null,
    })

    const [patientAdd, setPatientAdd] = useState({
        isOpen: false,
        mode: 'add',
        patient: null,
    })


    const tempData = patients?.map(user => ({
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

    const columns = [

        {
            accessorKey: "patient",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Patient
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {

                return (
                    <div className='flex flex-row items-center gap-4'>
                        <Avatar className='rounded-md'>
                            <AvatarImage src={row?.orignal?.user?.avatar} alt="@shadcn" />
                            <AvatarFallback className='rounded-md bg-sky-500 text-xl font-bold'>{row.original.user.displayName.substring(0, 1)}</AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                            <span>{row.original.user.displayName}</span>
                            <span className='text-[10px] text-muted-foreground'>{row.original.user.uuid}</span>
                        </div>

                    </div>
                )
            }
        },
        {
            accessorKey: "dob",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Date of Birth
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const dob = row.original.user?.medicalProfile?.personal?.dob
                return (
                    <div className='text-center'>
                        {dob ? moment(dob).format('MMMM Do, YYYY') : 'NA'}
                    </div>
                )
            }
        },
        {
            accessorKey: "phone",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Phone
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const mobile = row.original.user?.medicalProfile?.personal?.contact
                return (
                    <div className='text-center'>
                        {mobile ? mobile : 'NA'}
                    </div>
                )
            }
        },
        {
            accessorKey: "age",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Age
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ((row) => {

                return (
                    <div>

                    </div>
                )
            })
        },
        {
            accessorKey: "gender",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Gender
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "bloodgroup",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Blood Group
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        // {
        //     accessorKey: "lastvisit",
        //     header: ({ column }) => {
        //         return (
        //             <Button
        //                 variant="ghost"
        //                 onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        //             >
        //                 Last Visit
        //                 <ArrowUpDown className="ml-2 h-4 w-4" />
        //             </Button>
        //         )
        //     },
        //     cell: ({ row }) => {
        //         return (
        //             <div>

        //                 {moment(row.original.updatedAt).subtract(1, 'days').calendar()}
        //             </div>
        //         )
        //     }
        // },
        {
            id: "actions",
            cell: ({ row }) => {
                const patient = row.original
                return (

                    <div className='flex flex-row items-center gap-4'>
                        <Eye className='h-4 w-4 cursor-pointer' onClick={() => {
                            setPatientEditor({
                                isOpen: true,
                                mode: 'view',
                                patient: row.original,
                            })
                        }} />
                        <Pencil className='h-4 w-4 cursor-pointer' />

                    </div>
                )
            },
        },

    ]


    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>



            <ContentTopbar
                title='Patients'
                description='Search and access patient records using multiple criteria for efficient clinical operations'
                icon='accessibility'
                actionComp={<Button
                    variant={'save'}
                    size={'sm'}
                    onClick={() => {
                        setPatientAdd({
                            isOpen: true,
                            mode: 'add',
                            patient: null,
                        })
                    }}
                >
                    <Save />
                    Add New Patient
                </Button>}
            />


            <ScrollArea className='h-[85vh] w-full'>
                <div className='flex flex-col gap-4 p-2'>


                    <div className='flex flex-row gap-2 w-full '>


                        <div className='min-w-[75%]'>
                            <DataTable
                                columns={columns}
                                data={tempData}
                                onFiltersChange={(e) => { console.log('filter change', e) }}
                                filterTitle='Search invoice items......'
                            />
                        </div>

                        <div className='w-full'>
                            <CategoryHierarchy
                                title='Patient Hierarchy'
                                data={[]}
                                category={category}
                                onUpdate={(c) => { setCategory(c) }}
                            />
                        </div>


                    </div>
                    <PatientEditor
                        isOpen={patientEditor.isOpen}
                        onClose={() => {
                            setPatientEditor({
                                isOpen: false,
                            })
                        }}
                        patient={patientEditor.patient}
                        mode={patientEditor.mode}
                        onSave={(patient) => {
                            if (patient) {
                                setPatients(prev =>
                                    prev.some(item => item.id === patient.id)
                                        ? prev.map(item =>
                                            item.id === patient.id ? { ...item, ...patient } : item
                                        )
                                        : [patient, ...prev]
                                );
                            }
                        }}
                    />


                    <PatientAdd
                        isOpen={patientAdd.isOpen}
                        onClose={() => {
                            setPatientAdd({
                                isOpen: false
                            })
                        }}
                        onSave={(patient) => {
                            if (patient) {
                                setPatients(prev =>
                                    prev.some(item => item.id === patient.id)
                                        ? prev.map(item =>
                                            item.id === patient.id ? { ...item, ...patient } : item
                                        )
                                        : [patient, ...prev]
                                );
                            }
                        }}
                    />
                </div>
            </ScrollArea>




        </div>
    )
}


