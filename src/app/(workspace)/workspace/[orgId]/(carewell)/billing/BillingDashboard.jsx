import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '@/carewell/hooks/useLocalStorage';
import { mockInvoices } from './mockInvoices';
import { calculateBillingStats, filterInvoices } from './utils';
import { INVOICE_STATUS } from './types';
import { BillingStatsCards } from './BillingStatsCards';
import { BillingFilters } from './BillingFilters';
import { InvoiceList } from './InvoiceList';
import { InvoiceTableView } from './InvoiceTableView';
import { InvoiceDetailSheet } from './InvoiceDetailSheet';
import { NewInvoiceDialog } from './NewInvoiceDialog';
import { PaymentSheet } from './PaymentSheet';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function BillingDashboard() {
  const [invoices, setInvoices] = useLocalStorage('hms_invoices', mockInvoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const stats = useMemo(() => calculateBillingStats(invoices), [invoices]);

  const filteredInvoices = useMemo(() => {
    return filterInvoices(invoices, {
      search: searchQuery,
      status: statusFilter,
    });
  }, [invoices, searchQuery, statusFilter]);

  const handleInvoiceClick = (invoice) => {
    setSelectedInvoice(invoice);
    setDetailSheetOpen(true);
  };

  const handleAddInvoice = (newInvoice) => {
    console.log('Adding invoice:', newInvoice);
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const handleRecordPaymentClick = (invoice) => {
    setPaymentInvoice(invoice);
    setPaymentSheetOpen(true);
  };

  const handleRecordPayment = (invoiceId, payment) => {
    console.log('Recording payment:', payment, 'for invoice:', invoiceId);
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const newAmountPaid = inv.amountPaid + payment.amount;
          const newBalance = inv.total - newAmountPaid;
          let newStatus = inv.status;

          if (newBalance <= 0) {
            newStatus = INVOICE_STATUS.PAID;
          } else if (newAmountPaid > 0) {
            newStatus = INVOICE_STATUS.PARTIAL;
          }

          const updatedInvoice = {
            ...inv,
            amountPaid: newAmountPaid,
            balance: Math.max(0, newBalance),
            status: newStatus,
            payments: [...inv.payments, payment],
          };

          // Update selected invoice if it's the same one
          if (selectedInvoice?.id === invoiceId) {
            setSelectedInvoice(updatedInvoice);
          }

          return updatedInvoice;
        }
        return inv;
      })
    );
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
    <div className="h-full bg-background flex flex-col overflow-hidden">
      <div className="p-6 space-y-6 flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Billing & Invoicing
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage patient bills, payments, and financial records
            </p>
          </div>
          <NewInvoiceDialog
            onAddInvoice={handleAddInvoice}
            existingInvoices={invoices}
          />
        </div>

        {/* Stats Cards */}
        <div className="shrink-0">
          <BillingStatsCards stats={stats} />
        </div>

        {/* Filters */}
        <div className="shrink-0">
          <BillingFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {/* Invoice View */}
        <div className="flex-1 overflow-y-auto pb-4">
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
        </div>

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
    </div>
  );
}
