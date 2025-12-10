'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { useModal } from '@/hooks/useModal'
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Eye } from "lucide-react";


const invoices = [
    { id: "INV-001", patient: "John Doe", amount: 1250, status: "Paid", date: "2024-01-15" },
    { id: "INV-002", patient: "Jane Smith", amount: 3400, status: "Pending", date: "2024-01-18" },
    { id: "INV-003", patient: "Mike Johnson", amount: 890, status: "Overdue", date: "2024-01-10" },
    { id: "INV-004", patient: "Sarah Williams", amount: 2100, status: "Paid", date: "2024-01-20" },
    { id: "INV-005", patient: "Robert Brown", amount: 1650, status: "Pending", date: "2024-01-22" },
];


export default function InvoicePage() {
    const { onOpen } = useModal()

    const [open, setOpen] = useState(false);

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
                    <h2 className='text-xl'>Invoices</h2>
                    <h2 className='text-xs text-white/50'>Manage and generate patient invoices</h2>
                </div>
                <div>
                    <Button variant={'outline'} size={'sm'} className='' onClick={() => { onOpen('addinvoice') }}>
                        New Invoice
                    </Button>
                </div>
            </div>

            <div className='h-full flex flex-grow dark:bg-darkSecondaryBackground p-2 rounded-md'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice ID</TableHead>
                            <TableHead>Patient</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell className="font-medium">{invoice.id}</TableCell>
                                <TableCell>{invoice.patient}</TableCell>
                                <TableCell>{invoice.date}</TableCell>
                                <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                                <TableCell>
                                    <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

            </div>


        </div >
    )
}
