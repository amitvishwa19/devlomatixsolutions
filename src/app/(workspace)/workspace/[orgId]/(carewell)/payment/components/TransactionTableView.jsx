import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, RotateCcw } from 'lucide-react';
import { formatCurrency, formatDateTime, getStatusVariant, getGatewayName } from '../utils';
import { TRANSACTION_STATUS } from '../types';

export function TransactionTableView({ transactions, onTransactionClick, onRefundClick }) {
  if (transactions.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Gateway</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow 
              key={transaction.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onTransactionClick(transaction)}
            >
              <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{transaction.patientName}</p>
                  <p className="text-xs text-muted-foreground">{transaction.patientPhone}</p>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {transaction.invoiceNumber || '-'}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{getGatewayName(transaction.gateway)}</Badge>
              </TableCell>
              <TableCell className="capitalize">
                {transaction.method}
                {transaction.cardLast4 && ` •••• ${transaction.cardLast4}`}
              </TableCell>
              <TableCell className={`text-right font-semibold ${
                transaction.status === TRANSACTION_STATUS.SUCCESS 
                  ? 'text-emerald-600' 
                  : transaction.status === TRANSACTION_STATUS.FAILED
                  ? 'text-destructive'
                  : ''
              }`}>
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(transaction.status)} className="capitalize">
                  {transaction.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDateTime(transaction.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); onTransactionClick(transaction); }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {transaction.status === TRANSACTION_STATUS.SUCCESS && onRefundClick && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); onRefundClick(transaction); }}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
