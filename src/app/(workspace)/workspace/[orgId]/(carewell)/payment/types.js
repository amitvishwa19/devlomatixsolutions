// Payment Gateway Types
export const PAYMENT_GATEWAYS = {
  RAZORPAY: 'razorpay',
  STRIPE: 'stripe',
  UPI: 'upi',
  CASH: 'cash',
  CARD: 'card',
  NEFT: 'neft',
  CHEQUE: 'cheque',
};

// Gateway Status
export const GATEWAY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
};

// Transaction Status
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
};

// Payment Types
export const PAYMENT_TYPE = {
  FULL: 'full',
  PARTIAL: 'partial',
  ADVANCE: 'advance',
  REFUND: 'refund',
};

// UPI Apps
export const UPI_APPS = {
  GPAY: { id: 'gpay', name: 'Google Pay', icon: '📱' },
  PHONEPE: { id: 'phonepe', name: 'PhonePe', icon: '💳' },
  PAYTM: { id: 'paytm', name: 'Paytm', icon: '💰' },
  BHIM: { id: 'bhim', name: 'BHIM', icon: '🏦' },
  OTHER: { id: 'other', name: 'Other UPI', icon: '📲' },
};

// Invoice Status (matching existing)
export const INVOICE_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  ISSUED: 'issued',
  PAID: 'paid',
  PARTIAL: 'partial',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

// Gateway Configuration
export const GATEWAY_CONFIG = {
  razorpay: {
    name: 'Razorpay',
    logo: '🔷',
    color: '#528FF0',
    supportedMethods: ['card', 'upi', 'netbanking', 'wallet'],
    currency: 'INR',
    minAmount: 100, // in paise
    maxAmount: 50000000, // 5 Lakhs in paise
  },
  stripe: {
    name: 'Stripe',
    logo: '💳',
    color: '#635BFF',
    supportedMethods: ['card', 'upi'],
    currency: 'INR',
    minAmount: 50, // in paise
    maxAmount: 99999999,
  },
  upi: {
    name: 'UPI Direct',
    logo: '📱',
    color: '#00BFA5',
    supportedMethods: ['upi'],
    currency: 'INR',
    minAmount: 100,
    maxAmount: 10000000, // 1 Lakh
  },
};

// Hospital Details (matching existing system)
export const HOSPITAL_DETAILS = {
  name: 'CareWell Multi-Specialty Hospital',
  address: '123 Healthcare Avenue, Sector 15',
  city: 'Mumbai, Maharashtra 400001',
  phone: '+91 22 1234 5678',
  email: 'billing@carewellhospital.in',
  gstin: '27AABCU9603R1ZM',
  pan: 'AABCU9603R',
  cin: 'U85110MH2020PTC123456',
  upiId: 'carewell@hdfcbank',
  razorpayKeyId: 'rzp_test_XXXXXXXXXX',
};
