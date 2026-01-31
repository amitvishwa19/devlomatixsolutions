import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, User, CreditCard } from 'lucide-react';
import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS } from './types';
import { formatCurrency } from './utils';
import { format } from 'date-fns';

export function InvoiceCard({ invoice, onClick }) {
  return (
    <Card
      className="border-border hover:border-primary/50 transition-colors cursor-pointer"
      onClick={() => onClick(invoice)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{invoice.id}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <User className="w-3 h-3" />
                {invoice.patientName}
              </div>
            </div>
          </div>
          <Badge className={INVOICE_STATUS_COLORS[invoice.status]}>
            {INVOICE_STATUS_LABELS[invoice.status]}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Issued
            </span>
            <span className="text-foreground">
              {format(new Date(invoice.dateIssued), 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Due</span>
            <span className="text-foreground">
              {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-muted-foreground flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              Total
            </span>
            <span className="font-semibold text-foreground">
              {formatCurrency(invoice.total)}
            </span>
          </div>
          {invoice.balance > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Balance</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(invoice.balance)}
              </span>
            </div>
          )}
        </div>

        {invoice.items.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3 truncate">
            {invoice.items.map((item) => item.description).join(', ')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
