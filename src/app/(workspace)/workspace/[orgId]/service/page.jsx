'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eye, HandHelping, IndianRupee, LayoutDashboard, Pencil, Plus, ReceiptIndianRupee, Trash2 } from 'lucide-react';
import { DynamicIcon } from 'lucide-react/dynamic';
import Dashboard from './_components/service-catalog-dashboard/Dashboard';
import { ScrollArea } from '@/components/ui/scroll-area';
import Service from './_components/service-management/Service';
import ServiceStats from './_components/service-management/ServiceStats';
import { useService } from './_provider/serviceProvider';
import CategoryHierarchy from '../../_components/CategoryHierarchy';
import { CustomBadge } from '../(misc)/_components/CustomBadge';
import ServiceEditor from './_components/service-management/ServiceEditor';
import ServiceDelete from './_components/service-management/ServiceDelete';
import { DataTable } from '../(misc)/_components/DataTable';
import { ContentTopbar } from '../(misc)/_components/ContentTopbar';

export default function ServicePage() {
    const [active, setActive] = useState({ label: 'Services', icon: 'hand-helping', component: <Service /> })
    const { department, setDepartment, services, setServices } = useService()
    const [serviceEditor, setServiceEditor] = useState({
        isOpen: false,
        mode: 'add',
        service: null,
    })

    const [serviceDelete, setServiceDelete] = useState({
        isOpen: false,
        mode: 'delete',
        service: null,
    })




    const handleEditorModal = () => {
        setServiceEditor(true)
    }

    const columns = [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => {
                return (
                    <div className='flex flex-col'>
                        <span>{row.original.name}</span>
                        <span className='text-xs text-muted-foreground'>{row.original.sku}</span>
                    </div>
                )
            }
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({ row }) => (
                <div>
                    <span>₹ {row.original.price}</span>
                </div>
            )
        },
        {
            accessorKey: "insuranceCover",
            header: "Insurance Cover",
            cell: ({ row }) => {
                function formatInsuranceCover(value) {
                    return value
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                }

                return (
                    <div>
                        <CustomBadge status={row.original.insuranceCover}>
                            {formatInsuranceCover(row.original.insuranceCover)}
                        </CustomBadge>
                    </div>
                )
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <div>
                    <span>{row.original.status ? <CustomBadge status='success'>Active</CustomBadge> : <CustomBadge status='error'>InActive</CustomBadge>}</span>
                </div>
            )
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
                            <CustomBadge status='blank' className='text-xs hover:bg-none'><span>No Category Assigned</span></CustomBadge>
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
                        {/* <Eye size={16} className='cursor-pointer' onClick={() => { handleInventoryView(row.original) }} /> */}
                        <Pencil size={16} className='cursor-pointer' onClick={() => {
                            setServiceEditor({
                                ...serviceEditor,
                                isOpen: true,
                                service: row.original
                            })
                        }} />
                        <Trash2 size={16} className='cursor-pointer' onClick={() => {
                            setServiceDelete({
                                isOpen: true,
                                mode: 'delete',
                                service: row.original,
                            })
                        }} />
                    </div>
                )
            }
        },
    ]

    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <ContentTopbar
                title='Service Catalog Dashboard'
                description='Comprehensive oversight of medical services, pricing, and system performance'
                icon='hand-helping'
                actionComp={<Button
                    variant='save'
                    size='sm'
                    onClick={() => {
                        setServiceEditor({
                            ...serviceEditor,
                            isOpen: true
                        })
                    }}
                >
                    <Plus />
                    Add Service
                </Button>}
            />

            <ScrollArea className='h-[85vh] flex flex-grow   rounded-md '>
                <div className='flex flex-col gap-4 p-2'>
                    <ServiceStats services={services} />

                    <div className='flex flex-row gap-2 w-full '>

                        <div className='min-w-[75%]'>
                            <DataTable
                                columns={columns}
                                data={services}
                                onFiltersChange={(e) => { console.log('filter change', e) }}
                                filterTitle='Search inventory items......'
                            />
                        </div>

                        <div className='w-full'>
                            <CategoryHierarchy
                                title='Service Hierarchy'
                                data={department}
                                category={department}
                                onUpdate={(c) => {
                                    setDepartment(c)
                                }}
                            />
                        </div>

                        <ServiceEditor
                            isOpen={serviceEditor?.isOpen}
                            onClose={() => { setServiceEditor(false) }}
                            categories={department?.children}
                            service={serviceEditor.service}
                            onSubmit={(ser) => {
                                if (ser) {
                                    setServices(prev =>
                                        prev.some(item => item.id === ser.id)
                                            ? prev.map(item =>
                                                item.id === ser.id ? { ...item, ...ser } : item
                                            )
                                            : [ser, ...prev]
                                    );
                                }
                            }}
                        />


                        <ServiceDelete
                            isOpen={serviceDelete.isOpen}
                            onClose={() => {
                                setServiceDelete({
                                    isOpen: false
                                })
                            }}
                            service={serviceDelete.service}
                        />

                    </div>
                </div>
            </ScrollArea>

        </div >
    )
}
