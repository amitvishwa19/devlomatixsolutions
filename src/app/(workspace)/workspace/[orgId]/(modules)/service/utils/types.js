// Service Status Types
export const SERVICE_STATUSES = [
  { id: 'active', name: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { id: 'inactive', name: 'Inactive', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
  { id: 'discontinued', name: 'Discontinued', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
];

// Service Categories
export const SERVICE_CATEGORIES = [
  { id: 'consultation', name: 'Consultation', icon: 'Stethoscope' },
  { id: 'laboratory', name: 'Laboratory', icon: 'FlaskConical' },
  { id: 'imaging', name: 'Imaging/Radiology', icon: 'ScanLine' },
  { id: 'cardiology', name: 'Cardiology', icon: 'Heart' },
  { id: 'therapy', name: 'Therapy & Rehab', icon: 'Activity' },
  { id: 'preventive', name: 'Preventive Care', icon: 'Shield' },
  { id: 'dental', name: 'Dental', icon: 'Smile' },
  { id: 'nephrology', name: 'Nephrology', icon: 'Droplet' },
  { id: 'oncology', name: 'Oncology', icon: 'Ribbon' },
  { id: 'inpatient', name: 'Inpatient Services', icon: 'Bed' },
  { id: 'surgical', name: 'Surgical Procedures', icon: 'Scissors' },
  { id: 'emergency', name: 'Emergency Services', icon: 'Siren' },
  { id: 'maternity', name: 'Maternity & Obstetrics', icon: 'Baby' },
  { id: 'pediatric', name: 'Pediatric Services', icon: 'Baby' },
  { id: 'pharmacy', name: 'Pharmacy Services', icon: 'Pill' },
];

// Service Types (OPD, IPD, Both)
export const SERVICE_TYPES = [
  { id: 'opd', name: 'OPD Only' },
  { id: 'ipd', name: 'IPD Only' },
  { id: 'both', name: 'OPD & IPD' },
];

// Billing Types
export const BILLING_TYPES = [
  { id: 'fixed', name: 'Fixed Price' },
  { id: 'variable', name: 'Variable/Custom' },
  { id: 'per_unit', name: 'Per Unit/Session' },
  { id: 'per_day', name: 'Per Day' },
  { id: 'package', name: 'Package Rate' },
];

// Tax Categories (GST)
export const TAX_CATEGORIES = [
  { id: 'exempt', name: 'Exempt (0%)', rate: 0 },
  { id: 'gst_5', name: 'GST 5%', rate: 0.05 },
  { id: 'gst_12', name: 'GST 12%', rate: 0.12 },
  { id: 'gst_18', name: 'GST 18%', rate: 0.18 },
  { id: 'gst_28', name: 'GST 28%', rate: 0.28 },
];

// Departments
export const DEPARTMENTS = [
  { id: 'general', name: 'General Medicine' },
  { id: 'cardiology', name: 'Cardiology' },
  { id: 'orthopedics', name: 'Orthopedics' },
  { id: 'neurology', name: 'Neurology' },
  { id: 'pediatrics', name: 'Pediatrics' },
  { id: 'gynecology', name: 'Gynecology & Obstetrics' },
  { id: 'dermatology', name: 'Dermatology' },
  { id: 'ophthalmology', name: 'Ophthalmology' },
  { id: 'ent', name: 'ENT' },
  { id: 'dental', name: 'Dental' },
  { id: 'radiology', name: 'Radiology' },
  { id: 'pathology', name: 'Pathology' },
  { id: 'physiotherapy', name: 'Physiotherapy' },
  { id: 'emergency', name: 'Emergency' },
  { id: 'icu', name: 'ICU' },
];

// Insurance Categories
export const INSURANCE_CATEGORIES = [
  { id: 'covered', name: 'Fully Covered' },
  { id: 'partial', name: 'Partially Covered' },
  { id: 'not_covered', name: 'Not Covered' },
  { id: 'varies', name: 'Varies by Policy' },
];

// Duration Units
export const DURATION_UNITS = [
  { id: 'minutes', name: 'Minutes' },
  { id: 'hours', name: 'Hours' },
  { id: 'days', name: 'Days' },
  { id: 'sessions', name: 'Sessions' },
];

// Service Package Types
export const PACKAGE_TYPES = [
  { id: 'health_checkup', name: 'Health Checkup' },
  { id: 'maternity', name: 'Maternity Package' },
  { id: 'surgery', name: 'Surgery Package' },
  { id: 'dialysis', name: 'Dialysis Package' },
  { id: 'therapy', name: 'Therapy Package' },
  { id: 'preventive', name: 'Preventive Care Package' },
];
