import { TRANSACTION_STATUS, PAYMENT_GATEWAYS, GATEWAY_CONFIG } from './types';

/**
 * Format currency in INR
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
 * Format date for display
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format date with time
 */
export function formatDateTime(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get status badge variant
 */
export function getStatusVariant(status) {
  switch (status) {
    case TRANSACTION_STATUS.SUCCESS:
      return 'default';
    case TRANSACTION_STATUS.PENDING:
    case TRANSACTION_STATUS.PROCESSING:
      return 'secondary';
    case TRANSACTION_STATUS.FAILED:
    case TRANSACTION_STATUS.CANCELLED:
      return 'destructive';
    case TRANSACTION_STATUS.REFUNDED:
      return 'outline';
    default:
      return 'secondary';
  }
}

/**
 * Get gateway display name
 */
export function getGatewayName(gateway) {
  return GATEWAY_CONFIG[gateway]?.name || gateway.toUpperCase();
}

/**
 * Get gateway color
 */
export function getGatewayColor(gateway) {
  return GATEWAY_CONFIG[gateway]?.color || '#6B7280';
}

/**
 * Generate UPI deep link
 */
export function generateUPILink(params) {
  const { payeeVpa, payeeName, amount, transactionRef, transactionNote } = params;
  
  const upiParams = new URLSearchParams({
    pa: payeeVpa,
    pn: payeeName,
    am: amount.toString(),
    tr: transactionRef,
    tn: transactionNote || 'Hospital Payment',
    cu: 'INR',
  });
  
  return `upi://pay?${upiParams.toString()}`;
}

/**
 * Calculate payment statistics
 */
export function calculatePaymentStats(transactions) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const successfulTxns = transactions.filter(t => t.status === TRANSACTION_STATUS.SUCCESS);
  const todayTxns = successfulTxns.filter(t => new Date(t.createdAt) >= today);
  const failedTxns = transactions.filter(t => t.status === TRANSACTION_STATUS.FAILED);
  const pendingTxns = transactions.filter(t => 
    t.status === TRANSACTION_STATUS.PENDING || t.status === TRANSACTION_STATUS.PROCESSING
  );
  
  const totalCollected = successfulTxns.reduce((sum, t) => sum + t.amount, 0);
  const todayCollected = todayTxns.reduce((sum, t) => sum + t.amount, 0);
  
  // Gateway breakdown
  const gatewayBreakdown = {};
  Object.values(PAYMENT_GATEWAYS).forEach(gateway => {
    const gatewayTxns = successfulTxns.filter(t => t.gateway === gateway);
    gatewayBreakdown[gateway] = {
      count: gatewayTxns.length,
      amount: gatewayTxns.reduce((sum, t) => sum + t.amount, 0),
    };
  });
  
  return {
    totalTransactions: transactions.length,
    successfulCount: successfulTxns.length,
    failedCount: failedTxns.length,
    pendingCount: pendingTxns.length,
    totalCollected,
    todayCollected,
    todayCount: todayTxns.length,
    successRate: transactions.length > 0 
      ? ((successfulTxns.length / transactions.length) * 100).toFixed(1) 
      : 0,
    gatewayBreakdown,
  };
}

/**
 * Filter transactions
 */
export function filterTransactions(transactions, filters) {
  let filtered = [...transactions];
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(t =>
      t.patientName?.toLowerCase().includes(searchLower) ||
      t.invoiceNumber?.toLowerCase().includes(searchLower) ||
      t.id.toLowerCase().includes(searchLower) ||
      t.gatewayTransactionId?.toLowerCase().includes(searchLower)
    );
  }
  
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(t => t.status === filters.status);
  }
  
  if (filters.gateway && filters.gateway !== 'all') {
    filtered = filtered.filter(t => t.gateway === filters.gateway);
  }
  
  if (filters.dateFrom) {
    filtered = filtered.filter(t => new Date(t.createdAt) >= new Date(filters.dateFrom));
  }
  
  if (filters.dateTo) {
    filtered = filtered.filter(t => new Date(t.createdAt) <= new Date(filters.dateTo));
  }
  
  return filtered;
}

/**
 * Generate transaction ID
 */
export function generateTransactionId() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${year}${month}-${random}`;
}

/**
 * Mask card number
 */
export function maskCardNumber(last4, brand) {
  const brandPrefix = {
    visa: '4',
    mastercard: '5',
    amex: '3',
    rupay: '6',
  };
  const prefix = brandPrefix[brand?.toLowerCase()] || 'X';
  return `${prefix}XXX XXXX XXXX ${last4}`;
}

/**
 * Validate UPI ID
 */
export function validateUPIId(upiId) {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{2,}$/;
  return upiRegex.test(upiId);
}

/**
 * Format large numbers in Indian format (Lakhs/Crores)
 */
export function formatIndianNumber(num) {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}K`;
  }
  return formatCurrency(num);
}
