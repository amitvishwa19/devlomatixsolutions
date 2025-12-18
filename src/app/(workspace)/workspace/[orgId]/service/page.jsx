'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, } from "@/components/ui/button-group"
import { Eye, HandHelping, IndianRupee, LayoutDashboard, Pencil, Plus, ReceiptIndianRupee, Trash2 } from 'lucide-react';
import { DynamicIcon } from 'lucide-react/dynamic';
import Dashboard from './_components/service-catalog-dashboard/Dashboard';
import { ScrollArea } from '@/components/ui/scroll-area';
import Service from './_components/service-management/Service';
import Pricing from './_components/pricing-management/Pricing';
import Billing from './_components/billing-integration/Billing';
import ServiceManagementInteractive from './_components/service-management/ServiceManagementInteractive';
import ServiceStats from './_components/service-management/ServiceStats';
import { useService } from './_provider/serviceProvider';
import CategoryHierarchy from '../../_components/CategoryHierarchy';
import DataTable from '../../_components/DataTable';
import { CustomBadge } from '../(misc)/_components/CustomBadge';
import ServiceEditModal from './_components/service-management/ServiceEditModal';
import ServiceEditor from './_components/service-management/ServiceEditor';
import ServiceDelete from './_components/service-management/ServiceDelete';

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



    const navigationItems = [
        // { label: 'Dashboard', icon: 'layout-dashboard', component: <Dashboard /> },
        { label: 'Services', icon: 'hand-helping', component: <Service /> },
        { label: 'Pricing', icon: 'indian-rupee', component: <Pricing /> },
        { label: 'Billing', icon: 'receipt-indian-rupee', component: <Billing /> },
    ];

    const dashboardData = {
        userRole: 'admin',
        metrics: {
            totalServices: 1247,
            cards: [
                {
                    id: 1,
                    title: 'Total Services',
                    value: '1,247',
                    change: '+12.5%',
                    changeType: 'positive',
                    icon: 'CubeIcon',
                    iconColor: 'bg-primary/10 text-primary',
                },
                {
                    id: 2,
                    title: 'Active Pricing Tiers',
                    value: '18',
                    change: '+2',
                    changeType: 'positive',
                    icon: 'CurrencyDollarIcon',
                    iconColor: 'bg-success/10 text-success',
                },
                {
                    id: 3,
                    title: 'Recent Updates',
                    value: '34',
                    change: '-5.2%',
                    changeType: 'negative',
                    icon: 'ClockIcon',
                    iconColor: 'bg-warning/10 text-warning',
                },
                {
                    id: 4,
                    title: 'Monthly Revenue',
                    value: '$2.4M',
                    change: '+18.3%',
                    changeType: 'positive',
                    icon: 'ChartBarIcon',
                    iconColor: 'bg-accent/10 text-accent',
                },
            ],
        },
        activities: [
            {
                id: 1,
                type: 'approval_request',
                title: 'New Service Approval Required',
                description: 'Cardiology Department requested approval for Advanced Cardiac Imaging service',
                timestamp: '2025-12-06T18:30:00',
                actionRequired: true,
            },
            {
                id: 2,
                type: 'price_change',
                title: 'Price Update Completed',
                description: 'Emergency Room consultation rates updated from $250 to $275',
                timestamp: '2025-12-06T17:45:00',
                actionRequired: false,
            },
            {
                id: 3,
                type: 'new_service',
                title: 'New Service Added',
                description: 'Telemedicine Consultation service added to Outpatient category',
                timestamp: '2025-12-06T16:20:00',
                actionRequired: false,
            },
            {
                id: 4,
                type: 'service_update',
                title: 'Service Details Modified',
                description: 'MRI Scan service description and duration updated',
                timestamp: '2025-12-06T15:10:00',
                actionRequired: false,
            },
            {
                id: 5,
                type: 'approval_request',
                title: 'Bulk Import Pending Review',
                description: '45 laboratory test services imported and awaiting approval',
                timestamp: '2025-12-06T14:30:00',
                actionRequired: true,
            },
        ],
        departments: [
            {
                id: 1,
                name: 'Cardiology',
                icon: 'HeartIcon',
                serviceCount: 156,
                revenue: 485000,
                trend: 12.5,
            },
            {
                id: 2,
                name: 'Emergency',
                icon: 'BoltIcon',
                serviceCount: 89,
                revenue: 620000,
                trend: 8.3,
            },
            {
                id: 3,
                name: 'Diagnostics',
                icon: 'BeakerIcon',
                serviceCount: 234,
                revenue: 340000,
                trend: -3.2,
            },
            {
                id: 4,
                name: 'Surgery',
                icon: 'ScissorsIcon',
                serviceCount: 178,
                revenue: 890000,
                trend: 15.7,
            },
        ],
        chartData: [
            { department: 'Cardiology', services: 156, revenue: 485 },
            { department: 'Emergency', services: 89, revenue: 620 },
            { department: 'Diagnostics', services: 234, revenue: 340 },
            { department: 'Surgery', services: 178, revenue: 890 },
            { department: 'Pediatrics', services: 123, revenue: 275 },
            { department: 'Orthopedics', services: 145, revenue: 410 },
        ],
        shortcuts: [
            {
                id: 1,
                label: 'Service Management',
                description: 'Manage all services',
                path: '/service-management',
                icon: 'CubeIcon',
            },
            {
                id: 2,
                label: 'Pricing Controls',
                description: 'Update pricing tiers',
                path: '/pricing-management',
                icon: 'CurrencyDollarIcon',
            },
            {
                id: 3,
                label: 'Billing Integration',
                description: 'Configure billing',
                path: '/billing-integration',
                icon: 'DocumentTextIcon',
            },
            {
                id: 4,
                label: 'Service Browser',
                description: 'Browse catalog',
                path: '/service-catalog-browser',
                icon: 'MagnifyingGlassIcon',
            },
        ],
    };

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

            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-lg border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Service Catalog Dashboard</h2>
                    <h2 className='text-xs text-muted-foreground'>Comprehensive oversight of medical services, pricing, and system performance</h2>
                </div>

                <div>

                    <Button
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
                    </Button>
                </div>
            </div>

            <ScrollArea className='h-[85vh] flex flex-grow dark:bg-darkSecondaryBackground  rounded-md pr-2'>
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
                                setServices(prev =>
                                    prev.some(item => item.id === ser.id)
                                        ? prev.map(item =>
                                            item.id === ser.id ? { ...item, ...ser } : item
                                        )
                                        : [ser, ...prev]
                                );
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
