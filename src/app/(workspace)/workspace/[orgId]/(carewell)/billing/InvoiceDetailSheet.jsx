import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, User, Calendar, CreditCard, Printer, Download, Send, Phone, X, Shield, AlertCircle, Receipt } from 'lucide-react';
import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS, PAYMENT_METHOD_LABELS, INVOICE_STATUS } from './types';
import { formatCurrency } from './utils';
import { format } from 'date-fns';

// Calculate days overdue locally
function calculateDaysOverdue(dueDate) {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = today - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

export function InvoiceDetailSheet({ invoice, open, onOpenChange, onRecordPayment, onGenerateInvoice }) {
  if (!invoice) return null;

  const daysOverdue = invoice.status === 'overdue' ? calculateDaysOverdue(invoice.dueDate) : 0;

  // Can generate invoice if bill is not draft and not already invoiced
  const canGenerateInvoice = invoice.status !== INVOICE_STATUS.DRAFT && 
                              invoice.status !== INVOICE_STATUS.CANCELLED &&
                              !invoice.invoiceGenerated;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-transparent border-0 p-2 min-w-[680px]">
        <div className="bg-card h-full rounded-lg border flex flex-col">
          <SheetHeader className="space-y-1 p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Bill: {invoice.id}
              </SheetTitle>
              <div className="flex items-center gap-2">
                <Badge className={INVOICE_STATUS_COLORS[invoice.status]}>
                  {INVOICE_STATUS_LABELS[invoice.status]}
                </Badge>
                {invoice.invoiceGenerated && (
                  <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                    <Receipt className="w-3 h-3 mr-1" />
                    Invoiced
                  </Badge>
                )}
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {daysOverdue > 0 && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                <AlertCircle className="w-4 h-4" />
                {daysOverdue} days overdue
              </div>
            )}
          </SheetHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Patient Information</h4>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="p-2 rounded-full bg-primary/10">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{invoice.patientName}</p>
                    <p className="text-sm text-muted-foreground">ID: {invoice.patientId}</p>
                  </div>
                  {invoice.patientPhone && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      +91 {invoice.patientPhone}
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Date Issued
                  </p>
                  <p className="font-medium">{format(new Date(invoice.dateIssued), 'dd MMM yyyy')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{format(new Date(invoice.dueDate), 'dd MMM yyyy')}</p>
                </div>
              </div>

              <Separator />

              {/* Line Items */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Line Items</h4>
                <div className="border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Description</TableHead>
                        <TableHead className="text-center">HSN</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell className="text-center text-muted-foreground text-xs">{item.hsn || '-'}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span>{formatCurrency(invoice.gst || invoice.tax)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-emerald-600">-{formatCurrency(invoice.discount)}</span>
                  </div>
                )}
                {invoice.tds > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">TDS Deducted</span>
                    <span className="text-amber-600">-{formatCurrency(invoice.tds)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="text-emerald-600">{formatCurrency(invoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Balance Due</span>
                  <span className={invoice.balance > 0 ? 'text-red-600' : 'text-emerald-600'}>
                    {formatCurrency(invoice.balance)}
                  </span>
                </div>
              </div>

              {/* Payment History */}
              {invoice.payments.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment History
                  </h4>
                  <div className="space-y-2">
                    {invoice.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">{formatCurrency(payment.amount)}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(payment.date), 'dd MMM yyyy')} • {PAYMENT_METHOD_LABELS[payment.method]}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {payment.reference}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insurance */}
              {invoice.insuranceClaim && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Insurance Claim
                  </h4>
                  <div className="p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{invoice.insuranceClaim.provider}</p>
                        <p className="text-sm text-muted-foreground">
                          Claim #: {invoice.insuranceClaim.claimNumber}
                        </p>
                        {invoice.insuranceClaim.amount > 0 && (
                          <p className="text-sm text-emerald-600">
                            Claimed: {formatCurrency(invoice.insuranceClaim.amount)}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {invoice.insuranceClaim.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {invoice.notes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                  <p className="text-sm text-foreground p-3 bg-muted/50 rounded-lg">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="p-4 border-t space-y-3">
            {/* Generate Invoice Button - Primary Action */}
            {canGenerateInvoice && onGenerateInvoice && (
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700" 
                onClick={() => onGenerateInvoice(invoice)}
              >
                <Receipt className="w-4 h-4 mr-2" />
                Generate Invoice
              </Button>
            )}
            
            {invoice.balance > 0 && (
              <Button 
                className="w-full" 
                variant={canGenerateInvoice ? "outline" : "default"}
                onClick={() => onRecordPayment(invoice)}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
