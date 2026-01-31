// Mock data for reporting charts (Indian context)

export const patientTrendData = [
  { month: 'Jan', newPatients: 45, activePatients: 320, discharged: 12 },
  { month: 'Feb', newPatients: 52, activePatients: 358, discharged: 14 },
  { month: 'Mar', newPatients: 48, activePatients: 390, discharged: 16 },
  { month: 'Apr', newPatients: 61, activePatients: 432, discharged: 19 },
  { month: 'May', newPatients: 55, activePatients: 465, discharged: 22 },
  { month: 'Jun', newPatients: 67, activePatients: 508, discharged: 24 },
  { month: 'Jul', newPatients: 72, activePatients: 554, discharged: 26 },
  { month: 'Aug', newPatients: 58, activePatients: 584, discharged: 28 },
  { month: 'Sep', newPatients: 63, activePatients: 617, discharged: 30 },
  { month: 'Oct', newPatients: 71, activePatients: 656, discharged: 32 },
  { month: 'Nov', newPatients: 65, activePatients: 688, discharged: 33 },
  { month: 'Dec', newPatients: 78, activePatients: 732, discharged: 34 },
];

export const appointmentVolumeData = [
  { day: 'Mon', scheduled: 42, completed: 38, cancelled: 4, noShow: 2 },
  { day: 'Tue', scheduled: 48, completed: 44, cancelled: 3, noShow: 1 },
  { day: 'Wed', scheduled: 52, completed: 48, cancelled: 2, noShow: 2 },
  { day: 'Thu', scheduled: 45, completed: 42, cancelled: 2, noShow: 1 },
  { day: 'Fri', scheduled: 38, completed: 35, cancelled: 2, noShow: 1 },
  { day: 'Sat', scheduled: 22, completed: 20, cancelled: 1, noShow: 1 },
  { day: 'Sun', scheduled: 8, completed: 7, cancelled: 1, noShow: 0 },
];

// Revenue in Indian Rupees (₹)
export const revenueData = [
  { month: 'Jan', revenue: 1250000, collections: 1185000, outstanding: 65000 },
  { month: 'Feb', revenue: 1320000, collections: 1254000, outstanding: 66000 },
  { month: 'Mar', revenue: 1450000, collections: 1377500, outstanding: 72500 },
  { month: 'Apr', revenue: 1380000, collections: 1311000, outstanding: 69000 },
  { month: 'May', revenue: 1520000, collections: 1444000, outstanding: 76000 },
  { month: 'Jun', revenue: 1680000, collections: 1596000, outstanding: 84000 },
  { month: 'Jul', revenue: 1750000, collections: 1662500, outstanding: 87500 },
  { month: 'Aug', revenue: 1620000, collections: 1539000, outstanding: 81000 },
  { month: 'Sep', revenue: 1580000, collections: 1501000, outstanding: 79000 },
  { month: 'Oct', revenue: 1710000, collections: 1624500, outstanding: 85500 },
  { month: 'Nov', revenue: 1650000, collections: 1567500, outstanding: 82500 },
  { month: 'Dec', revenue: 1820000, collections: 1729000, outstanding: 91000 },
];

export const departmentDistribution = [
  { name: 'General Medicine', value: 35, color: '#10b981' },
  { name: 'Cardiology', value: 18, color: '#3b82f6' },
  { name: 'Orthopedics', value: 15, color: '#f59e0b' },
  { name: 'Pediatrics', value: 12, color: '#8b5cf6' },
  { name: 'Dermatology', value: 10, color: '#06b6d4' },
  { name: 'Other', value: 10, color: '#6b7280' },
];

export const ageDistribution = [
  { range: '0-18', male: 120, female: 115 },
  { range: '19-30', male: 180, female: 195 },
  { range: '31-45', male: 210, female: 225 },
  { range: '46-60', male: 165, female: 175 },
  { range: '61-75', male: 98, female: 112 },
  { range: '75+', male: 45, female: 58 },
];

export const prescriptionTrendData = [
  { month: 'Jan', prescriptions: 320, refills: 180 },
  { month: 'Feb', prescriptions: 345, refills: 195 },
  { month: 'Mar', prescriptions: 380, refills: 210 },
  { month: 'Apr', prescriptions: 365, refills: 200 },
  { month: 'May', prescriptions: 410, refills: 225 },
  { month: 'Jun', prescriptions: 425, refills: 240 },
  { month: 'Jul', prescriptions: 445, refills: 255 },
  { month: 'Aug', prescriptions: 420, refills: 235 },
  { month: 'Sep', prescriptions: 438, refills: 248 },
  { month: 'Oct', prescriptions: 465, refills: 265 },
  { month: 'Nov', prescriptions: 455, refills: 260 },
  { month: 'Dec', prescriptions: 490, refills: 280 },
];

export const topMedications = [
  { name: 'Lisinopril', count: 245, category: 'Cardiovascular' },
  { name: 'Metformin', count: 198, category: 'Diabetes' },
  { name: 'Amlodipine', count: 176, category: 'Cardiovascular' },
  { name: 'Omeprazole', count: 165, category: 'Gastrointestinal' },
  { name: 'Atorvastatin', count: 152, category: 'Cardiovascular' },
  { name: 'Metoprolol', count: 143, category: 'Cardiovascular' },
  { name: 'Levothyroxine', count: 138, category: 'Thyroid' },
  { name: 'Gabapentin', count: 125, category: 'Neurological' },
];

// Revenue in Indian Rupees (₹)
export const summaryStats = {
  totalPatients: 732,
  patientGrowth: 12.5,
  totalAppointments: 2847,
  appointmentGrowth: 8.3,
  totalRevenue: 18730000, // ₹1.87 Crore
  revenueGrowth: 15.2,
  totalPrescriptions: 4958,
  prescriptionGrowth: 10.8,
  avgWaitTime: 12,
  waitTimeChange: -2.3,
  patientSatisfaction: 4.6,
  satisfactionChange: 0.2,
};
