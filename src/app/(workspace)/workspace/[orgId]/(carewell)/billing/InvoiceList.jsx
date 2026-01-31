import { InvoiceCard } from './InvoiceCard';

export function InvoiceList({ invoices, onInvoiceClick }) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {invoices.map((invoice) => (
        <InvoiceCard
          key={invoice.id}
          invoice={invoice}
          onClick={onInvoiceClick}
        />
      ))}
    </div>
  );
}
