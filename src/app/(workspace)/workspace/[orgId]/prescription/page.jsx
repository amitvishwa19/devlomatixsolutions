'use client'
import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle2, XCircle, Plus, Pill, FilePlus, Eye, Pencil, Trash2, } from 'lucide-react';
import { StatsCard } from './_components/StatsCard';
import { PrescriptionList } from './_components/PrescriptionList';
import { PrescriptionDetail } from './_components/PrescriptionDetai';
import { AddPrescriptionDialog, PrescriptionEditor } from './_components/PrescriptionEditor';
import { mockPrescriptions } from './data';
import { usePrescription } from './_provider/PrescriptionProvider';
import CategoryHierarchy from '../../_components/CategoryHierarchy';
import { PrescriptionStats } from './_components/PrescriptionStats';
import { CustomBadge } from '../(misc)/_components/CustomBadge';
import DataTable from '../../_components/DataTable';
import { DynamicIcon } from 'lucide-react/dynamic';


export default function PrescriptionPage() {
    //const [prescriptions, setPrescriptions] = useState(mockPrescriptions);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const { category, setCategory, prescriptions, setPrescriptions, appointments } = usePrescription()

    // const stats = {
    //     total: prescriptions.length,
    //     pending: prescriptions.filter((p) => p.status === 'pending').length,
    //     dispensed: prescriptions.filter((p) => p.status === 'dispensed').length,
    //     cancelled: prescriptions.filter((p) => p.status === 'cancelled').length,
    // };

    const [prescriptionEditor, setPrescriptionEditor] = useState({
        isOpen: false,
        mode: 'view',
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
            accessorKey: "sku",
            header: "Invoice#",
        },
        {
            accessorKey: "subtotal",
            header: "Sub Total",
            cell: ({ row }) => {
                return (
                    <span>₹ {row.original.subtotal}</span>
                )
            }
        },
        {
            accessorKey: "tax",
            header: "Tax/GST",
            cell: ({ row }) => {
                return (
                    <span>₹ {row.original.tax}</span>
                )
            }
        },
        {
            accessorKey: "discount",
            header: "Discount",
            cell: ({ row }) => {
                return (
                    <span>₹ {row.original.discount}</span>
                )
            }
        },
        {
            accessorKey: "totalAmount",
            header: "Total Amount",
            cell: ({ row }) => {
                return (
                    <span>₹ {row.original.totalAmount}</span>
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
                            <CustomBadge status='blank' className='text-xs'><span>No Category Assigned</span></CustomBadge>
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
                            setInvoiceViewer({
                                isOpen: true,
                                mode: 'view',
                                invoice: row.original,
                            })
                        }} />
                        <Pencil size={16} className='cursor-pointer' onClick={() => {
                            setInvoiceEditor({
                                isOpen: true,
                                mode: 'edit',
                                invoice: row.original,
                            })
                        }} />
                        <Trash2 size={16} className='cursor-pointer' onClick={() => { }} />
                    </div>
                )
            }
        },

    ]

    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-lg border flex flex-row items-center justify-between'>
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

            <ScrollArea className='h-[85vh] flex flex-grow dark:bg-darkSecondaryBackground p-2 rounded-md '>


                <div className='flex flex-col gap-4 p-2'>

                    <PrescriptionStats invoices={prescriptions} />
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

                </div>

                {/* Prescription Detail Dialog */}
                <PrescriptionDetail
                    prescription={selectedPrescription}
                    open={detailOpen}
                    onOpenChange={setDetailOpen}
                    onStatusChange={handleStatusChange}
                />

                {/* Add Prescription Dialog */}
                {/* <AddPrescriptionDialog
                    open={addDialogOpen}
                    onOpenChange={setAddDialogOpen}
                    onAdd={handleAddPrescription}
                /> */}

            </ScrollArea>

        </div >
    )
}
