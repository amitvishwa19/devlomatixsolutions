import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { usePDF } from 'react-to-pdf';

const statusColorMap = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SENT: 'bg-blue-100 text-blue-800',
    PARTIALLY_PAID: 'bg-amber-100 text-amber-800',
    PAID: 'bg-emerald-100 text-emerald-800',
    VOID: 'bg-slate-100 text-slate-700 line-through',
    CANCELLED: 'bg-red-100 text-red-800',
};

const invoice = {
    id: "inv_456abc123def",
    number: "HMS/INV/2025/001234",
    issueDate: "2025-12-15T10:30:00Z",
    dueDate: "2025-12-22T23:59:00Z",
    status: "PARTIALLY_PAID",
    subtotal: 12500.00,
    tax: 1800.00,        // 18% GST on services
    discount: 500.00,    // Senior citizen discount
    totalAmount: 13800.00,

    appointment: {
        id: "appt_789xyz",
        date: "2025-12-15T09:00:00Z",
        doctorName: "Dr. Priya Sharma",
        departmentName: "Cardiology",
        patientName: "Ramesh Kumar Patel"
    },

    category: {
        id: "cat_opd",
        name: "OPD Services"
    },

    sku: "OPD-CARD-001234",
    notes: "Patient advised follow-up in 2 weeks. BP stable at 130/85. Continue Amlodipine 5mg daily.",

    items: [
        {
            id: "item1",
            description: "Cardiology Consultation (30 mins)",
            quantity: 1,
            unitPrice: 800.00,
            lineTotal: 800.00,
            type: "service"
        },
        {
            id: "item2",
            description: "ECG - 12 Lead",
            quantity: 1,
            unitPrice: 450.00,
            lineTotal: 450.00,
            type: "service"
        },
        {
            id: "item3",
            description: "2D Echo Color Doppler",
            quantity: 1,
            unitPrice: 2500.00,
            lineTotal: 2500.00,
            type: "service"
        },
        {
            id: "item4",
            description: "Blood Test - Lipid Profile",
            quantity: 1,
            unitPrice: 1200.00,
            lineTotal: 1200.00,
            type: "service"
        },
        {
            id: "item5",
            description: "Amlodipine 5mg (10 tabs)",
            quantity: 1,
            unitPrice: 150.00,
            lineTotal: 150.00,
            type: "medication"
        },
        {
            id: "item6",
            description: "Atorvastatin 20mg (10 tabs)",
            quantity: 1,
            unitPrice: 180.00,
            lineTotal: 180.00,
            type: "medication"
        },
        {
            id: "item7",
            description: "Nursing Charges (ECG procedure)",
            quantity: 1,
            unitPrice: 220.00,
            lineTotal: 220.00,
            type: "service"
        }
    ],

    payments: [
        {
            id: "pay_001",
            date: "2025-12-15T11:15:00Z",
            method: "UPI",
            reference: "UPI/9876543210/HMSINV001234",
            amount: 5000.00
        },
        {
            id: "pay_002",
            date: "2025-12-16T14:30:00Z",
            method: "Cash",
            reference: "Receipt No: RCPT-5678",
            amount: 3000.00
        }
    ],

    services: [
        {
            id: "svc_ecg",
            name: "ECG - 12 Lead",
            code: "ECG12"
        },
        {
            id: "svc_echo",
            name: "2D Echo Color Doppler",
            code: "ECHO2D"
        },
        {
            id: "svc_lipid",
            name: "Lipid Profile",
            code: "LP001"
        }
    ],

    clinic: {
        name: "Vadodara Heart Care Centre",
        address: "GF-12, Sterling Hospital Campus\nRace Course Road, Vadodara\nGujarat 390007",
        phone: "+91 265-1234567",
        gstin: "24ABCFG1234H1Z5"
    },

    patient: {
        name: "Ramesh Kumar Patel",
        mrn: "MRN-45678",
        phone: "+91 98765 43210",
        insuranceProvider: "Star Health Insurance",
        insurancePolicy: "SHI/POL/2025/123456"
    }
};


export default function InvoiceView({ isOpen, onClose, invoice, inventory }) {
    const { toPDF, targetRef } = usePDF({ filename: 'page.pdf' });

    const amountPaid = 120 //invoice?.payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = invoice?.totalAmount - amountPaid;
    const isOverdue = balance > 0 && new Date(invoice?.dueDate) < new Date();

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


    const onPrint = () => {
        console.log('print')
        window.print()
    }

    const onDownloadPdf = () => {
        toPDF()
    }

    const handleOnClose = () => {
        onClose()
    }

    return (
        <Sheet open={isOpen} onOpenChange={handleOnClose}>

            <SheetContent className='bg-transparent min-w-[620px] p-2 border-l-0'>

                <SheetHeader className='hidden'>
                    <SheetTitle>Edit profile</SheetTitle>
                    <SheetDescription>
                        Make changes to your profile here. Click save when you&apos;re done.
                    </SheetDescription>
                </SheetHeader>


                <ScrollArea className="flex flex-col gap-6 rounded-xl border h-full bg-white dark:bg-darkPrimaryBackground p-4 shadow-sm">

                    <div className="flex flex-wrap items-center gap-2 mb-4">

                        {onPrint && (
                            <Button
                                onClick={onPrint}
                                variant={'outline'}

                            >
                                Print
                            </Button>
                        )}
                        {onDownloadPdf && (
                            <Button
                                onClick={onDownloadPdf}
                                variant={'outline'}

                            >
                                Download PDF
                            </Button>
                        )}
                    </div>


                    <div ref={targetRef}>

                        {/* Header */}
                        <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4 mb-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl font-semibold">
                                        Invoice #{invoice?.number}
                                    </h1>
                                    <span
                                        className={cn(
                                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                            statusColorMap[invoice?.status]
                                        )}
                                    >
                                        {invoice?.status.replace('_', ' ')}
                                    </span>
                                    {isOverdue && (
                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                            Overdue
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500">
                                    Issue date:{' '}
                                    <span className="font-medium">
                                        {new Date(invoice?.issueDate).toLocaleDateString()}
                                    </span>
                                    {' • '}
                                    Due date:{' '}
                                    <span className="font-medium">
                                        {new Date(invoice?.dueDate).toLocaleDateString()}
                                    </span>
                                </p>
                                {invoice?.category && (
                                    <p className="text-xs text-gray-500">
                                        Category: <span className="font-medium">{invoice?.category.name}</span>
                                    </p>
                                )}
                                {invoice?.sku && (
                                    <p className="text-xs text-gray-500">SKU: {invoice?.sku}</p>
                                )}
                            </div>


                        </div>

                        {/* Clinic & patient */}
                        <div className="grid gap-6 md:grid-cols-2 mb-4">

                            <div className="space-y-1 text-sm">
                                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Billed from
                                </h2>
                                <p className="font-medium">{invoice?.clinic.name}</p>
                                <p className="text-gray-600 whitespace-pre-line">
                                    {invoice?.clinic.address}
                                </p>
                                {invoice?.clinic.phone && (
                                    <p className="text-gray-600">Phone: {invoice?.clinic.phone}</p>
                                )}
                                {invoice?.clinic.gstin && (
                                    <p className="text-gray-600">GSTIN: {invoice?.clinic.gstin}</p>
                                )}
                            </div>

                            <div className="space-y-1 text-sm">
                                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Billed to
                                </h2>
                                <p className="font-medium">{invoice?.patient.name}</p>
                                {invoice?.patient.mrn && (
                                    <p className="text-gray-600">MRN: {invoice?.patient.mrn}</p>
                                )}
                                {invoice?.patient.phone && (
                                    <p className="text-gray-600">Phone: {invoice?.patient.phone}</p>
                                )}
                                {(invoice?.patient.insuranceProvider ||
                                    invoice?.patient.insurancePolicy) && (
                                        <p className="text-gray-600">
                                            Insurance:{' '}
                                            {[
                                                invoice?.patient.insuranceProvider,
                                                invoice?.patient.insurancePolicy,
                                            ]
                                                .filter(Boolean)
                                                .join(' • ')}
                                        </p>
                                    )}
                            </div>
                        </div>

                        {/* Appointment context */}
                        {invoice?.appointment && (
                            <div className="rounded-lg bg-slate-50 dark:bg-darkFocusColor/50 px-4 py-3 text-sm mb-4">
                                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Appointment
                                </h2>
                                <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1">
                                    <div>
                                        <span className="text-gray-500">ID: </span>
                                        <span className="font-medium">{invoice?.appointment.id}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Date: </span>
                                        <span className="font-medium">
                                            {new Date(invoice?.appointment.date).toLocaleString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Doctor: </span>
                                        <span className="font-medium">
                                            {invoice?.appointment.doctorName}
                                            {invoice?.appointment.departmentName &&
                                                `, ${invoice?.appointment.departmentName}`}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Patient: </span>
                                        <span className="font-medium">
                                            {invoice?.appointment.patientName}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Items table */}
                        <div className="space-y-2 mb-4">
                            <h2 className="text-sm font-semibold text-gray-800">
                                Itemized charges
                            </h2>
                            <div className="overflow-hidden rounded-lg border">
                                <table className="min-w-full divide-y divide-gray-200 text-sm dark:bg-darkFocusColor/50">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide dark:bg-darkFocusColor">
                                                Description
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide dark:bg-darkFocusColor">
                                                Type
                                            </th>
                                            <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide dark:bg-darkFocusColor">
                                                Qty
                                            </th>
                                            <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide dark:bg-darkFocusColor">
                                                Unit price
                                            </th>
                                            <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide dark:bg-darkFocusColor">
                                                Line total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white dark:bg-darkFocusColor/50">
                                        {invoice?.items.map((item, idx) => (
                                            <tr key={item.id ?? idx}>
                                                <td className="px-4 py-2 ">
                                                    {item.description}
                                                </td>
                                                <td className="px-4 py-2 ">
                                                    {item.type ? item.type : '—'}
                                                </td>
                                                <td className="px-4 py-2 text-right ">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-4 py-2 text-right ">
                                                    {item.unitPrice.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-2 text-right font-medium ">
                                                    {item.lineTotal.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                        {invoice?.items.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-4 py-4 text-center text-sm "
                                                >
                                                    No items on this invoice?.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totals & payments */}
                        <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
                            {/* Payments */}
                            {/* <div className="space-y-2">
                            <h2 className="text-sm font-semibold text-gray-800">Payments</h2>
                            <div className="overflow-hidden rounded-lg border">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                                Date
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                                Method
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                                Reference
                                            </th>
                                            <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {invoice?.payments.map((p) => (
                                            <tr key={p.id}>
                                                <td className="px-4 py-2 text-gray-800">
                                                    {new Date(p.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-2 text-gray-800">{p.method}</td>
                                                <td className="px-4 py-2 text-gray-500">
                                                    {p.reference || '—'}
                                                </td>
                                                <td className="px-4 py-2 text-right font-medium text-gray-900">
                                                    {p.amount.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                        {invoice?.payments.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-4 py-4 text-center text-sm text-gray-500"
                                                >
                                                    No payments recorded.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div> */}

                            {/* Totals */}
                            {/* <div className="space-y-2">
                            <h2 className="text-sm font-semibold text-gray-800">Summary</h2>
                            <div className="rounded-lg border bg-gray-50 p-4 text-sm">
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">
                                        {invoice?.subtotal?.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">{invoice?.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">Discount</span>
                                    <span className="font-medium text-emerald-700">
                                        -{invoice?.discount?.toFixed(2)}
                                    </span>
                                </div>
                                <div className="my-2 border-t" />
                                <div className="flex justify-between py-1">
                                    <span className="font-semibold text-gray-800">Total</span>
                                    <span className="text-base font-semibold text-gray-900">
                                        {invoice?.totalAmount?.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">Paid</span>
                                    <span className="font-medium text-emerald-700">
                                        {amountPaid?.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">Balance</span>
                                    <span
                                        className={cn(
                                            'font-semibold',
                                            balance > 0 ? 'text-red-700' : 'text-emerald-700'
                                        )}
                                    >
                                        {balance.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div> */}
                        </div>

                        {/* Notes */}
                        {invoice?.notes && (
                            <div className="space-y-1">
                                <h2 className="text-sm font-semibold text-gray-800">Notes</h2>
                                <p className="whitespace-pre-line text-sm text-gray-700">
                                    {invoice?.notes}
                                </p>
                            </div>
                        )}
                    </div>


                </ScrollArea>

            </SheetContent>
        </Sheet>
    )
}
