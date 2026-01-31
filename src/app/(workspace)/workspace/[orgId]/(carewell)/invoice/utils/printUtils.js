/**
 * Print and PDF utilities for invoices
 */

/**
 * Print an invoice using the browser's print dialog
 * @param {HTMLElement} printRef - Reference to the printable element
 * @param {Object} invoice - Invoice data for title
 */
export function printInvoice(printRef, invoice) {
  if (!printRef) {
    console.error('Print reference not found');
    return;
  }

  // Create a new window for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (!printWindow) {
    console.error('Could not open print window. Please allow popups.');
    return;
  }

  // Build the print document
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - ${invoice?.invoiceNumber || 'Invoice'}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: #fff;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          .text-xs { font-size: 10px; }
          .text-sm { font-size: 12px; }
          .text-base { font-size: 14px; }
          .text-lg { font-size: 16px; }
          .text-xl { font-size: 18px; }
          .text-2xl { font-size: 20px; }
          .text-3xl { font-size: 24px; }
          .font-bold { font-weight: bold; }
          .font-semibold { font-weight: 600; }
          .font-medium { font-weight: 500; }
          .text-gray-400 { color: #9ca3af; }
          .text-gray-500 { color: #6b7280; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-900 { color: #111827; }
          .text-green-600 { color: #059669; }
          .text-red-600 { color: #dc2626; }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .uppercase { text-transform: uppercase; }
          .border { border: 1px solid #d1d5db; }
          .border-t { border-top: 1px solid #d1d5db; }
          .border-b { border-bottom: 1px solid #d1d5db; }
          .border-gray-300 { border-color: #d1d5db; }
          .border-gray-800 { border-color: #1f2937; }
          .rounded { border-radius: 4px; }
          .bg-gray-100 { background-color: #f3f4f6; }
          .bg-gray-50 { background-color: #f9fafb; }
          .p-4 { padding: 16px; }
          .p-8 { padding: 32px; }
          .px-2 { padding-left: 8px; padding-right: 8px; }
          .py-1 { padding-top: 4px; padding-bottom: 4px; }
          .py-2 { padding-top: 8px; padding-bottom: 8px; }
          .pt-2 { padding-top: 8px; }
          .pt-4 { padding-top: 16px; }
          .pb-4 { padding-bottom: 16px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-4 { margin-bottom: 16px; }
          .mb-6 { margin-bottom: 24px; }
          .mt-1 { margin-top: 4px; }
          .mt-2 { margin-top: 8px; }
          .mt-4 { margin-top: 16px; }
          .mt-6 { margin-top: 24px; }
          .mt-8 { margin-top: 32px; }
          .ml-4 { margin-left: 16px; }
          .gap-4 { gap: 16px; }
          .gap-8 { gap: 32px; }
          .space-y-1 > * + * { margin-top: 4px; }
          .space-y-2 > * + * { margin-top: 8px; }
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .items-start { align-items: flex-start; }
          .inline-block { display: inline-block; }
          .w-full { width: 100%; }
          .w-10 { width: 40px; }
          .w-16 { width: 64px; }
          .w-20 { width: 80px; }
          .w-24 { width: 96px; }
          .w-48 { width: 192px; }
          .font-mono { font-family: monospace; }
          .tracking-wider { letter-spacing: 0.05em; }
          .list-decimal { list-style-type: decimal; }
          .capitalize { text-transform: capitalize; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #d1d5db; padding: 8px; }
          th { background-color: #f3f4f6; font-weight: 600; }
        </style>
      </head>
      <body>
        ${printRef.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  
  // Wait for content to load, then print
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    // Don't close immediately - let user complete the print dialog
  };
}

/**
 * Download invoice as PDF using browser print to PDF
 * @param {HTMLElement} printRef - Reference to the printable element
 * @param {Object} invoice - Invoice data for filename
 */
export function downloadInvoicePDF(printRef, invoice) {
  if (!printRef) {
    console.error('Print reference not found');
    return;
  }

  // Create a new window for PDF generation
  const pdfWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (!pdfWindow) {
    console.error('Could not open window. Please allow popups.');
    return;
  }

  const fileName = `Invoice-${invoice?.invoiceNumber || 'invoice'}.pdf`;

  // Build the PDF document
  pdfWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${fileName}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: #fff;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          .text-xs { font-size: 10px; }
          .text-sm { font-size: 12px; }
          .text-base { font-size: 14px; }
          .text-lg { font-size: 16px; }
          .text-xl { font-size: 18px; }
          .text-2xl { font-size: 20px; }
          .text-3xl { font-size: 24px; }
          .font-bold { font-weight: bold; }
          .font-semibold { font-weight: 600; }
          .font-medium { font-weight: 500; }
          .text-gray-400 { color: #9ca3af; }
          .text-gray-500 { color: #6b7280; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-900 { color: #111827; }
          .text-green-600 { color: #059669; }
          .text-red-600 { color: #dc2626; }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .uppercase { text-transform: uppercase; }
          .border { border: 1px solid #d1d5db; }
          .border-t { border-top: 1px solid #d1d5db; }
          .border-b { border-bottom: 1px solid #d1d5db; }
          .border-gray-300 { border-color: #d1d5db; }
          .border-gray-800 { border-color: #1f2937; }
          .rounded { border-radius: 4px; }
          .bg-gray-100 { background-color: #f3f4f6; }
          .bg-gray-50 { background-color: #f9fafb; }
          .p-4 { padding: 16px; }
          .p-8 { padding: 32px; }
          .px-2 { padding-left: 8px; padding-right: 8px; }
          .py-1 { padding-top: 4px; padding-bottom: 4px; }
          .py-2 { padding-top: 8px; padding-bottom: 8px; }
          .pt-2 { padding-top: 8px; }
          .pt-4 { padding-top: 16px; }
          .pb-4 { padding-bottom: 16px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-4 { margin-bottom: 16px; }
          .mb-6 { margin-bottom: 24px; }
          .mt-1 { margin-top: 4px; }
          .mt-2 { margin-top: 8px; }
          .mt-4 { margin-top: 16px; }
          .mt-6 { margin-top: 24px; }
          .mt-8 { margin-top: 32px; }
          .ml-4 { margin-left: 16px; }
          .gap-4 { gap: 16px; }
          .gap-8 { gap: 32px; }
          .space-y-1 > * + * { margin-top: 4px; }
          .space-y-2 > * + * { margin-top: 8px; }
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .items-start { align-items: flex-start; }
          .inline-block { display: inline-block; }
          .w-full { width: 100%; }
          .w-10 { width: 40px; }
          .w-16 { width: 64px; }
          .w-20 { width: 80px; }
          .w-24 { width: 96px; }
          .w-48 { width: 192px; }
          .font-mono { font-family: monospace; }
          .tracking-wider { letter-spacing: 0.05em; }
          .list-decimal { list-style-type: decimal; }
          .capitalize { text-transform: capitalize; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #d1d5db; padding: 8px; }
          th { background-color: #f3f4f6; font-weight: 600; }
        </style>
      </head>
      <body>
        <div style="padding: 20px;">
          <p style="text-align: center; margin-bottom: 20px; color: #666;">
            Use "Save as PDF" in the print dialog to download as PDF
          </p>
        </div>
        ${printRef.innerHTML}
      </body>
    </html>
  `);

  pdfWindow.document.close();
  
  // Wait for content to load, then trigger print (for PDF save)
  pdfWindow.onload = () => {
    pdfWindow.focus();
    setTimeout(() => {
      pdfWindow.print();
    }, 250);
  };
}
