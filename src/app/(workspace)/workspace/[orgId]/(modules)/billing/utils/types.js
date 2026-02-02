/* Billing Types - Force Cache Refresh v3 */
/**
 * Billing/Invoice Types
 * 
 * Invoice Status:
 * - draft: Invoice created but not sent
 * - pending: Invoice sent, awaiting payment
 * - paid: Invoice fully paid
 * - partial: Invoice partially paid
 * - overdue: Invoice past due date
 * - cancelled: Invoice cancelled
 * 
 * Payment Method:
 * - cash: Cash payment
 * - card: Credit/Debit card
 * - upi: UPI payment (GPay, PhonePe, Paytm, etc.)
 * - neft: NEFT bank transfer
 * - rtgs: RTGS bank transfer
 * - imps: IMPS transfer
 * - cheque: Cheque payment
 * - insurance: Insurance claim
 * - other: Other payment method
 */

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PAID: 'paid',
  PARTIAL: 'partial',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  UPI: 'upi',
  NEFT: 'neft',
  RTGS: 'rtgs',
  IMPS: 'imps',
  CHEQUE: 'cheque',
  INSURANCE: 'insurance',
  OTHER: 'other',
};

export const INVOICE_STATUS_LABELS = {
  [INVOICE_STATUS.DRAFT]: 'Draft',
  [INVOICE_STATUS.PENDING]: 'Pending',
  [INVOICE_STATUS.PAID]: 'Paid',
  [INVOICE_STATUS.PARTIAL]: 'Partial',
  [INVOICE_STATUS.OVERDUE]: 'Overdue',
  [INVOICE_STATUS.CANCELLED]: 'Cancelled',
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'Cash',
  [PAYMENT_METHODS.CARD]: 'Card (Credit/Debit)',
  [PAYMENT_METHODS.UPI]: 'UPI',
  [PAYMENT_METHODS.NEFT]: 'NEFT',
  [PAYMENT_METHODS.RTGS]: 'RTGS',
  [PAYMENT_METHODS.IMPS]: 'IMPS',
  [PAYMENT_METHODS.CHEQUE]: 'Cheque',
  [PAYMENT_METHODS.INSURANCE]: 'Insurance',
  [PAYMENT_METHODS.OTHER]: 'Other',
};

export const INVOICE_STATUS_COLORS = {
  [INVOICE_STATUS.DRAFT]: 'bg-secondary text-secondary-foreground',
  [INVOICE_STATUS.PENDING]: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  [INVOICE_STATUS.PAID]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  [INVOICE_STATUS.PARTIAL]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  [INVOICE_STATUS.OVERDUE]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  [INVOICE_STATUS.CANCELLED]: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export const GST_RATES = [
  { id: 'exempt', label: 'Exempt (0%)', rate: 0 },
  { id: 'gst5', label: 'GST 5%', rate: 0.05 },
  { id: 'gst12', label: 'GST 12%', rate: 0.12 },
  { id: 'gst18', label: 'GST 18%', rate: 0.18 },
  { id: 'gst28', label: 'GST 28%', rate: 0.28 },
];

export const TDS_RATES = [
  { id: 'none', label: 'No TDS', rate: 0 },
  { id: 'tds1', label: 'TDS 1%', rate: 0.01 },
  { id: 'tds2', label: 'TDS 2%', rate: 0.02 },
  { id: 'tds10', label: 'TDS 10%', rate: 0.10 },
];

export const INSURANCE_PROVIDERS = [
  { id: 'star', name: 'Star Health Insurance' },
  { id: 'hdfc', name: 'HDFC Ergo Health' },
  { id: 'icici', name: 'ICICI Lombard' },
  { id: 'bajaj', name: 'Bajaj Allianz' },
  { id: 'max', name: 'Max Bupa Health' },
  { id: 'tata', name: 'Tata AIG' },
  { id: 'nic', name: 'National Insurance' },
  { id: 'oriental', name: 'Oriental Insurance' },
  { id: 'lic', name: 'LIC Health' },
  { id: 'other', name: 'Other' },
];
