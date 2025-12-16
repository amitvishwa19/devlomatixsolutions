import { X, Mail, Phone, Calendar, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, } from '@/components/ui/sheet';



const statusVariant = {
    paid: 'paid',
    pending: 'pending',
    overdue: 'overdue',
    draft: 'draft',
};

export function InvoiceDetail({ invoice, open, onClose }) {
    if (!invoice) return null;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                <SheetHeader className="mb-6">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-xl font-bold">{invoice.invoiceNumber}</SheetTitle>
                        <Badge variant={statusVariant[invoice.status]} className="capitalize">
                            {invoice.status}
                        </Badge>
                    </div>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Patient Info */}
                    <Card className="p-4 border-border/50">
                        <h3 className="mb-3 font-semibold text-foreground">Patient Information</h3>
                        <div className="space-y-2">
                            <p className="text-lg font-medium text-foreground">{invoice.patientName}</p>
                            <p className="text-sm text-muted-foreground">ID: {invoice.patientId}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                {invoice.patientEmail}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                {invoice.patientPhone}
                            </div>
                        </div>
                    </Card>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="p-4 border-border/50">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                Issue Date
                            </div>
                            <p className="mt-1 font-medium text-foreground">{formatDate(invoice.issueDate)}</p>
                        </Card>
                        <Card className="p-4 border-border/50">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                Due Date
                            </div>
                            <p className="mt-1 font-medium text-foreground">{formatDate(invoice.dueDate)}</p>
                        </Card>
                    </div>

                    {/* Items */}
                    <Card className="p-4 border-border/50">
                        <h3 className="mb-4 font-semibold text-foreground">Services & Items</h3>
                        <div className="space-y-3">
                            {invoice.items.map((item) => (
                                <div key={item.id} className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium text-foreground">{item.description}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {item.quantity} × {formatCurrency(item.unitPrice)}
                                        </p>
                                    </div>
                                    <p className="font-medium text-foreground">{formatCurrency(item.total)}</p>
                                </div>
                            ))}
                        </div>

                        <Separator className="my-4" />

                        {/* Totals */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="text-foreground">{formatCurrency(invoice.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax (10%)</span>
                                <span className="text-foreground">{formatCurrency(invoice.tax)}</span>
                            </div>
                            {invoice.discount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Discount</span>
                                    <span className="text-success">-{formatCurrency(invoice.discount)}</span>
                                </div>
                            )}
                            <Separator className="my-2" />
                            <div className="flex justify-between">
                                <span className="font-semibold text-foreground">Total</span>
                                <span className="text-xl font-bold text-primary">
                                    {formatCurrency(invoice.total)}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Notes */}
                    {invoice.notes && (
                        <Card className="p-4 border-border/50">
                            <h3 className="mb-2 font-semibold text-foreground">Notes</h3>
                            <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                        </Card>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button className="flex-1 gap-2">
                            <Download className="h-4 w-4" />
                            Download PDF
                        </Button>
                        <Button variant="outline" className="flex-1 gap-2">
                            <Printer className="h-4 w-4" />
                            Print
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
