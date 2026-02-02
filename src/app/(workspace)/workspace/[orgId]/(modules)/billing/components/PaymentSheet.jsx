import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreditCard, X, Smartphone, Building2, Banknote } from 'lucide-react';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../utils/types';
import { formatCurrency } from '../utils/utils';
import { useFormValidationToast } from '../../hooks/useFormValidationToast';

const paymentSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  method: z.string().min(1, 'Payment method is required'),
  reference: z.string().min(1, 'Reference is required'),
  date: z.string().min(1, 'Date is required'),
});

const PAYMENT_ICONS = {
  [PAYMENT_METHODS.UPI]: Smartphone,
  [PAYMENT_METHODS.CARD]: CreditCard,
  [PAYMENT_METHODS.NEFT]: Building2,
  [PAYMENT_METHODS.RTGS]: Building2,
  [PAYMENT_METHODS.IMPS]: Building2,
  [PAYMENT_METHODS.CASH]: Banknote,
};

export function PaymentSheet({ invoice, open, onOpenChange, onRecordPayment }) {
  const { showValidationErrors } = useFormValidationToast();

  const form = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: invoice?.balance || 0,
      method: PAYMENT_METHODS.UPI,
      reference: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const watchMethod = form.watch('method');
  const PaymentIcon = PAYMENT_ICONS[watchMethod] || CreditCard;

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      form.reset({
        amount: invoice?.balance || 0,
        method: PAYMENT_METHODS.UPI,
        reference: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
    onOpenChange(isOpen);
  };

  const onSubmit = (data) => {
    console.log('Payment data:', data);

    const payment = {
      id: `PAY-${Date.now()}`,
      date: data.date,
      amount: data.amount,
      method: data.method,
      reference: data.reference,
    };

    onRecordPayment(invoice.id, payment);
    handleOpenChange(false);
  };

  if (!invoice) return null;

  const getReferencePlaceholder = () => {
    switch (watchMethod) {
      case PAYMENT_METHODS.UPI:
        return 'UPI Transaction ID';
      case PAYMENT_METHODS.NEFT:
      case PAYMENT_METHODS.RTGS:
      case PAYMENT_METHODS.IMPS:
        return 'Bank Reference Number';
      case PAYMENT_METHODS.CARD:
        return 'Card Transaction ID';
      case PAYMENT_METHODS.CHEQUE:
        return 'Cheque Number';
      case PAYMENT_METHODS.CASH:
        return 'Receipt Number';
      default:
        return 'Reference ID';
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="bg-transparent border-0 p-2 min-w-[500px]">
        <div className="bg-card h-full rounded-lg border flex flex-col">
          <SheetHeader className="space-y-1 p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Record Payment
              </SheetTitle>
              <Button variant="ghost" size="icon" onClick={() => handleOpenChange(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {/* Invoice Summary */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Invoice</span>
                  <span className="font-medium">{invoice.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Patient</span>
                  <span>{invoice.patientName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Already Paid</span>
                  <span className="text-emerald-600">{formatCurrency(invoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-border">
                  <span>Balance Due</span>
                  <span className="text-red-600">{formatCurrency(invoice.balance)}</span>
                </div>
              </div>

              {/* Quick Payment Options */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Quick Select</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => form.setValue('amount', invoice.balance)}
                  >
                    Full: {formatCurrency(invoice.balance)}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => form.setValue('amount', Math.round(invoice.balance / 2))}
                  >
                    Half: {formatCurrency(Math.round(invoice.balance / 2))}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => form.setValue('amount', 1000)}
                  >
                    ₹1,000
                  </Button>
                </div>
              </div>

              <Form {...form}>
                <form
                  id="payment-form"
                  onSubmit={form.handleSubmit(onSubmit, showValidationErrors)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Amount (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max={invoice.balance}
                            step="1"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(PAYMENT_METHODS).map(([key, value]) => (
                              <SelectItem key={value} value={value}>
                                {PAYMENT_METHOD_LABELS[value]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <PaymentIcon className="w-4 h-4" />
                          {getReferencePlaceholder()}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={getReferencePlaceholder()} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </ScrollArea>

          <div className="p-4 border-t flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form="payment-form">
              Record Payment
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
