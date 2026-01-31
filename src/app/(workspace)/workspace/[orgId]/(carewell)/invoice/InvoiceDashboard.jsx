import * as React from 'react';
import { useLocalStorage } from '@/carewell/hooks/useLocalStorage';
import { mockInvoices } from './mockInvoices';
import { calculateInvoiceStats, filterInvoices } from './utils';
import { InvoiceStatsCards } from './InvoiceStatsCards';
import { InvoiceFilters } from './InvoiceFilters';
import { InvoiceList } from './InvoiceList';
import { InvoiceTableView } from './InvoiceTableView';
import { InvoiceDetailSheet } from './InvoiceDetailSheet';
import { RecordPaymentSheet } from './RecordPaymentSheet';
import { GenerateInvoiceSheet } from './GenerateInvoiceSheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Download, BarChart3 } from 'lucide-react';
import { INVOICE_STATUS } from './types';
import { useToast } from '@/hooks/use-toast';

export default function InvoiceDashboard() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useLocalStorage('hms_invoices_final', mockInvoices);
  
  // Filters
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [viewMode, setViewMode] = React.useState('table');
  
  // Sheets
  const [selectedInvoice, setSelectedInvoice] = React.useState(null);
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false);
  const [paymentSheetOpen, setPaymentSheetOpen] = React.useState(false);
  const [generateSheetOpen, setGenerateSheetOpen] = React.useState(false);
  const [pendingBillData, setPendingBillData] = React.useState(null);

  // Check for pending invoice data from billing module
  React.useEffect(() => {
    const pendingData = sessionStorage.getItem('pendingInvoiceData');
    if (pendingData) {
      try {
        const billData = JSON.parse(pendingData);
        setPendingBillData(billData);
        setGenerateSheetOpen(true);
        // Clear the session storage
        sessionStorage.removeItem('pendingInvoiceData');
        toast({
          title: "Bill data loaded",
          description: `Ready to generate invoice from bill ${billData.billId}`,
        });
      } catch (error) {
        console.error('Error parsing pending invoice data:', error);
      }
    }
  }, [toast]);

  // Computed
  const stats = React.useMemo(() => calculateInvoiceStats(invoices), [invoices]);

  const filteredInvoices = React.useMemo(() => {
    return filterInvoices(invoices, {
      search: searchQuery,
      status: statusFilter,
      type: typeFilter,
    });
  }, [invoices, searchQuery, statusFilter, typeFilter]);

  // Handlers
  const handleInvoiceClick = (invoice) => {
    setSelectedInvoice(invoice);
    setDetailSheetOpen(true);
  };

  const handleRecordPaymentClick = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentSheetOpen(true);
  };

  const handleRecordPayment = (invoiceId, payment) => {
    console.log('Recording payment:', payment, 'for invoice:', invoiceId);
    
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const newAmountPaid = inv.amountPaid + payment.amount;
          const newBalance = inv.grandTotal - newAmountPaid;
          let newStatus = inv.status;

          if (newBalance <= 0) {
            newStatus = INVOICE_STATUS.PAID;
          } else if (newAmountPaid > 0) {
            newStatus = INVOICE_STATUS.PARTIAL;
          }

          const updatedInvoice = {
            ...inv,
            amountPaid: newAmountPaid,
            balanceDue: Math.max(0, newBalance),
            status: newStatus,
            payments: [...inv.payments, payment],
          };

          if (selectedInvoice?.id === invoiceId) {
            setSelectedInvoice(updatedInvoice);
          }

          return updatedInvoice;
        }
        return inv;
      })
    );

    toast({
      title: 'Payment recorded',
      description: `₹${payment.amount.toLocaleString('en-IN')} payment recorded successfully.`,
    });
  };

  const handleGenerateInvoice = (newInvoice) => {
    console.log('Generating invoice:', newInvoice);
    setInvoices((prev) => [newInvoice, ...prev]);
    
    toast({
      title: 'Invoice generated',
      description: `Invoice ${newInvoice.invoiceNumber} has been generated.`,
    });
  };

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      <div className="p-6 space-y-6 flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Invoice Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Official financial documents • Immutable once issued
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-1" />
              Reports
            </Button>
            <Button onClick={() => setGenerateSheetOpen(true)}>
              <FileText className="w-4 h-4 mr-1" />
              Generate Invoice
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="shrink-0">
          <InvoiceStatsCards stats={stats} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="flex-1 flex flex-col overflow-hidden">
          <div className="shrink-0 flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Invoices</TabsTrigger>
              <TabsTrigger value="pending">Pending Collection</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="flex-1 flex flex-col overflow-hidden mt-4 space-y-4">
            <InvoiceFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            <div className="flex-1 overflow-y-auto">
              {viewMode === 'list' ? (
                <InvoiceList invoices={filteredInvoices} onInvoiceClick={handleInvoiceClick} />
              ) : (
                <InvoiceTableView invoices={filteredInvoices} onInvoiceClick={handleInvoiceClick} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="flex-1 overflow-y-auto mt-4">
            <InvoiceTableView
              invoices={invoices.filter((inv) => 
                inv.status === INVOICE_STATUS.ISSUED || inv.status === INVOICE_STATUS.PARTIAL
              )}
              onInvoiceClick={handleInvoiceClick}
            />
          </TabsContent>

          <TabsContent value="overdue" className="flex-1 overflow-y-auto mt-4">
            <InvoiceTableView
              invoices={invoices.filter((inv) => inv.status === INVOICE_STATUS.OVERDUE)}
              onInvoiceClick={handleInvoiceClick}
            />
          </TabsContent>
        </Tabs>

        {/* Sheets */}
        <InvoiceDetailSheet
          invoice={selectedInvoice}
          open={detailSheetOpen}
          onOpenChange={setDetailSheetOpen}
          onRecordPayment={handleRecordPaymentClick}
        />

        <RecordPaymentSheet
          invoice={selectedInvoice}
          open={paymentSheetOpen}
          onOpenChange={setPaymentSheetOpen}
          onRecordPayment={handleRecordPayment}
        />

        <GenerateInvoiceSheet
          open={generateSheetOpen}
          onOpenChange={(open) => {
            setGenerateSheetOpen(open);
            if (!open) setPendingBillData(null);
          }}
          onGenerate={handleGenerateInvoice}
          existingInvoices={invoices}
          prefillData={pendingBillData}
        />
      </div>
    </div>
  );
}
