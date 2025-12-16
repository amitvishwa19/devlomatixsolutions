'use client'
import React, { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useModal } from '@/hooks/useModal'
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Eye } from "lucide-react";
import { InvoiceHeader } from './_components/InvoiceHeader';
import { InvoiceStats } from './_components/InvoiceStats';
import { InvoiceFilters } from './_components/InvoiceFilters';
import { InvoiceTable } from './_components/InvoiceTable';
import { InvoiceDetail } from './_components/InvoiceDetai';
import { CreateInvoiceDialog } from './_components/CreateInvoiceDialog';


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
    const [invoices, setInvoices] = useState(mockInvoices);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        dateRange: 'all',
    });

    const filteredInvoices = useMemo(() => {
        return invoices.filter((invoice) => {
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


    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-lg border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Invoice Management</h2>
                    <h2 className='text-xs text-white/50'>Manage and generate patient invoices</h2>
                </div>
                <div>
                    <Button variant={'save'} size={'sm'} className='' onClick={() => { setIsCreateOpen(true) }}>
                        New Invoice
                    </Button>
                </div>
            </div>

            <div className='h-full flex flex-grow dark:bg-darkSecondaryBackground p-2 rounded-md'>
                <div className="w-full ">


                    {/* Main Content */}

                    <div className="space-y-6">
                        <InvoiceStats invoices={invoices} />
                        <InvoiceFilters filters={filters} onFiltersChange={setFilters} />
                        <InvoiceTable
                            invoices={filteredInvoices}
                            onView={handleViewInvoice}
                            onDelete={handleDeleteInvoice}
                        />
                    </div>


                    {/* Invoice Detail Drawer */}
                    <InvoiceDetail
                        invoice={selectedInvoice}
                        open={isDetailOpen}
                        onClose={() => setIsDetailOpen(false)}
                    />

                    {/* Create Invoice Dialog */}
                    <CreateInvoiceDialog
                        open={isCreateOpen}
                        onClose={() => setIsCreateOpen(false)}
                        onSave={handleCreateInvoice}
                    />
                </div>
            </div>


        </div >
    )
}
