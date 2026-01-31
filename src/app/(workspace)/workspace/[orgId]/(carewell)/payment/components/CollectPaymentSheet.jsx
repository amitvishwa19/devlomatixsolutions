import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  IndianRupee,
  CreditCard,
  Smartphone,
  Banknote,
  Building2,
  User,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '../utils';
import { PAYMENT_GATEWAYS } from '../types';
import { GatewaySelector } from './GatewaySelector';
import { RazorpayPayment } from './RazorpayPayment';
import { StripePayment } from './StripePayment';
import { UPIPayment } from './UPIPayment';
import { useToast } from '@/hooks/use-toast';

export function CollectPaymentSheet({ 
  invoice, 
  open, 
  onOpenChange, 
  onPaymentSuccess 
}) {
  const { toast } = useToast();
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [amount, setAmount] = useState(invoice?.balanceDue || 0);
  const [step, setStep] = useState('select'); // select, process, success
  const [paymentMethod, setPaymentMethod] = useState(null);

  React.useEffect(() => {
    if (invoice) {
      setAmount(invoice.balanceDue || invoice.balance || 0);
      setSelectedGateway(null);
      setStep('select');
    }
  }, [invoice]);

  if (!invoice) return null;

  const handleGatewaySelect = (gateway) => {
    setSelectedGateway(gateway);
    setStep('process');
  };

  const handlePaymentComplete = (paymentData) => {
    setStep('success');
    
    // Create transaction record
    const transaction = {
      id: `TXN-${Date.now()}`,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      patientId: invoice.patientId || invoice.patient?.id,
      patientName: invoice.patientName || invoice.patient?.name,
      patientPhone: invoice.patientPhone || invoice.patient?.phone,
      amount: paymentData.amount,
      gateway: selectedGateway,
      method: paymentData.method,
      status: 'success',
      paymentType: paymentData.amount >= (invoice.balanceDue || invoice.balance) ? 'full' : 'partial',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      ...paymentData,
    };

    setTimeout(() => {
      onPaymentSuccess(invoice.id, transaction);
      toast({
        title: 'Payment Successful',
        description: `${formatCurrency(paymentData.amount)} collected successfully`,
      });
      onOpenChange(false);
    }, 1500);
  };

  const handleBack = () => {
    setStep('select');
    setSelectedGateway(null);
  };

  const quickAmounts = [
    { label: 'Full', value: invoice.balanceDue || invoice.balance || 0 },
    { label: 'Half', value: Math.round((invoice.balanceDue || invoice.balance || 0) / 2) },
    { label: '₹1,000', value: 1000 },
    { label: '₹5,000', value: 5000 },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-transparent border-0 p-2 min-w-[550px]">
        <div className="bg-card h-full rounded-lg border flex flex-col">
          <SheetHeader className="p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-primary" />
                Collect Payment
              </SheetTitle>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 p-4">
            {step === 'success' ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Payment Successful!</h3>
                <p className="text-muted-foreground mt-2">
                  {formatCurrency(amount)} has been collected
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Invoice Summary */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.patientName || invoice.patient?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.patientPhone || invoice.patient?.phone}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Invoice</p>
                      <p className="font-mono">{invoice.invoiceNumber || invoice.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Balance Due</p>
                      <p className="text-lg font-bold text-destructive">
                        {formatCurrency(invoice.balanceDue || invoice.balance)}
                      </p>
                    </div>
                  </div>
                </div>

                {step === 'select' && (
                  <>
                    {/* Amount Selection */}
                    <div className="space-y-3">
                      <Label>Payment Amount</Label>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                        min={1}
                        max={invoice.balanceDue || invoice.balance}
                        className="text-lg font-bold"
                      />
                      <div className="flex flex-wrap gap-2">
                        {quickAmounts.map((qa) => (
                          <Button
                            key={qa.label}
                            variant="outline"
                            size="sm"
                            onClick={() => setAmount(Math.min(qa.value, invoice.balanceDue || invoice.balance))}
                            className={amount === qa.value ? 'border-primary' : ''}
                          >
                            {qa.label}: {formatCurrency(Math.min(qa.value, invoice.balanceDue || invoice.balance))}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Gateway Selection */}
                    <div className="space-y-3">
                      <Label>Select Payment Method</Label>
                      <GatewaySelector
                        amount={amount}
                        onSelect={handleGatewaySelect}
                      />
                    </div>
                  </>
                )}

                {step === 'process' && (
                  <>
                    <Button variant="ghost" size="sm" onClick={handleBack}>
                      ← Back to gateway selection
                    </Button>

                    {selectedGateway === PAYMENT_GATEWAYS.RAZORPAY && (
                      <RazorpayPayment
                        amount={amount}
                        invoice={invoice}
                        onSuccess={handlePaymentComplete}
                        onCancel={handleBack}
                      />
                    )}

                    {selectedGateway === PAYMENT_GATEWAYS.STRIPE && (
                      <StripePayment
                        amount={amount}
                        invoice={invoice}
                        onSuccess={handlePaymentComplete}
                        onCancel={handleBack}
                      />
                    )}

                    {selectedGateway === PAYMENT_GATEWAYS.UPI && (
                      <UPIPayment
                        amount={amount}
                        invoice={invoice}
                        onSuccess={handlePaymentComplete}
                        onCancel={handleBack}
                      />
                    )}

                    {selectedGateway === PAYMENT_GATEWAYS.CASH && (
                      <div className="space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Banknote className="w-8 h-8 text-emerald-500" />
                          <div>
                            <h4 className="font-semibold">Cash Payment</h4>
                            <p className="text-sm text-muted-foreground">
                              Collect {formatCurrency(amount)} in cash
                            </p>
                          </div>
                        </div>
                        <Input
                          placeholder="Enter receipt number (optional)"
                          onChange={(e) => setPaymentMethod({ reference: e.target.value })}
                        />
                        <Button 
                          className="w-full" 
                          onClick={() => handlePaymentComplete({ 
                            amount, 
                            method: 'cash',
                            reference: paymentMethod?.reference || `CASH-${Date.now()}`,
                          })}
                        >
                          Confirm Cash Received
                        </Button>
                      </div>
                    )}

                    {selectedGateway === PAYMENT_GATEWAYS.NEFT && (
                      <div className="space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-8 h-8 text-blue-500" />
                          <div>
                            <h4 className="font-semibold">NEFT/RTGS/IMPS</h4>
                            <p className="text-sm text-muted-foreground">
                              Record bank transfer of {formatCurrency(amount)}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label>Bank Reference Number *</Label>
                            <Input
                              placeholder="e.g., NEFT-HDFC-123456"
                              onChange={(e) => setPaymentMethod({ 
                                ...paymentMethod, 
                                reference: e.target.value 
                              })}
                            />
                          </div>
                          <div>
                            <Label>Bank Name</Label>
                            <Input
                              placeholder="e.g., HDFC Bank"
                              onChange={(e) => setPaymentMethod({ 
                                ...paymentMethod, 
                                bankName: e.target.value 
                              })}
                            />
                          </div>
                        </div>
                        <Button 
                          className="w-full" 
                          disabled={!paymentMethod?.reference}
                          onClick={() => handlePaymentComplete({ 
                            amount, 
                            method: 'neft',
                            reference: paymentMethod?.reference,
                            bankName: paymentMethod?.bankName,
                          })}
                        >
                          Confirm Bank Transfer
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
