import { Eye, MoreHorizontal, Mail, Printer, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';



const statusVariant = {
    paid: 'paid',
    pending: 'pending',
    overdue: 'overdue',
    draft: 'draft',
};

export function InvoiceTable({ invoices, onView, onDelete }) {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
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
        <Card className="overflow-hidden border-0 ">
            <Table>
                <TableHeader>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                        <TableHead className="font-semibold">Invoice</TableHead>
                        <TableHead className="font-semibold">Patient</TableHead>
                        <TableHead className="font-semibold">Issue Date</TableHead>
                        <TableHead className="font-semibold">Due Date</TableHead>
                        <TableHead className="font-semibold">Amount</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices?.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                No invoices found
                            </TableCell>
                        </TableRow>
                    ) : (
                        invoices?.map((invoice, index) => (
                            <TableRow
                                key={invoice.id}
                                className="cursor-pointer transition-colors hover:bg-muted/30 animate-fade-in"
                                style={{ animationDelay: `${index * 30}ms` }}
                                onClick={() => onView(invoice)}
                            >
                                <TableCell>
                                    <div className="font-medium text-foreground">{invoice.invoiceNumber}</div>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <div className="font-medium text-foreground">{invoice.patientName}</div>
                                        <div className="text-xs text-muted-foreground">{invoice.patientId}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDate(invoice.issueDate)}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDate(invoice.dueDate)}
                                </TableCell>
                                <TableCell>
                                    <span className="font-semibold text-foreground">
                                        {formatCurrency(invoice.total)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={statusVariant[invoice.status]} className="capitalize">
                                        {invoice.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onView(invoice)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Mail className="mr-2 h-4 w-4" />
                                                Send Email
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Printer className="mr-2 h-4 w-4" />
                                                Print
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(invoice.id);
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </Card>
    );
}
