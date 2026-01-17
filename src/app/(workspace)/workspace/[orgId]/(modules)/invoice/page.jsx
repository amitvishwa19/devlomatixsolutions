'use client'
import React, { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useState } from "react";
import { toast } from "sonner";
import { Download, Eye, Pencil, ReceiptText, Trash2 } from "lucide-react";
import { InvoiceStats } from './_components/InvoiceStats';
import { CreateInvoiceDialog, InvoiceEditor } from './_components/InvoiceEditor';
import { CustomBadge } from '../../(misc)/_components/CustomBadge';
import moment from 'moment';
import { useInvoice } from './_provider/invoiceProvider';
import { ScrollArea } from '@/components/ui/scroll-area';
import CategoryHierarchy from '../../../_components/general/CategoryHierarchy';
import { DynamicIcon } from 'lucide-react/dynamic';
import InvoiceView from './_components/InvoiceView';
import { DataTable } from '../../(misc)/_components/DataTable';
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar';


const mockInvoices = [
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


export default function InvoicePage() {

    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { invoices, setInvoices, category, setCategory, services } = useInvoice()


    const [invoiceEditor, setInvoiceEditor] = useState({
        isOpen: false,
        mode: 'add',
        invoice: null,
    })

    const [invoiceViewer, setInvoiceViewer] = useState({
        isOpen: false,
        mode: 'view',
        invoice: null,
    })



    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        dateRange: 'all',
    });

    const filteredInvoices = useMemo(() => {
        return invoices?.filter((invoice) => {
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
    }, [invoices, filters]);

    function getDueDatePriority(date, { highDays = 7, mediumDays = 30 } = {}) {
        const today = new Date();
        const expiry = new Date(date);

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


    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setIsDetailOpen(true);
    };

    const handleDeleteInvoice = (id) => {
        setInvoices(invoices.filter((inv) => inv.id !== id));
        toast({
            title: 'Invoice Deleted',
            description: 'The invoice has been successfully deleted.',
        });
    };

    const handleCreateInvoice = (newInvoice) => {
        const invoice = {
            ...newInvoice,
            id: String(Date.now()),
        };
        setInvoices([invoice, ...invoices]);
    };

    const handleGenerateInvoice = (e) => {
        e.preventDefault();
        toast.success("Invoice generated successfully");
        setOpen(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Paid":
                return "bg-accent text-accent-foreground";
            case "Pending":
                return "bg-warning text-warning-foreground";
            case "Overdue":
                return "bg-destructive text-destructive-foreground";
            default:
                return "bg-muted text-muted-foreground";
        }
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
            accessorKey: "dueDate",
            header: "Due Date",
            cell: ({ row }) => {
                const tootltipMsg = getDueDatePriority(row.original.dueDate)
                return (
                    <div className=''>
                        <CustomBadge status={getDueDatePriority(row.original.dueDate)}>
                            {moment(row.original.dueDate).format("MMM Do YY")}
                        </CustomBadge>
                    </div>
                )
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const tootltipMsg = getDueDatePriority(row.original.dueDate)
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

    console.log(invoices)

    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>
            <ContentTopbar
                title='Invoice Management'
                description='Manage and generate patient invoices'
                icon='receipt-indian-rupee'
                actionComp={<Button variant={'save'} size={'sm'} className='' onClick={() => {
                    console.log('Open editor')
                    setInvoiceEditor({
                        isOpen: true,
                        mode: 'add',
                        invoice: null,
                    })
                }}>
                    <ReceiptText />
                    New Invoice
                </Button>}
            />

            <ScrollArea className='h-[85vh] flex flex-grow  rounded-md'>
                <div className='flex flex-col gap-4 p-2'>

                    <InvoiceStats invoices={invoices} />
                    <div className='flex flex-row gap-2 w-full '>


                        <div className='min-w-[75%]'>
                            <DataTable
                                columns={columns}
                                data={invoices}
                                onFiltersChange={(e) => { console.log('filter change', e) }}
                                filterTitle='Search invoice items......'
                            />
                        </div>

                        <div className='w-full'>
                            <CategoryHierarchy
                                title='Invoices Hierarchy'
                                data={invoices}
                                category={category}
                                onUpdate={(c) => { setCategory(c) }}
                            />
                        </div>


                    </div>

                    <InvoiceEditor
                        isOpen={invoiceEditor.isOpen}
                        mode={invoiceEditor.mode}
                        services={services}
                        category={category}
                        invoice={invoiceEditor.invoice}
                        onClose={() => {
                            setInvoiceEditor(
                                {
                                    isOpen: false,
                                    mode: 'add',
                                    invoice: null,
                                }
                            )
                        }}
                        onSave={(invoice) => {
                            setInvoices(prev =>
                                prev.some(item => item.id === invoice.id)
                                    ? prev.map(item =>
                                        item.id === invoice.id ? { ...item, ...invoice } : item
                                    )
                                    : [invoice, ...prev]
                            );
                        }}
                    />

                    <InvoiceView
                        isOpen={invoiceViewer.isOpen}
                        invoice={invoiceViewer.invoice}
                        onClose={() => {
                            setInvoiceViewer({
                                isOpen: false,
                                mode: 'view',
                                invoice: null,
                            })
                        }}
                    />


                    {/* <InvoiceDetail
                        invoice={selectedInvoice}
                        open={isDetailOpen}
                        onClose={() => setIsDetailOpen(false)}
                    /> */}


                    {/* <CreateInvoiceDialog
                        open={isCreateOpen}
                        onClose={() => setIsCreateOpen(false)}
                        onSave={handleCreateInvoice}
                    />  */}
                </div>
            </ScrollArea>


        </div >
    )
}
