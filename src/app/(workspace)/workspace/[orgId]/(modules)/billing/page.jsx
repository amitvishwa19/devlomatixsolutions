'use client'
import React, { useMemo, useState } from 'react'
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockInvoices } from './utils/mockInvoices';
import { useToast } from '@/hooks/use-toast';
import { calculateBillingStats, filterInvoices } from './utils/utils';
import { NewInvoiceDialog } from './components/NewInvoiceDialog';
import { BillingStatsCards } from './components/BillingStatsCards';
import { BillingFilters } from './components/BillingFilters';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceTableView } from './components/InvoiceTableView';
import { InvoiceDetailSheet } from './components/InvoiceDetailSheet';
import { PaymentSheet } from './components/PaymentSheet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { getInvoices } from './_action/get-invoices';
import { upsertInvoice } from './_action/upsert-invoice';
import { useAction } from '@/hooks/use-action';
import { Loader } from 'lucide-react';



export default function BillingPage() {
    const { orgId } = useParams();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: invoicesData, isLoading } = useQuery({
        queryKey: ['invoices', orgId],
        queryFn: async () => {
            const response = await getInvoices({ serverId: orgId });
            return response.data?.invoices || [];
        }
    });

    const invoices = invoicesData || [];
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState('list');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [detailSheetOpen, setDetailSheetOpen] = useState(false);
    const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);
    const [paymentInvoice, setPaymentInvoice] = useState(null);


    const stats = useMemo(() => calculateBillingStats(invoices), [invoices]);

    const filteredInvoices = useMemo(() => {
        return filterInvoices(invoices, {
            search: searchQuery,
            status: statusFilter,
        });
    }, [invoices, searchQuery, statusFilter]);

    const { execute: executeUpsert } = useAction(upsertInvoice, {
        onSuccess: () => queryClient.invalidateQueries(['invoices', orgId])
    });

    const handleInvoiceClick = (invoice) => {
        setSelectedInvoice(invoice);
        setDetailSheetOpen(true);
    };

    const handleAddInvoice = (newInvoice) => {
        // executeUpsert(newInvoice);
        queryClient.invalidateQueries(['invoices', orgId]);
    };

    const handleRecordPaymentClick = (invoice) => {
        setPaymentInvoice(invoice);
        setPaymentSheetOpen(true);
    };

    const handleRecordPayment = (invoiceId, payment) => {
        console.log('Recording payment:', payment, 'for invoice:', invoiceId);
        // Note: Real payment recording would need a dedicated action to avoid concurrency issues, 
        // but for now we'll re-fetch after any update.
        queryClient.invalidateQueries(['invoices', orgId]);
    };

    const handleGenerateInvoice = (bill) => {
        console.log('Generating invoice from bill:', bill);

        // Mark the bill as invoiced
        setInvoices((prev) =>
            prev.map((inv) => {
                if (inv.id === bill.id) {
                    return { ...inv, invoiceGenerated: true };
                }
                return inv;
            })
        );

        // Update selected invoice if it's the same one
        if (selectedInvoice?.id === bill.id) {
            setSelectedInvoice({ ...selectedInvoice, invoiceGenerated: true });
        }

        // Store bill data for invoice generation
        const billDataForInvoice = {
            billId: bill.id,
            patientName: bill.patientName,
            patientId: bill.patientId,
            patientPhone: bill.patientPhone,
            items: bill.items,
            subtotal: bill.subtotal,
            gst: bill.gst || bill.tax,
            discount: bill.discount || 0,
            total: bill.total,
        };

        // Store in sessionStorage for invoice page to pick up
        sessionStorage.setItem('pendingInvoiceData', JSON.stringify(billDataForInvoice));

        toast({
            title: "Invoice Generation",
            description: "Redirecting to Invoice module to complete the invoice generation.",
        });

        // Close the detail sheet and navigate to invoice page
        setDetailSheetOpen(false);
        navigate('/invoice');
    };


    return (
        <div className='absolute inset-0 flex flex-col gap-2'>



            <ContentTopbar
                title='Billing'
                description='Smart, transparent hospital billing that ensures accuracy, speed, and trust.'
                icon='indian-rupee'
                actionComp={<NewInvoiceDialog
                    onAddInvoice={handleAddInvoice}
                    existingInvoices={invoices}
                />}
            />

            {/* Stats Cards */}
            <div className="p-2">
                <BillingStatsCards stats={stats} />
            </div>

            {/* Filters */}
            <div className="p-2">
                <BillingFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />
            </div>

            <ScrollArea className='h-[60vh] flex flex-grow  rounded-md p-2'>
                {/* Invoice View */}
                <div className="flex-1 overflow-y-auto pb-4">
                    {isLoading ? (
                        <div className='flex items-center justify-center h-[200px]'>
                            <Loader className='animate-spin text-muted-foreground' />
                        </div>
                    ) : (
                        <>
                            {viewMode === 'list' && (
                                <InvoiceList
                                    invoices={filteredInvoices}
                                    onInvoiceClick={handleInvoiceClick}
                                />
                            )}
                            {viewMode === 'table' && (
                                <InvoiceTableView
                                    invoices={filteredInvoices}
                                    onInvoiceClick={handleInvoiceClick}
                                />
                            )}
                        </>
                    )}
                </div>

            </ScrollArea>


            <div>
                {/* Invoice Detail Sheet */}
                <InvoiceDetailSheet
                    invoice={selectedInvoice}
                    open={detailSheetOpen}
                    onOpenChange={setDetailSheetOpen}
                    onRecordPayment={handleRecordPaymentClick}
                    onGenerateInvoice={handleGenerateInvoice}
                />

                {/* Payment Sheet */}
                <PaymentSheet
                    invoice={paymentInvoice}
                    open={paymentSheetOpen}
                    onOpenChange={setPaymentSheetOpen}
                    onRecordPayment={handleRecordPayment}
                />
            </div>

        </div >
    )
}
