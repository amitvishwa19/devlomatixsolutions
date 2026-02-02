import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS } from '../utils/types';
import { formatCurrency } from '../utils/utils';
import { format } from 'date-fns';

export function InvoiceTableView({ invoices, onInvoiceClick }) {
  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">📄</span>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No invoices found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or create a new invoice.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Invoice ID</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Date Issued</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow
              key={invoice.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onInvoiceClick(invoice)}
            >
              <TableCell className="font-medium">{invoice.id}</TableCell>
              <TableCell>{invoice.patientName}</TableCell>
              <TableCell>{format(new Date(invoice.dateIssued), 'MMM d, yyyy')}</TableCell>
              <TableCell>{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</TableCell>
              <TableCell className="font-medium">{formatCurrency(invoice.total)}</TableCell>
              <TableCell className="text-emerald-600 dark:text-emerald-400">
                {formatCurrency(invoice.amountPaid)}
              </TableCell>
              <TableCell className={invoice.balance > 0 ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                {formatCurrency(invoice.balance)}
              </TableCell>
              <TableCell>
                <Badge className={INVOICE_STATUS_COLORS[invoice.status]}>
                  {INVOICE_STATUS_LABELS[invoice.status]}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
