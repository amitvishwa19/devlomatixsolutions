// Prescription status options
export const PRESCRIPTION_STATUSES = [
  { id: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
  { id: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-700' },
  { id: 'discontinued', label: 'Discontinued', color: 'bg-red-100 text-red-700' },
  { id: 'on-hold', label: 'On Hold', color: 'bg-amber-100 text-amber-700' },
];

// Dosage frequencies
export const DOSAGE_FREQUENCIES = [
  { id: 'once-daily', label: 'Once Daily', shortLabel: 'OD' },
  { id: 'twice-daily', label: 'Twice Daily', shortLabel: 'BD' },
  { id: 'thrice-daily', label: 'Three Times Daily', shortLabel: 'TDS' },
  { id: 'four-times', label: 'Four Times Daily', shortLabel: 'QID' },
  { id: 'every-4-hours', label: 'Every 4 Hours', shortLabel: 'Q4H' },
  { id: 'every-6-hours', label: 'Every 6 Hours', shortLabel: 'Q6H' },
  { id: 'every-8-hours', label: 'Every 8 Hours', shortLabel: 'Q8H' },
  { id: 'every-12-hours', label: 'Every 12 Hours', shortLabel: 'Q12H' },
  { id: 'as-needed', label: 'As Needed', shortLabel: 'PRN' },
  { id: 'at-bedtime', label: 'At Bedtime', shortLabel: 'HS' },
  { id: 'weekly', label: 'Weekly', shortLabel: 'Weekly' },
];

// Duration options
export const DURATION_OPTIONS = [
  { id: '3-days', label: '3 Days', days: 3 },
  { id: '5-days', label: '5 Days', days: 5 },
  { id: '7-days', label: '7 Days (1 Week)', days: 7 },
  { id: '10-days', label: '10 Days', days: 10 },
  { id: '14-days', label: '14 Days (2 Weeks)', days: 14 },
  { id: '21-days', label: '21 Days (3 Weeks)', days: 21 },
  { id: '30-days', label: '30 Days (1 Month)', days: 30 },
  { id: '60-days', label: '60 Days (2 Months)', days: 60 },
  { id: '90-days', label: '90 Days (3 Months)', days: 90 },
  { id: 'ongoing', label: 'Ongoing', days: null },
];

// Medicine routes
export const MEDICINE_ROUTES = [
  { id: 'oral', label: 'Oral' },
  { id: 'sublingual', label: 'Sublingual' },
  { id: 'topical', label: 'Topical' },
  { id: 'inhalation', label: 'Inhalation' },
  { id: 'injection-im', label: 'Injection (IM)' },
  { id: 'injection-iv', label: 'Injection (IV)' },
  { id: 'injection-sc', label: 'Injection (SC)' },
  { id: 'rectal', label: 'Rectal' },
  { id: 'ophthalmic', label: 'Ophthalmic (Eye)' },
  { id: 'otic', label: 'Otic (Ear)' },
  { id: 'nasal', label: 'Nasal' },
  { id: 'transdermal', label: 'Transdermal (Patch)' },
];

// Common medicines for autocomplete
export const COMMON_MEDICINES = [
  'Amoxicillin',
  'Azithromycin',
  'Ciprofloxacin',
  'Metformin',
  'Lisinopril',
  'Atorvastatin',
  'Omeprazole',
  'Metoprolol',
  'Amlodipine',
  'Losartan',
  'Gabapentin',
  'Hydrochlorothiazide',
  'Sertraline',
  'Tramadol',
  'Prednisone',
  'Ibuprofen',
  'Acetaminophen',
  'Aspirin',
  'Cetirizine',
  'Loratadine',
  'Montelukast',
  'Albuterol',
  'Pantoprazole',
  'Esomeprazole',
  'Levothyroxine',
  'Warfarin',
  'Clopidogrel',
  'Furosemide',
  'Spironolactone',
  'Duloxetine',
];

// Medicine categories
export const MEDICINE_CATEGORIES = [
  { id: 'antibiotic', label: 'Antibiotic' },
  { id: 'analgesic', label: 'Analgesic/Pain Relief' },
  { id: 'antihypertensive', label: 'Antihypertensive' },
  { id: 'antidiabetic', label: 'Antidiabetic' },
  { id: 'antihistamine', label: 'Antihistamine' },
  { id: 'antidepressant', label: 'Antidepressant' },
  { id: 'antacid', label: 'Antacid/PPI' },
  { id: 'cardiovascular', label: 'Cardiovascular' },
  { id: 'respiratory', label: 'Respiratory' },
  { id: 'gastrointestinal', label: 'Gastrointestinal' },
  { id: 'neurological', label: 'Neurological' },
  { id: 'hormonal', label: 'Hormonal' },
  { id: 'vitamin', label: 'Vitamin/Supplement' },
  { id: 'other', label: 'Other' },
];
