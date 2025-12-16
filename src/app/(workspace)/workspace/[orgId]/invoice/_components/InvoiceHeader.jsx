import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';


export function InvoiceHeader({ onCreateNew }) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-soft">
                    <FileText className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Invoice Management</h1>
                    <p className="text-sm text-muted-foreground">Manage and track patient invoices</p>
                </div>
            </div>
            <Button onClick={onCreateNew} className="gap-2 shadow-soft">
                <Plus className="h-4 w-4" />
                Create Invoice
            </Button>
        </div>
    );
}
