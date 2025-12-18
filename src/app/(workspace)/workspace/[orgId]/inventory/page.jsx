'use client'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Pencil, Save, Search, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react'
import { InventoryDialog } from './_components/InventoryDialog';
import { useModal } from '@/hooks/useModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, } from "@/components/ui/button-group"
import { InventoryDashboard } from './_components/InventoryDashboard';
import InventoryStats from './_components/inventory-management/InventoryStats';
import InventoryFilter from './_components/inventory-management/InventoryFilter';
import { InventoryTable } from './_components/InventoryTable';
import { useInventory } from './_provider/inventoryProvider';
import DataTable from '../../_components/DataTable';
import moment from 'moment';
import { CustomBadge } from '../(misc)/_components/CustomBadge';
import CategoryHierarchy from '../../_components/CategoryHierarchy';
import InventoryView from './_components/inventory-management/InventoryView';
import InventoryEditor from './_components/inventory-management/InventoryEditor';
import { DynamicIcon } from 'lucide-react/dynamic';
import InventoryDelete from './_components/inventory-management/InventoryDelete';


const mockData = [
    {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        patientName: 'Sarah Johnson',
        patientId: 'P-10234',
        patientEmail: 'sarah.j@email.com',
        patientPhone: '+1 (555) 123-4567',
        issueDate: '2024-01-15',
        dueDate: '2024-02-15',
        status: 'paid',
        items: [
            { id: '1', description: 'General Consultation', quantity: 1, unitPrice: 150, total: 150 },
            { id: '2', description: 'Blood Test Panel', quantity: 1, unitPrice: 85, total: 85 },
            { id: '3', description: 'X-Ray Chest', quantity: 1, unitPrice: 200, total: 200 },
        ],
        subtotal: 435,
        tax: 43.5,
        discount: 0,
        total: 478.50,
    },
    {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        patientName: 'Michael Chen',
        patientId: 'P-10567',
        patientEmail: 'm.chen@email.com',
        patientPhone: '+1 (555) 234-5678',
        issueDate: '2024-01-18',
        dueDate: '2024-02-18',
        status: 'pending',
        items: [
            { id: '1', description: 'Emergency Room Visit', quantity: 1, unitPrice: 500, total: 500 },
            { id: '2', description: 'CT Scan - Head', quantity: 1, unitPrice: 850, total: 850 },
            { id: '3', description: 'Medication - IV Fluids', quantity: 2, unitPrice: 45, total: 90 },
        ],
        subtotal: 1440,
        tax: 144,
        discount: 100,
        total: 1484,
    },
    {
        id: '3',
        invoiceNumber: 'INV-2024-003',
        patientName: 'Emily Rodriguez',
        patientId: 'P-10891',
        patientEmail: 'e.rodriguez@email.com',
        patientPhone: '+1 (555) 345-6789',
        issueDate: '2024-01-10',
        dueDate: '2024-01-25',
        status: 'overdue',
        items: [
            { id: '1', description: 'Orthopedic Consultation', quantity: 1, unitPrice: 200, total: 200 },
            { id: '2', description: 'MRI - Knee', quantity: 1, unitPrice: 1200, total: 1200 },
            { id: '3', description: 'Physical Therapy Session', quantity: 3, unitPrice: 100, total: 300 },
        ],
        subtotal: 1700,
        tax: 170,
        discount: 50,
        total: 1820,
    },
    {
        id: '4',
        invoiceNumber: 'INV-2024-004',
        patientName: 'James Wilson',
        patientId: 'P-11234',
        patientEmail: 'j.wilson@email.com',
        patientPhone: '+1 (555) 456-7890',
        issueDate: '2024-01-20',
        dueDate: '2024-02-20',
        status: 'draft',
        items: [
            { id: '1', description: 'Cardiology Consultation', quantity: 1, unitPrice: 300, total: 300 },
            { id: '2', description: 'ECG', quantity: 1, unitPrice: 150, total: 150 },
        ],
        subtotal: 450,
        tax: 45,
        discount: 0,
        total: 495,
    },
    {
        id: '5',
        invoiceNumber: 'INV-2024-005',
        patientName: 'Lisa Thompson',
        patientId: 'P-11567',
        patientEmail: 'l.thompson@email.com',
        patientPhone: '+1 (555) 567-8901',
        issueDate: '2024-01-22',
        dueDate: '2024-02-22',
        status: 'paid',
        items: [
            { id: '1', description: 'Dermatology Consultation', quantity: 1, unitPrice: 175, total: 175 },
            { id: '2', description: 'Skin Biopsy', quantity: 1, unitPrice: 350, total: 350 },
        ],
        subtotal: 525,
        tax: 52.5,
        discount: 25,
        total: 552.50,
    },
    {
        id: '6',
        invoiceNumber: 'INV-2024-006',
        patientName: 'Robert Garcia',
        patientId: 'P-11890',
        patientEmail: 'r.garcia@email.com',
        patientPhone: '+1 (555) 678-9012',
        issueDate: '2024-01-25',
        dueDate: '2024-02-25',
        status: 'pending',
        items: [
            { id: '1', description: 'Dental Cleaning', quantity: 1, unitPrice: 120, total: 120 },
            { id: '2', description: 'Dental X-Ray', quantity: 2, unitPrice: 50, total: 100 },
            { id: '3', description: 'Cavity Filling', quantity: 1, unitPrice: 200, total: 200 },
        ],
        subtotal: 420,
        tax: 42,
        discount: 0,
        total: 462,
    },
];


export default function InventoryPage() {
    const { inventories, setInventories, categories, setCategories, category, setCategory } = useInventory()


    const [active, setActive] = useState({ id: 'dashboard', component: <InventoryDashboard /> })
    const nav = [
        { id: 'dashboard', icon: '', component: <InventoryDashboard /> },
        { id: 'inventory', icon: '', component: <InventoryTable /> }

    ]

    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        dateRange: 'all',
    });

    const [inventoryView, setInventoryView] = useState(false)
    const [inventoryEditor, setInventoryEditor] = useState(false)
    const [deleteModal, setDeleteModal] = useState(false)
    const [selectedInventory, setSelectedINventory] = useState(null)

    function getExpiryPriority(expiryDate, { highDays = 7, mediumDays = 30 } = {}) {
        const today = new Date();
        const expiry = new Date(expiryDate);

        // Normalize times (avoid time-of-day issues)
        today.setHours(0, 0, 0, 0);
        expiry.setHours(0, 0, 0, 0);

        const diffInDays = Math.ceil(
            (expiry - today) / (1000 * 60 * 60 * 24)
        );

        // Already expired
        if (diffInDays < 0) return "expired";

        if (diffInDays <= highDays) return "high";
        if (diffInDays <= mediumDays) return "medium";

        return "low";
    }

    const handleInventoryView = (e) => {
        setInventoryView(true)
        setSelectedINventory(e)
    }

    const handleInventoryEditor = (e) => {
        setInventoryEditor(true)
        setSelectedINventory(e)
    }

    const handleDeleteInventory = (e) => {
        setSelectedINventory(e)
        setDeleteModal(true)
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };


    const filterData = useMemo(() => {
        return inventories?.filter((invoice) => {
            // Search filter
            const searchLower = filters.search.toLowerCase();
            const matchesSearch =
                !filters.search ||
                invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
                invoice.patientName.toLowerCase().includes(searchLower) ||
                invoice.patientId.toLowerCase().includes(searchLower);

            // Status filter
            const matchesStatus = filters.status === 'all' || invoice.status === filters.status;

            // Date filter
            let matchesDate = true;
            if (filters.dateRange !== 'all') {
                const issueDate = new Date(invoice.issueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (filters.dateRange === 'today') {
                    matchesDate = issueDate.toDateString() === today.toDateString();
                } else if (filters.dateRange === 'week') {
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    matchesDate = issueDate >= weekAgo;
                } else if (filters.dateRange === 'month') {
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    matchesDate = issueDate >= monthAgo;
                }
            }

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [inventories, filters]);

    const handleViewInvoice = (item) => {
        setSelectedInvoice(item);
        setIsDetailOpen(true);
    };

    const handleDeleteInvoice = (id) => {
        setInvoices(inventories.filter((inv) => inv.id !== id));
        toast({
            title: 'Invoice Deleted',
            description: 'The invoice has been successfully deleted.',
        });
    };

    const handleCreateInvoice = (newItem) => {
        const inventory = {
            ...newItem,
            id: String(Date.now()),
        };
        setInventories([inventories, ...inventory]);
    };

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
            accessorKey: "quantity",
            header: "Quantity",
        },
        {
            accessorKey: "supplier",
            header: "Supplier",
        },
        {
            accessorKey: "unitPrise",
            header: "Unit Price",
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
            accessorKey: "expiryDate",
            header: "Expiry Date",
            cell: ({ row }) => {
                const tootltipMsg = getExpiryPriority(row.original.expiryDate)
                return (
                    <div className=''>
                        <CustomBadge status={getExpiryPriority(row.original.expiryDate)}>
                            {moment(row.original.expiryDate).format("MMM Do YY")}
                        </CustomBadge>
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
                        <Eye size={16} className='cursor-pointer' onClick={() => { handleInventoryView(row.original) }} />
                        <Pencil size={16} className='cursor-pointer' onClick={() => { handleInventoryEditor(row.original) }} />
                        <Trash2 size={16} className='cursor-pointer' onClick={() => { handleDeleteInventory(row.original) }} />
                    </div>
                )
            }
        },

    ]


    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-lg border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Inventory Management</h2>
                    <h2 className='text-xs text-muted-foreground'>Manage hospital inventory items</h2>
                </div>

                <Button
                    variant='save'
                    size='sm'
                    onClick={setInventoryEditor}
                >
                    <Save />
                    New Inventory
                </Button>
            </div>

            <ScrollArea className='h-[85vh] flex flex-grow dark:bg-darkSecondaryBackground rounded-md pr-4'>
                <div className='flex flex-col gap-4 p-2'>
                    <InventoryStats inventories={inventories} />

                    <div className='flex flex-row gap-2 w-full '>
                        <div className='min-w-[75%]'>
                            <DataTable
                                columns={columns}
                                data={inventories}
                                onFiltersChange={(e) => { console.log('filter change', e) }}
                                filterTitle='Search inventory items......'
                            />
                        </div>
                        <div className='w-full'>
                            <CategoryHierarchy title='Inventory Hierarchy' data={categories} category={category} />
                        </div>


                        <InventoryView
                            isOpen={inventoryView}
                            onClose={() => {
                                setInventoryView(false)
                                setSelectedINventory(null)
                            }}
                            inventory={selectedInventory}
                        />

                        <InventoryEditor
                            inventory={selectedInventory}
                            categories={categories}
                            isOpen={inventoryEditor}
                            onClose={(cat) => {
                                setSelectedINventory(null)
                                setInventoryEditor(false)
                                console.log('@setInventory', cat)
                                if (cat) {
                                    setInventories(prev =>
                                        prev.some(item => item.id === cat.id)
                                            ? prev.map(item =>
                                                item.id === cat.id ? { ...item, ...cat } : item
                                            )
                                            : [cat, ...prev]
                                    );

                                }
                            }}
                            onSubmit={() => { console.log('Editor on submit') }}
                        />

                        <InventoryDelete
                            inventory={selectedInventory}
                            isOpen={deleteModal}
                            onClose={(cat) => {
                                console.log('@delete', cat)
                                setDeleteModal(false)
                                if (cat) {
                                    setInventories(inventories?.filter(inv => inv.id !== cat.id))
                                }

                            }}
                        />
                    </div>
                </div>
            </ScrollArea>

        </div >
    )
}
