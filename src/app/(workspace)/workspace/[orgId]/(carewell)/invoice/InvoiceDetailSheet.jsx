import React, { useRef } from 'react';
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
import { 
  FileText, User, Calendar, CreditCard, Printer, Download, 
  Phone, X, Shield, Lock, Building2, Mail, MapPin, AlertCircle 
} from 'lucide-react';
import { 
  INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS, INVOICE_TYPE_LABELS,
  PAYMENT_METHOD_LABELS, HOSPITAL_DETAILS 
} from './types';
import { formatCurrency, calculateDaysOverdue, numberToWords } from './utils';
import { printInvoice, downloadInvoicePDF } from './utils/printUtils';
import { InvoicePrintTemplate } from './components/InvoicePrintTemplate';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { QuickActionsMenu, ModuleLinkBadge } from '@/carewell/utils/crossModuleNavigation';

export function InvoiceDetailSheet({ invoice, open, onOpenChange, onRecordPayment }) {
  const printRef = useRef(null);
  const { toast } = useToast();

  if (!invoice) return null;

  const daysOverdue = invoice.status === 'overdue' ? calculateDaysOverdue(invoice.dueDate) : 0;

  const handlePrint = () => {
    if (printRef.current) {
      printInvoice(printRef.current, invoice);
      toast({
        title: "Print initiated",
        description: "The print dialog should open shortly.",
      });
    }
  };

  const handleDownloadPDF = () => {
    if (printRef.current) {
      downloadInvoicePDF(printRef.current, invoice);
      toast({
        title: "PDF Download",
        description: "Use 'Save as PDF' in the print dialog to save your invoice.",
      });
    }
  };

  const handleEmail = () => {
    toast({
      title: "Email Invoice",
      description: "Email functionality will be available once backend is connected.",
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="bg-transparent border-0 p-2 min-w-[800px]">
          <div className="bg-card h-full rounded-lg border flex flex-col">
            <SheetHeader className="space-y-1 p-4 pb-2 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <SheetTitle className="flex items-center gap-2">
                      {invoice.invoiceNumber}
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </SheetTitle>
                    <p className="text-xs text-muted-foreground">
                      Official Invoice • Immutable Document
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{INVOICE_TYPE_LABELS[invoice.invoiceType]}</Badge>
                  <Badge className={INVOICE_STATUS_COLORS[invoice.status]}>
                    {INVOICE_STATUS_LABELS[invoice.status]}
                  </Badge>
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
                {/* Hospital & Patient Header */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Hospital Details */}
                  <div className="p-4 bg-muted/30 rounded-lg space-y-1">
                    <h4 className="font-semibold text-foreground">{HOSPITAL_DETAILS.name}</h4>
                    <p className="text-xs text-muted-foreground">{HOSPITAL_DETAILS.address}</p>
                    <p className="text-xs text-muted-foreground">{HOSPITAL_DETAILS.city}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                      <span>GSTIN: {HOSPITAL_DETAILS.gstin}</span>
                    </div>
                  </div>

                  {/* Patient Details */}
                  <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <span className="font-semibold">{invoice.patient.name}</span>
                        <Badge variant="outline" className="text-xs">{invoice.patient.uhid}</Badge>
                      </div>
                      <QuickActionsMenu 
                        patientId={invoice.patient.uhid}
                        patientName={invoice.patient.name}
                        actions={['viewPatient', 'scheduleAppointment', 'viewPrescriptions', 'orderLabTest']}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {invoice.patient.age} yrs, {invoice.patient.gender}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      +91 {invoice.patient.phone}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {invoice.patient.address}
                    </div>
                  </div>
                </div>

                {/* Invoice Dates */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Invoice Date</p>
                    <p className="font-medium">{format(new Date(invoice.invoiceDate), 'dd MMM yyyy')}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p className="font-medium">{format(new Date(invoice.dueDate), 'dd MMM yyyy')}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Bill Reference</p>
                    <p className="font-medium font-mono text-sm">{invoice.billId}</p>
                  </div>
                </div>

                <Separator />

                {/* Line Items */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Service Details</h4>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-center">HSN</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoice.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-muted-foreground">{item.slNo || index + 1}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.description}</p>
                                {item.department && (
                                  <p className="text-xs text-muted-foreground">{item.department}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-xs font-mono">{item.hsn}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(item.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {/* Amount in Words */}
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Amount in Words</p>
                      <p className="text-sm font-medium">{numberToWords(Math.round(invoice.grandTotal))}</p>
                    </div>

                    {/* Insurance if applicable */}
                    {invoice.insuranceClaim && (
                      <div className="p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">Insurance Claim</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Provider</span>
                            <span>{invoice.insuranceClaim.provider}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Policy #</span>
                            <span className="font-mono">{invoice.insuranceClaim.policyNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Claim Amount</span>
                            <span className="font-medium">{formatCurrency(invoice.insuranceClaim.claimAmount)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant="outline" className="capitalize">{invoice.insuranceClaim.status}</Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">CGST (9%)</span>
                      <span>{formatCurrency(invoice.cgst)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">SGST (9%)</span>
                      <span>{formatCurrency(invoice.sgst)}</span>
                    </div>
                    {invoice.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="text-emerald-600">-{formatCurrency(invoice.discount)}</span>
                      </div>
                    )}
                    {invoice.roundOff !== 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Round Off</span>
                        <span>{invoice.roundOff > 0 ? '+' : ''}{formatCurrency(invoice.roundOff)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Grand Total</span>
                      <span>{formatCurrency(invoice.grandTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount Paid</span>
                      <span className="text-emerald-600">{formatCurrency(invoice.amountPaid)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>Balance Due</span>
                      <span className={invoice.balanceDue > 0 ? 'text-red-600' : 'text-emerald-600'}>
                        {formatCurrency(invoice.balanceDue)}
                      </span>
                    </div>
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
                            <p className="font-medium">{formatCurrency(payment.amount)}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(payment.date), 'dd MMM yyyy')} • {PAYMENT_METHOD_LABELS[payment.method]}
                            </p>
                            <p className="text-xs text-muted-foreground">Received by: {payment.receivedBy}</p>
                          </div>
                          <Badge variant="outline" className="font-mono text-xs">
                            {payment.reference}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Void Details if applicable */}
                {invoice.voidDetails && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">Invoice Voided</h4>
                    <div className="space-y-1 text-xs text-red-700 dark:text-red-300">
                      <p>Reason: {invoice.voidDetails.voidReason}</p>
                      <p>Voided on: {format(new Date(invoice.voidDetails.voidDate), 'dd MMM yyyy')}</p>
                      <p>Voided by: {invoice.voidDetails.voidedBy}</p>
                      {invoice.voidDetails.creditNoteNumber && (
                        <p>Credit Note: {invoice.voidDetails.creditNoteNumber}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex justify-between text-xs text-muted-foreground pt-4 border-t">
                  <div>
                    <p>Generated by: {invoice.generatedBy}</p>
                    <p>Authorized by: {invoice.authorizedBy}</p>
                  </div>
                  <div className="text-right">
                    <p>Print Count: {invoice.printCount}</p>
                    <p>Created: {format(new Date(invoice.createdAt), 'dd MMM yyyy HH:mm')}</p>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="p-4 border-t space-y-3">
              {invoice.balanceDue > 0 && invoice.status !== 'void' && (
                <Button className="w-full" onClick={() => onRecordPayment(invoice)}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
              )}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Invoice
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleDownloadPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleEmail}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Hidden print template */}
      <div className="hidden">
        <InvoicePrintTemplate ref={printRef} invoice={invoice} />
      </div>
    </>
  );
}
