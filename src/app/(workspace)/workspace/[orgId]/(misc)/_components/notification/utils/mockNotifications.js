import { NOTIFICATION_TYPES } from './types';

export const mockNotifications = [
  { id: 'N001', type: NOTIFICATION_TYPES.APPOINTMENT_REMINDER, title: 'Upcoming Appointment', message: 'Rahul Sharma has an appointment tomorrow at 10:00 AM with Dr. Patel', patientId: 'P001', patientName: 'Rahul Sharma', read: false, createdAt: new Date().toISOString(), scheduledFor: new Date(Date.now() + 86400000).toISOString() },
  { id: 'N002', type: NOTIFICATION_TYPES.PRESCRIPTION_REFILL, title: 'Refill Due', message: 'Priya Gupta\'s Lisinopril prescription is due for refill in 3 days', patientId: 'P002', patientName: 'Priya Gupta', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'N003', type: NOTIFICATION_TYPES.PAYMENT_DUE, title: 'Payment Overdue', message: 'Amit Verma has an outstanding balance of ₹42,500', patientId: 'P003', patientName: 'Amit Verma', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'N004', type: NOTIFICATION_TYPES.APPOINTMENT_REMINDER, title: 'Appointment Today', message: 'Sneha Reddy has an appointment today at 2:30 PM', patientId: 'P004', patientName: 'Sneha Reddy', read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'N005', type: NOTIFICATION_TYPES.LAB_RESULT, title: 'Lab Results Ready', message: 'Vikram Nair\'s blood test results are ready for review', patientId: 'P005', patientName: 'Vikram Nair', read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'N006', type: NOTIFICATION_TYPES.PRESCRIPTION_REFILL, title: 'Refill Requested', message: 'Kavita Singh has requested a refill for Metformin', patientId: 'P006', patientName: 'Kavita Singh', read: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
];
