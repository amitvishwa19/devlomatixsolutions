import { INVOICE_STATUS } from './types';

/**
 * Calculate billing statistics from invoices
 */
export function calculateBillingStats(invoices) {
  const stats = {
    totalInvoices: invoices.length,
    totalRevenue: 0,
    totalOutstanding: 0,
    totalOverdue: 0,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0,
    thisMonthRevenue: 0,
    thisMonthInvoices: 0,
    totalGST: 0,
    totalTDS: 0,
  };

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  invoices.forEach((invoice) => {
    // Skip cancelled invoices
    if (invoice.status === INVOICE_STATUS.CANCELLED) return;

    stats.totalRevenue += invoice.amountPaid;
    stats.totalOutstanding += invoice.balance;
    stats.totalGST += invoice.gst || invoice.tax || 0;
    stats.totalTDS += invoice.tds || 0;

    if (invoice.status === INVOICE_STATUS.PAID) {
      stats.paidCount++;
    } else if (invoice.status === INVOICE_STATUS.PENDING || invoice.status === INVOICE_STATUS.PARTIAL) {
      stats.pendingCount++;
    }

    if (invoice.status === INVOICE_STATUS.OVERDUE) {
      stats.overdueCount++;
      stats.totalOverdue += invoice.balance;
    }

    // Check if invoice is from this month
    const invoiceDate = new Date(invoice.dateIssued);
    if (invoiceDate.getMonth() === thisMonth && invoiceDate.getFullYear() === thisYear) {
      stats.thisMonthRevenue += invoice.amountPaid;
      stats.thisMonthInvoices++;
    }
  });

  return stats;
}

/**
 * Filter invoices based on criteria
 */
export function filterInvoices(invoices, filters) {
  return invoices.filter((invoice) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        invoice.id.toLowerCase().includes(searchLower) ||
        invoice.patientName.toLowerCase().includes(searchLower) ||
        invoice.notes?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (invoice.status !== filters.status) return false;
    }

    // Date range filter
    if (filters.dateFrom) {
      const invoiceDate = new Date(invoice.dateIssued);
      const fromDate = new Date(filters.dateFrom);
      if (invoiceDate < fromDate) return false;
    }

    if (filters.dateTo) {
      const invoiceDate = new Date(invoice.dateIssued);
      const toDate = new Date(filters.dateTo);
      if (invoiceDate > toDate) return false;
    }

    return true;
  });
}

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
 * Generate new invoice ID
 */
export function generateInvoiceId(existingInvoices) {
  const year = new Date().getFullYear();
  const existingNumbers = existingInvoices
    .map((inv) => {
      const match = inv.id.match(/INV-\d{4}-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);

  const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
  return `INV-${year}-${String(nextNumber).padStart(3, '0')}`;
}

/**
 * Generate credit note ID
 */
export function generateCreditNoteId(existingNotes = []) {
  const year = new Date().getFullYear();
  const nextNumber = existingNotes.length + 1;
  return `CN-${year}-${String(nextNumber).padStart(3, '0')}`;
}

/**
 * Calculate invoice totals with GST and TDS
 */
export function calculateInvoiceTotals(items, gstRate = 0.18, discount = 0, tdsRate = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const gst = subtotal * gstRate;
  const tds = subtotal * tdsRate;
  const total = subtotal + gst - discount - tds;

  return {
    subtotal,
    gst,
    tax: gst, // alias for backward compatibility
    discount,
    tds,
    total,
  };
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
 * Format Indian mobile number
 */
export function formatMobileNumber(number) {
  if (!number) return '';
  const cleaned = number.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return number;
}
