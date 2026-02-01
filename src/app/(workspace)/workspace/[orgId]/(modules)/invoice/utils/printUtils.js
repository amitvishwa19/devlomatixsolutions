/**
 * Print and PDF utilities for invoices
 */

export function printInvoice(printRef, invoice) {
  if (!printRef) return;
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;

  printWindow.document.write(`<!DOCTYPE html><html><head><title>Invoice - ${invoice?.invoiceNumber || 'Invoice'}</title>
    <style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: Arial, sans-serif; font-size: 12px; } @page { size: A4; margin: 10mm; }</style>
  </head><body>${printRef.innerHTML}</body></html>`);
  printWindow.document.close();
  printWindow.onload = () => { printWindow.focus(); printWindow.print(); };
}

export function downloadInvoicePDF(printRef, invoice) {
  printInvoice(printRef, invoice);
}
