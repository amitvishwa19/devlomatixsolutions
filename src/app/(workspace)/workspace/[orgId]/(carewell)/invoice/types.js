/**
 * Invoice Types - Final, Immutable Financial Documents
 * 
 * Invoices are generated from finalized bills and cannot be edited once issued.
 * They serve as official payment records with legal standing.
 * 
 * Invoice Status:
 * - issued: Invoice generated and sent to patient
 * - paid: Invoice fully paid
 * - partial: Invoice partially paid
 * - overdue: Invoice past due date
 * - void: Invoice voided (requires credit note)
 */

export const INVOICE_STATUS = {
  ISSUED: 'issued',
  PAID: 'paid',
  PARTIAL: 'partial',
  OVERDUE: 'overdue',
  VOID: 'void',
};

export const INVOICE_STATUS_LABELS = {
  [INVOICE_STATUS.ISSUED]: 'Issued',
  [INVOICE_STATUS.PAID]: 'Paid',
  [INVOICE_STATUS.PARTIAL]: 'Partially Paid',
  [INVOICE_STATUS.OVERDUE]: 'Overdue',
  [INVOICE_STATUS.VOID]: 'Void',
};

export const INVOICE_STATUS_COLORS = {
  [INVOICE_STATUS.ISSUED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  [INVOICE_STATUS.PAID]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  [INVOICE_STATUS.PARTIAL]: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  [INVOICE_STATUS.OVERDUE]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  [INVOICE_STATUS.VOID]: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export const INVOICE_TYPE = {
  OPD: 'opd',
  IPD: 'ipd',
  PHARMACY: 'pharmacy',
  LABORATORY: 'laboratory',
  PROCEDURE: 'procedure',
  PACKAGE: 'package',
};

export const INVOICE_TYPE_LABELS = {
  [INVOICE_TYPE.OPD]: 'OPD',
  [INVOICE_TYPE.IPD]: 'IPD',
  [INVOICE_TYPE.PHARMACY]: 'Pharmacy',
  [INVOICE_TYPE.LABORATORY]: 'Laboratory',
  [INVOICE_TYPE.PROCEDURE]: 'Procedure',
  [INVOICE_TYPE.PACKAGE]: 'Package',
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

// Hospital details for invoice header
export const HOSPITAL_DETAILS = {
  name: 'CareWell Multi-Specialty Hospital',
  address: '123 Healthcare Avenue, Sector 15',
  city: 'Mumbai, Maharashtra 400001',
  phone: '+91 22 1234 5678',
  email: 'billing@carewellhospital.in',
  gstin: '27AABCU9603R1ZM',
  pan: 'AABCU9603R',
  cin: 'U85110MH2020PTC123456',
};
