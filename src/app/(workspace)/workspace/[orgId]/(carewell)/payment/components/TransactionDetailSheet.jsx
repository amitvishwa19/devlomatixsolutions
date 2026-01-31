import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Banknote,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCcw,
  Copy,
  Printer,
  RotateCcw,
  FileText,
  User,
  Phone,
} from 'lucide-react';
import { formatCurrency, formatDateTime, getStatusVariant, getGatewayName } from '../utils';
import { TRANSACTION_STATUS, PAYMENT_GATEWAYS } from '../types';
import { useToast } from '@/hooks/use-toast';

const getMethodIcon = (method, gateway) => {
  if (gateway === PAYMENT_GATEWAYS.CASH) return Banknote;
  if (gateway === PAYMENT_GATEWAYS.NEFT) return Building2;
  if (method === 'upi') return Smartphone;
  return CreditCard;
};

export function TransactionDetailSheet({ transaction, open, onOpenChange, onRefundClick }) {
  const { toast } = useToast();

  if (!transaction) return null;

  const MethodIcon = getMethodIcon(transaction.method, transaction.gateway);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`,
    });
  };

  const handlePrint = () => {
    toast({
      title: 'Print Receipt',
      description: 'Receipt printing initiated',
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-transparent border-0 p-2 min-w-[500px]">
        <div className="bg-card h-full rounded-lg border flex flex-col">
          <SheetHeader className="p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <MethodIcon className="w-5 h-5 text-primary" />
                Transaction Details
              </SheetTitle>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg ${
                transaction.status === TRANSACTION_STATUS.SUCCESS 
                  ? 'bg-emerald-500/10' 
                  : transaction.status === TRANSACTION_STATUS.FAILED
                  ? 'bg-destructive/10'
                  : 'bg-muted'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {transaction.status === TRANSACTION_STATUS.SUCCESS && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    )}
                    {transaction.status === TRANSACTION_STATUS.FAILED && (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                    {(transaction.status === TRANSACTION_STATUS.PENDING || 
                      transaction.status === TRANSACTION_STATUS.PROCESSING) && (
                      <Clock className="w-5 h-5 text-amber-500" />
                    )}
                    {transaction.status === TRANSACTION_STATUS.REFUNDED && (
                      <RefreshCcw className="w-5 h-5 text-blue-500" />
                    )}
                    <span className="font-semibold capitalize">{transaction.status}</span>
                  </div>
                  <Badge variant={getStatusVariant(transaction.status)} className="capitalize">
                    {transaction.status}
                  </Badge>
                </div>
                <p className="text-3xl font-bold mt-2">{formatCurrency(transaction.amount)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDateTime(transaction.createdAt)}
                </p>
              </div>

              {/* Transaction IDs */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Transaction IDs</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div>
                      <p className="text-xs text-muted-foreground">Internal ID</p>
                      <p className="font-mono text-sm">{transaction.id}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => copyToClipboard(transaction.id, 'Transaction ID')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  {transaction.gatewayTransactionId && (
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div>
                        <p className="text-xs text-muted-foreground">Gateway Transaction ID</p>
                        <p className="font-mono text-sm">{transaction.gatewayTransactionId}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(transaction.gatewayTransactionId, 'Gateway ID')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {transaction.upiTransactionId && (
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div>
                        <p className="text-xs text-muted-foreground">UPI Transaction ID</p>
                        <p className="font-mono text-sm">{transaction.upiTransactionId}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(transaction.upiTransactionId, 'UPI ID')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Patient Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Patient Details</h4>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.patientName}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <span>{transaction.patientPhone}</span>
                    </div>
                  </div>
                </div>
                {transaction.invoiceNumber && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Invoice</p>
                      <p className="font-mono">{transaction.invoiceNumber}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Payment Details */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Payment Method</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Gateway</p>
                    <p className="font-medium">{getGatewayName(transaction.gateway)}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Method</p>
                    <p className="font-medium capitalize">{transaction.method}</p>
                  </div>
                  {transaction.cardLast4 && (
                    <>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Card</p>
                        <p className="font-medium">•••• {transaction.cardLast4}</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Brand</p>
                        <p className="font-medium capitalize">{transaction.cardBrand}</p>
                      </div>
                    </>
                  )}
                  {transaction.upiApp && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">UPI App</p>
                      <p className="font-medium capitalize">{transaction.upiApp}</p>
                    </div>
                  )}
                  {transaction.metadata?.upiId && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">UPI ID</p>
                      <p className="font-medium">{transaction.metadata.upiId}</p>
                    </div>
                  )}
                  {transaction.bankName && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Bank</p>
                      <p className="font-medium">{transaction.bankName}</p>
                    </div>
                  )}
                  {transaction.reference && (
                    <div className="p-3 bg-muted/50 rounded-lg col-span-2">
                      <p className="text-xs text-muted-foreground">Reference</p>
                      <p className="font-mono text-sm">{transaction.reference}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Timestamps */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{formatDateTime(transaction.createdAt)}</span>
                  </div>
                  {transaction.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed</span>
                      <span>{formatDateTime(transaction.completedAt)}</span>
                    </div>
                  )}
                  {transaction.failedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Failed</span>
                      <span>{formatDateTime(transaction.failedAt)}</span>
                    </div>
                  )}
                  {transaction.refundedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Refunded</span>
                      <span>{formatDateTime(transaction.refundedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Failure/Refund Reason */}
              {transaction.failureReason && (
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <p className="text-xs text-destructive font-medium">Failure Reason</p>
                  <p className="text-sm mt-1">{transaction.failureReason}</p>
                </div>
              )}
              {transaction.refundReason && (
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium">Refund Reason</p>
                  <p className="text-sm mt-1">{transaction.refundReason}</p>
                </div>
              )}

              {/* Received By */}
              {transaction.receivedBy && (
                <div className="text-sm text-muted-foreground">
                  Processed by: {transaction.receivedBy}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="p-4 border-t flex items-center gap-2">
            <Button variant="outline" className="flex-1" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1" />
              Print Receipt
            </Button>
            {transaction.status === TRANSACTION_STATUS.SUCCESS && onRefundClick && (
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={() => onRefundClick(transaction)}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Initiate Refund
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
