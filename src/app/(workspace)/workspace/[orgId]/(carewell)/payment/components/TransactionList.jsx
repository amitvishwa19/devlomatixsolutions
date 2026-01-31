import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCcw,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { formatCurrency, formatDateTime, getStatusVariant, getGatewayName } from '../utils';
import { TRANSACTION_STATUS, PAYMENT_GATEWAYS } from '../types';

const getMethodIcon = (method, gateway) => {
  if (gateway === PAYMENT_GATEWAYS.CASH) return Banknote;
  if (gateway === PAYMENT_GATEWAYS.NEFT) return Building2;
  if (method === 'upi') return Smartphone;
  return CreditCard;
};

const getStatusIcon = (status) => {
  switch (status) {
    case TRANSACTION_STATUS.SUCCESS:
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case TRANSACTION_STATUS.FAILED:
      return <XCircle className="w-4 h-4 text-destructive" />;
    case TRANSACTION_STATUS.PENDING:
    case TRANSACTION_STATUS.PROCESSING:
      return <Clock className="w-4 h-4 text-amber-500" />;
    case TRANSACTION_STATUS.REFUNDED:
      return <RefreshCcw className="w-4 h-4 text-blue-500" />;
    default:
      return null;
  }
};

export function TransactionList({ transactions, onTransactionClick, onRefundClick }) {
  if (transactions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground">No transactions found</h3>
        <p className="text-sm text-muted-foreground">
          Transactions will appear here once payments are processed
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        const MethodIcon = getMethodIcon(transaction.method, transaction.gateway);
        
        return (
          <Card
            key={transaction.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onTransactionClick(transaction)}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="p-2 rounded-lg bg-muted">
                <MethodIcon className="w-5 h-5 text-foreground" />
              </div>

              {/* Main Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground">
                    {transaction.patientName}
                  </span>
                  {getStatusIcon(transaction.status)}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{transaction.id}</span>
                  {transaction.invoiceNumber && (
                    <>
                      <span>•</span>
                      <span>{transaction.invoiceNumber}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {getGatewayName(transaction.gateway)}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {transaction.method}
                  </Badge>
                  {transaction.cardLast4 && (
                    <span className="text-xs text-muted-foreground">
                      •••• {transaction.cardLast4}
                    </span>
                  )}
                  {transaction.upiApp && (
                    <span className="text-xs text-muted-foreground capitalize">
                      via {transaction.upiApp}
                    </span>
                  )}
                </div>
              </div>

              {/* Amount & Actions */}
              <div className="text-right space-y-2">
                <p className={`text-lg font-bold ${
                  transaction.status === TRANSACTION_STATUS.SUCCESS 
                    ? 'text-emerald-600' 
                    : transaction.status === TRANSACTION_STATUS.FAILED
                    ? 'text-destructive'
                    : 'text-foreground'
                }`}>
                  {formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(transaction.createdAt)}
                </p>
                <Badge variant={getStatusVariant(transaction.status)} className="capitalize">
                  {transaction.status}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t">
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onTransactionClick(transaction); }}>
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Button>
              {transaction.status === TRANSACTION_STATUS.SUCCESS && onRefundClick && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); onRefundClick(transaction); }}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Refund
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
