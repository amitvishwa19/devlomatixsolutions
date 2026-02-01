import { INVOICE_STATUS } from './types';

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate invoice statistics
 */
export function calculateInvoiceStats(invoices) {
  const stats = {
    totalInvoices: invoices.length,
    totalAmount: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    totalOverdue: 0,
    paidCount: 0,
    issuedCount: 0,
    overdueCount: 0,
    voidCount: 0,
    thisMonthAmount: 0,
    thisMonthCount: 0,
  };

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  invoices.forEach((invoice) => {
    if (invoice.status === INVOICE_STATUS.VOID) {
      stats.voidCount++;
      return;
    }

    stats.totalAmount += invoice.grandTotal;
    stats.totalCollected += invoice.amountPaid;
    stats.totalOutstanding += invoice.balanceDue;

    if (invoice.status === INVOICE_STATUS.PAID) {
      stats.paidCount++;
    } else if (invoice.status === INVOICE_STATUS.ISSUED) {
      stats.issuedCount++;
    }

    if (invoice.status === INVOICE_STATUS.OVERDUE) {
      stats.overdueCount++;
      stats.totalOverdue += invoice.balanceDue;
    }

    const invoiceDate = new Date(invoice.invoiceDate);
    if (invoiceDate.getMonth() === thisMonth && invoiceDate.getFullYear() === thisYear) {
      stats.thisMonthAmount += invoice.grandTotal;
      stats.thisMonthCount++;
    }
  });

  return stats;
}

/**
 * Filter invoices based on criteria
 */
export function filterInvoices(invoices, filters) {
  return invoices.filter((invoice) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
        invoice.patient.name.toLowerCase().includes(searchLower) ||
        invoice.patient.uhid.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    if (filters.status && filters.status !== 'all') {
      if (invoice.status !== filters.status) return false;
    }

    if (filters.type && filters.type !== 'all') {
      if (invoice.invoiceType !== filters.type) return false;
    }

    if (filters.dateFrom) {
      const invoiceDate = new Date(invoice.invoiceDate);
      const fromDate = new Date(filters.dateFrom);
      if (invoiceDate < fromDate) return false;
    }

    if (filters.dateTo) {
      const invoiceDate = new Date(invoice.invoiceDate);
      const toDate = new Date(filters.dateTo);
      if (invoiceDate > toDate) return false;
    }

    return true;
  });
}

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(existingInvoices) {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const existingNumbers = existingInvoices
    .filter(inv => inv.invoiceNumber.startsWith(`CW/${year}/${month}`))
    .map((inv) => {
      const match = inv.invoiceNumber.match(/CW\/\d{4}\/\d{2}\/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);

  const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
  return `CW/${year}/${month}/${String(nextNumber).padStart(5, '0')}`;
}

/**
 * Calculate days overdue
 */
export function calculateDaysOverdue(dueDate) {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = today - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Convert number to words (Indian format)
 */
export function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero Rupees Only';

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const remainder = num % 100;

  let words = '';

  if (crore > 0) words += (crore < 20 ? ones[crore] : tens[Math.floor(crore / 10)] + ' ' + ones[crore % 10]) + ' Crore ';
  if (lakh > 0) words += (lakh < 20 ? ones[lakh] : tens[Math.floor(lakh / 10)] + ' ' + ones[lakh % 10]) + ' Lakh ';
  if (thousand > 0) words += (thousand < 20 ? ones[thousand] : tens[Math.floor(thousand / 10)] + ' ' + ones[thousand % 10]) + ' Thousand ';
  if (hundred > 0) words += ones[hundred] + ' Hundred ';
  if (remainder > 0) {
    if (remainder < 20) words += ones[remainder];
    else words += tens[Math.floor(remainder / 10)] + ' ' + ones[remainder % 10];
  }

  return words.trim() + ' Rupees Only';
}
