import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '@/carewell/hooks/useLocalStorage';
import { mockTransactions, mockPendingInvoices } from './mockData';
import { calculatePaymentStats, filterTransactions } from './utils';
import { PaymentStatsCards } from './components/PaymentStatsCards';
import { PaymentFilters } from './components/PaymentFilters';
import { TransactionList } from './components/TransactionList';
import { TransactionTableView } from './components/TransactionTableView';
import { TransactionDetailSheet } from './components/TransactionDetailSheet';
import { CollectPaymentSheet } from './components/CollectPaymentSheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { IndianRupee, CreditCard, FileText, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from './utils';

export default function PaymentDashboard() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useLocalStorage('hms_transactions', mockTransactions);
  const [pendingInvoices] = useLocalStorage('hms_pending_invoices', mockPendingInvoices);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [collectSheetOpen, setCollectSheetOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const stats = useMemo(() => calculatePaymentStats(transactions), [transactions]);

  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactions, {
      search: searchQuery,
      status: statusFilter,
      gateway: gatewayFilter,
    });
  }, [transactions, searchQuery, statusFilter, gatewayFilter]);

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailSheetOpen(true);
  };

  const handleCollectPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setCollectSheetOpen(true);
  };

  const handlePaymentSuccess = (invoiceId, transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
    toast({ title: 'Payment Recorded', description: `${formatCurrency(transaction.amount)} collected successfully` });
  };

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      <div className="p-6 space-y-6 flex flex-col flex-1 overflow-hidden">
        <div className="flex items-start justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <IndianRupee className="w-6 h-6 text-primary" />
              Payment Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Razorpay • Stripe • UPI • Cash • Bank Transfer
            </p>
          </div>
          <Button onClick={() => setCollectSheetOpen(true)}>
            <CreditCard className="w-4 h-4 mr-1" />
            Collect Payment
          </Button>
        </div>

        <PaymentStatsCards stats={stats} />

        <Tabs defaultValue="transactions" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="shrink-0">
            <TabsTrigger value="transactions">All Transactions</TabsTrigger>
            <TabsTrigger value="pending">Pending Invoices ({pendingInvoices.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="flex-1 flex flex-col overflow-hidden mt-4 space-y-4">
            <PaymentFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              gatewayFilter={gatewayFilter}
              onGatewayFilterChange={setGatewayFilter}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            <div className="flex-1 overflow-y-auto">
              {viewMode === 'list' ? (
                <TransactionList transactions={filteredTransactions} onTransactionClick={handleTransactionClick} />
              ) : (
                <TransactionTableView transactions={filteredTransactions} onTransactionClick={handleTransactionClick} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="flex-1 overflow-y-auto mt-4">
            <div className="space-y-3">
              {pendingInvoices.map((invoice) => (
                <Card key={invoice.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{invoice.patientName}</p>
                      <p className="text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-destructive">{formatCurrency(invoice.balanceDue)}</p>
                      <p className="text-xs text-muted-foreground">Due: {formatDate(invoice.dueDate)}</p>
                    </div>
                    <Button size="sm" onClick={() => handleCollectPayment(invoice)}>Collect</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <TransactionDetailSheet
          transaction={selectedTransaction}
          open={detailSheetOpen}
          onOpenChange={setDetailSheetOpen}
        />

        <CollectPaymentSheet
          invoice={selectedInvoice || pendingInvoices[0]}
          open={collectSheetOpen}
          onOpenChange={setCollectSheetOpen}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
  );
}
