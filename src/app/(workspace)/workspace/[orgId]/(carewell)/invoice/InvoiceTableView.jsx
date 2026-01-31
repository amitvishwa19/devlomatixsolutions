import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS, INVOICE_TYPE_LABELS } from './types';
import { formatCurrency, calculateDaysOverdue } from './utils';
import { format } from 'date-fns';
import { FileText, AlertCircle } from 'lucide-react';

export function InvoiceTableView({ invoices, onInvoiceClick }) {
  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No invoices found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or generate a new invoice.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Invoice #</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>UHID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Paid</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            const isOverdue = invoice.status === 'overdue';
            const daysOverdue = isOverdue ? calculateDaysOverdue(invoice.dueDate) : 0;
            
            return (
              <TableRow
                key={invoice.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onInvoiceClick(invoice)}
              >
                <TableCell className="font-medium font-mono text-sm">
                  {invoice.invoiceNumber}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{invoice.patient.name}</p>
                    {invoice.insuranceClaim && (
                      <p className="text-xs text-muted-foreground">
                        {invoice.insuranceClaim.provider}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{invoice.patient.uhid}</TableCell>
                <TableCell>
                  <Badge variant="outline">{INVOICE_TYPE_LABELS[invoice.invoiceType]}</Badge>
                </TableCell>
                <TableCell>{format(new Date(invoice.invoiceDate), 'dd MMM yyyy')}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(invoice.grandTotal)}
                </TableCell>
                <TableCell className="text-right text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(invoice.amountPaid)}
                </TableCell>
                <TableCell className={`text-right ${invoice.balanceDue > 0 ? 'text-red-600 dark:text-red-400 font-medium' : ''}`}>
                  {formatCurrency(invoice.balanceDue)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Badge className={INVOICE_STATUS_COLORS[invoice.status]}>
                      {INVOICE_STATUS_LABELS[invoice.status]}
                    </Badge>
                    {isOverdue && daysOverdue > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        {daysOverdue}d
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
