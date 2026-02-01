import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, User, Calendar, IndianRupee, Building2 } from 'lucide-react';
import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS, INVOICE_TYPE_LABELS } from '../utils/types';
import { format } from 'date-fns';
import { formatCurrency } from '../utils';

export function InvoiceList({ invoices, onInvoiceClick }) {
  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No invoices found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or generate a new invoice from a finalized bill.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {invoices.map((invoice) => (
        <Card
          key={invoice.id}
          className="border-border hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => onInvoiceClick(invoice)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{invoice.invoiceNumber}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    {invoice.patient.name}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className={INVOICE_STATUS_COLORS[invoice.status]} variant="secondary">
                  {INVOICE_STATUS_LABELS[invoice.status]}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {INVOICE_TYPE_LABELS[invoice.invoiceType]}
                </Badge>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Invoice Date
                </span>
                <span className="text-foreground">
                  {format(new Date(invoice.invoiceDate), 'dd MMM yyyy')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">UHID</span>
                <span className="text-foreground font-mono text-xs">
                  {invoice.patient.uhid}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />
                  Total
                </span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(invoice.grandTotal)}
                </span>
              </div>
              {invoice.balanceDue > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Balance Due</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(invoice.balanceDue)}
                  </span>
                </div>
              )}
            </div>

            {invoice.insuranceClaim && (
              <div className="mt-3 pt-2 border-t border-border">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="w-3 h-3" />
                  {invoice.insuranceClaim.provider}
                  <Badge variant="outline" className="ml-auto text-xs capitalize">
                    {invoice.insuranceClaim.status}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
