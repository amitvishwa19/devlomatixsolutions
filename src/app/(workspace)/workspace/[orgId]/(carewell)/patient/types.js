// Patient statuses
export const PATIENT_STATUSES = [
  { id: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
  { id: 'inactive', label: 'Inactive', color: 'bg-muted text-muted-foreground' },
  { id: 'critical', label: 'Critical', color: 'bg-destructive/10 text-destructive' },
  { id: 'admitted', label: 'Admitted', color: 'bg-blue-100 text-blue-700' },
  { id: 'discharged', label: 'Discharged', color: 'bg-amber-100 text-amber-700' },
];

// Blood groups
export const BLOOD_GROUPS = [
  { id: 'a+', label: 'A+' },
  { id: 'a-', label: 'A-' },
  { id: 'b+', label: 'B+' },
  { id: 'b-', label: 'B-' },
  { id: 'ab+', label: 'AB+' },
  { id: 'ab-', label: 'AB-' },
  { id: 'o+', label: 'O+' },
  { id: 'o-', label: 'O-' },
];

// Gender options
export const GENDERS = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
];

// Allergy severity
export const ALLERGY_SEVERITY = [
  { id: 'mild', label: 'Mild', color: 'bg-amber-100 text-amber-700' },
  { id: 'moderate', label: 'Moderate', color: 'bg-orange-100 text-orange-700' },
  { id: 'severe', label: 'Severe', color: 'bg-destructive/10 text-destructive' },
];

// Common allergies
export const COMMON_ALLERGIES = [
  'Penicillin', 'Aspirin', 'Ibuprofen', 'Sulfa drugs', 'Codeine',
  'Latex', 'Peanuts', 'Shellfish', 'Eggs', 'Dairy',
];

// Vital signs reference
export const VITAL_TYPES = [
  { id: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg', icon: 'Heart', normalRange: '90/60-120/80' },
  { id: 'heart_rate', label: 'Heart Rate', unit: 'bpm', icon: 'Activity', normalRange: '60-100' },
  { id: 'temperature', label: 'Temperature', unit: '°F', icon: 'Thermometer', normalRange: '97.8-99.1' },
  { id: 'oxygen_saturation', label: 'SpO2', unit: '%', icon: 'Wind', normalRange: '95-100' },
  { id: 'respiratory_rate', label: 'Respiratory Rate', unit: '/min', icon: 'Wind', normalRange: '12-20' },
  { id: 'weight', label: 'Weight', unit: 'kg', icon: 'Scale', normalRange: '-' },
  { id: 'height', label: 'Height', unit: 'cm', icon: 'Ruler', normalRange: '-' },
  { id: 'bmi', label: 'BMI', unit: 'kg/m²', icon: 'Calculator', normalRange: '18.5-24.9' },
];

// Insurance providers
export const INSURANCE_PROVIDERS = [
  { id: 'star', label: 'Star Health Insurance' },
  { id: 'hdfc', label: 'HDFC ERGO' },
  { id: 'icici', label: 'ICICI Lombard' },
  { id: 'max', label: 'Max Bupa' },
  { id: 'bajaj', label: 'Bajaj Allianz' },
  { id: 'none', label: 'Self Pay / No Insurance' },
];

// Relationship options for emergency contact
export const RELATIONSHIPS = [
  { id: 'spouse', label: 'Spouse' },
  { id: 'parent', label: 'Parent' },
  { id: 'child', label: 'Child' },
  { id: 'sibling', label: 'Sibling' },
  { id: 'friend', label: 'Friend' },
  { id: 'other', label: 'Other' },
];

// Medical history condition statuses
export const CONDITION_STATUSES = [
  { id: 'active', label: 'Active', color: 'bg-destructive/10 text-destructive' },
  { id: 'ongoing', label: 'Ongoing', color: 'bg-amber-100 text-amber-700' },
  { id: 'recovering', label: 'Recovering', color: 'bg-blue-100 text-blue-700' },
  { id: 'recovered', label: 'Recovered', color: 'bg-green-100 text-green-700' },
  { id: 'chronic', label: 'Chronic', color: 'bg-purple-100 text-purple-700' },
];

// Medical history types
export const HISTORY_TYPES = [
  { id: 'diagnosis', label: 'Diagnosis', icon: 'Stethoscope' },
  { id: 'surgery', label: 'Surgery', icon: 'Scissors' },
  { id: 'procedure', label: 'Procedure', icon: 'Activity' },
  { id: 'hospitalization', label: 'Hospitalization', icon: 'Building' },
  { id: 'vaccination', label: 'Vaccination', icon: 'Syringe' },
  { id: 'injury', label: 'Injury', icon: 'AlertTriangle' },
];

// Document types
export const DOCUMENT_TYPES = [
  { id: 'lab_report', label: 'Lab Report', icon: 'TestTube' },
  { id: 'radiology', label: 'Radiology', icon: 'Scan' },
  { id: 'prescription', label: 'Prescription', icon: 'Pill' },
  { id: 'discharge', label: 'Discharge Summary', icon: 'FileText' },
  { id: 'referral', label: 'Referral Letter', icon: 'Send' },
  { id: 'insurance', label: 'Insurance Document', icon: 'Shield' },
  { id: 'consent', label: 'Consent Form', icon: 'FileCheck' },
  { id: 'other', label: 'Other', icon: 'File' },
];

// Common medicines for prescriptions
export const COMMON_MEDICINES = [
  'Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Azithromycin', 'Ciprofloxacin',
  'Metformin', 'Amlodipine', 'Atorvastatin', 'Omeprazole', 'Losartan',
  'Aspirin', 'Clopidogrel', 'Insulin', 'Levothyroxine', 'Prednisone',
];

// Dosage frequencies
export const DOSAGE_FREQUENCIES = [
  { id: 'once_daily', label: 'Once daily' },
  { id: 'twice_daily', label: 'Twice daily' },
  { id: 'thrice_daily', label: 'Three times daily' },
  { id: 'four_times', label: 'Four times daily' },
  { id: 'every_4_hours', label: 'Every 4 hours' },
  { id: 'every_6_hours', label: 'Every 6 hours' },
  { id: 'every_8_hours', label: 'Every 8 hours' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'as_needed', label: 'As needed (PRN)' },
  { id: 'before_meals', label: 'Before meals' },
  { id: 'after_meals', label: 'After meals' },
];

// Duration options
export const DURATION_OPTIONS = [
  { id: '3_days', label: '3 days' },
  { id: '5_days', label: '5 days' },
  { id: '7_days', label: '7 days' },
  { id: '10_days', label: '10 days' },
  { id: '14_days', label: '14 days' },
  { id: '30_days', label: '30 days' },
  { id: '60_days', label: '60 days' },
  { id: '90_days', label: '90 days' },
  { id: 'ongoing', label: 'Ongoing' },
];

// Medicine routes
export const MEDICINE_ROUTES = [
  { id: 'oral', label: 'Oral' },
  { id: 'iv', label: 'Intravenous (IV)' },
  { id: 'im', label: 'Intramuscular (IM)' },
  { id: 'sc', label: 'Subcutaneous' },
  { id: 'topical', label: 'Topical' },
  { id: 'inhalation', label: 'Inhalation' },
  { id: 'sublingual', label: 'Sublingual' },
  { id: 'rectal', label: 'Rectal' },
];
