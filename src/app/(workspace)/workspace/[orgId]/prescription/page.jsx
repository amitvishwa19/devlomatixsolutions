'use client'
import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FilePlus, Eye, Pencil, Trash2, User, Stethoscope, } from 'lucide-react';
import { AddPrescriptionDialog, PrescriptionEditor } from './_components/PrescriptionEditor';
import { usePrescription } from './_provider/PrescriptionProvider';
import CategoryHierarchy from '../../_components/CategoryHierarchy';
import { PrescriptionStats } from './_components/PrescriptionStats';
import { CustomBadge } from '../(misc)/_components/CustomBadge';
import { DynamicIcon } from 'lucide-react/dynamic';
import { HoverCard, HoverCardContent, HoverCardTrigger, } from "@/components/ui/hover-card"
import { format } from 'date-fns';
import PrescriptionView from './_components/PrescriptionView';
import { PrescriptionDelete } from './_components/PrescriptionDelete';
import { DataTable } from '../(misc)/_components/DataTable';

export default function PrescriptionPage() {

    const { category, setCategory, prescriptions, setPrescriptions, appointments } = usePrescription()



    const [prescriptionEditor, setPrescriptionEditor] = useState({
        isOpen: false,
        mode: 'view',
        prescription: null,
    })

    const [prescriptionView, setPrescriptionView] = useState({
        isOpen: false,
        mode: 'view',
        prescription: null,
    })

    const [prescriptionDelete, setPrescriptionDelete] = useState({
        isOpen: false,
        mode: 'delete',
        prescription: null,
    })

    const handleViewPrescription = (prescription) => {
        setSelectedPrescription(prescription);
        setDetailOpen(true);
    };

    const handleStatusChange = (id) => {
        setPrescriptions((prev) =>
            prev.map((p) =>
                p.id === id
                    ? {
                        ...p,
                        status,
                        updatedAt: new Date(),
                        dispensedAt: status === 'dispensed' ? new Date() : p.dispensedAt,
                    }
                    : p
            )
        );
        setDetailOpen(false);
        toast({
            title: status === 'dispensed' ? 'Prescription Dispensed' : 'Prescription Cancelled',
            description: `Prescription has been marked as ${status}`,
        });
    };

    const handleAddPrescription = (newPrescription) => {
        const now = new Date();
        const prescription = {
            ...newPrescription,
            id: `${prescriptions.length + 1}`,
            prescriptionNumber: `RX-2024-${String(prescriptions.length + 1).padStart(3, '0')}`,
            createdAt: now,
            updatedAt: now,
        };
        setPrescriptions((prev) => [prescription, ...prev]);
        toast({
            title: 'Prescription Created',
            description: `${prescription.prescriptionNumber} has been created successfully`,
        });
    };


    const columns = [
        {

            header: "Patient",
            cell: ({ row }) => {
                return (
                    <div className='flex flex-row items-center gap-2'>
                        <User className='h-5 w-5 text-sky-500' />
                        <div className='flex flex-col'>
                            {row?.original?.appointment?.patient?.displayName}
                            <span className='text-xs text-muted-foreground'>{row?.original?.sku}</span>
                        </div>

                    </div>
                )
            }
        },
        {

            header: "Doctor",
            cell: ({ row }) => {
                return (
                    <div className='flex flex-row items-center gap-2'>
                        <Stethoscope className='h-4 w-4 text-green-500' />
                        <div className='flex flex-col'>
                            {row?.original?.appointment?.doctor?.displayName}
                            <span className='text-xs text-muted-foreground'>{row?.original?.appointment?.doctor?.profile?.speciality || 'General Medicine'}</span>
                        </div>

                    </div>

                )
            }
        },
        {
            accessorKey: "diagnosis",
            header: "Diagnosis",
            cell: ({ row }) => {
                // { row?.original?.diagnosis?.slice(0, 20) }
                return (
                    <HoverCard>
                        <HoverCardTrigger>{row?.original?.diagnosis?.slice(0, 20)}...</HoverCardTrigger>
                        <HoverCardContent className='text-xs text-muted-foreground'>
                            {row?.original?.diagnosis}
                        </HoverCardContent>
                    </HoverCard>
                )
            }
        },
        {
            accessorKey: "medication",
            header: "Medication",
            cell: ({ row }) => {
                return (
                    <span>{row?.original?.items?.length} item</span>
                )
            }
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => {
                return (
                    <span>
                        {format(row?.original?.createdAt, 'dd MMM yy')}
                    </span>
                )
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {

                return (
                    <div className=''>
                        <CustomBadge status={row.original.status}>
                            {row.original.status}
                        </CustomBadge>
                    </div>
                )
            }
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => {
                return (
                    <div>
                        {row.original.category ?
                            <CustomBadge status='medium' >
                                {row?.original?.category?.icon && <DynamicIcon size={14} name={row.original.category?.icon} className='mr-2' />}
                                <span className='text-xs'>{row.original.category?.name}</span>
                            </CustomBadge> :
                            <CustomBadge status='na' className='text-xs'><span className='text-xs'>Not Assigned</span></CustomBadge>
                        }

                    </div>
                )
            }
        },
        {
            id: 'action',
            header: "Actions",
            cell: ({ row }) => {

                return (
                    <div className='flex flex-row items-center gap-4'>
                        <Eye size={16} className='cursor-pointer' onClick={() => {
                            setPrescriptionView({
                                isOpen: true,
                                mode: 'view',
                                prescription: row.original
                            })
                        }} />
                        <Pencil size={16} className='cursor-pointer' onClick={() => {
                            setPrescriptionEditor({
                                isOpen: true,
                                mode: 'edit',
                                prescription: row.original,
                            })
                        }} />
                        <Trash2 size={16} className='cursor-pointer' onClick={() => {
                            setPrescriptionDelete({
                                isOpen: true,
                                prescription: row.original
                            })
                        }} />
                    </div>
                )
            }
        },

    ]

    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-md border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Prescription Management</h2>
                    <h2 className='text-xs text-muted-foreground'>Digital Prescriptions: Doctors create Rx with dosage, frequency, duration, and instructions</h2>
                </div>
                <div>
                    <Button variant='save' size='sm' onClick={() => setPrescriptionEditor({
                        isOpen: true,
                        mode: 'add',
                        prescription: null,
                    })}>
                        <FilePlus />
                        Add Prescription
                    </Button>
                </div>
            </div>

            <ScrollArea className='h-[85vh] flex flex-grow dark:bg-darkSecondaryBackground p-2 rounded-md border'>


                <div className='flex flex-col gap-4 p-2'>

                    <PrescriptionStats prescriptions={prescriptions} />
                    <div className='flex flex-row gap-2 w-full '>


                        <div className='min-w-[75%]'>
                            <DataTable
                                columns={columns}
                                data={prescriptions}
                                onFiltersChange={(e) => { console.log('filter change', e) }}
                                filterTitle='Search prescription items......'
                            />
                        </div>

                        <div className='w-full'>
                            <CategoryHierarchy
                                title='Prescription Hierarchy'
                                category={category}
                                onUpdate={(c) => { setCategory(c) }}
                            />
                        </div>


                    </div>



                    <PrescriptionEditor
                        isOpen={prescriptionEditor.isOpen}
                        mode={prescriptionEditor.mode}
                        appointments={appointments}
                        prescription={prescriptionEditor.prescription}
                        categories={category?.children}
                        onClose={() => {
                            setPrescriptionEditor({
                                isOpen: false
                            })
                        }}
                        onSave={(prescription) => {
                            if (prescription) {
                                setPrescriptions(prev =>
                                    prev.some(item => item.id === prescription.id)
                                        ? prev.map(item =>
                                            item.id === prescription.id ? { ...item, ...prescription } : item
                                        )
                                        : [prescription, ...prev]
                                );
                            }
                        }}

                    />

                    <PrescriptionView
                        isOpen={prescriptionView.isOpen}
                        prescription={prescriptionView.prescription}
                        onClose={() => {
                            setPrescriptionView({
                                isOpen: false
                            })
                        }}
                    />

                    <PrescriptionDelete
                        isOpen={prescriptionDelete.isOpen}
                        prescription={prescriptionDelete.prescription}
                        onClose={() => {
                            setPrescriptionDelete({
                                isOpen: false,
                                prescription: null
                            })
                        }}
                        onSave={(p) => {
                            setPrescriptions(prescriptions?.filter(pres => pres.id !== p.id))
                            setPrescriptionDelete({
                                isOpen: false,
                                prescription: null
                            })
                        }}
                    />

                </div>

            </ScrollArea>

        </div >
    )
}
