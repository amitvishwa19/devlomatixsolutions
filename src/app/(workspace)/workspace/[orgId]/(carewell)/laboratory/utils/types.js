/**
 * Laboratory Module Types
 */

// Test Order Status
export const TEST_ORDER_STATUS = {
  ORDERED: 'ordered',
  SAMPLE_COLLECTED: 'sample_collected',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ON_HOLD: 'on_hold',
};

export const TEST_ORDER_STATUS_LABELS = {
  [TEST_ORDER_STATUS.ORDERED]: 'Ordered',
  [TEST_ORDER_STATUS.SAMPLE_COLLECTED]: 'Sample Collected',
  [TEST_ORDER_STATUS.IN_PROGRESS]: 'In Progress',
  [TEST_ORDER_STATUS.COMPLETED]: 'Completed',
  [TEST_ORDER_STATUS.CANCELLED]: 'Cancelled',
  [TEST_ORDER_STATUS.ON_HOLD]: 'On Hold',
};

export const TEST_ORDER_STATUS_COLORS = {
  [TEST_ORDER_STATUS.ORDERED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  [TEST_ORDER_STATUS.SAMPLE_COLLECTED]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  [TEST_ORDER_STATUS.IN_PROGRESS]: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  [TEST_ORDER_STATUS.COMPLETED]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  [TEST_ORDER_STATUS.CANCELLED]: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  [TEST_ORDER_STATUS.ON_HOLD]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

// Sample Types
export const SAMPLE_TYPES = [
  { id: 'blood', label: 'Blood', icon: 'droplet' },
  { id: 'urine', label: 'Urine', icon: 'flask' },
  { id: 'stool', label: 'Stool', icon: 'box' },
  { id: 'sputum', label: 'Sputum', icon: 'wind' },
  { id: 'swab', label: 'Swab', icon: 'pipette' },
  { id: 'tissue', label: 'Tissue', icon: 'scan' },
  { id: 'csf', label: 'CSF', icon: 'brain' },
  { id: 'other', label: 'Other', icon: 'circle' },
];

// Test Categories
export const TEST_CATEGORIES = [
  { id: 'hematology', label: 'Hematology', description: 'Blood cell analysis' },
  { id: 'biochemistry', label: 'Biochemistry', description: 'Chemical analysis of body fluids' },
  { id: 'microbiology', label: 'Microbiology', description: 'Bacterial and viral cultures' },
  { id: 'immunology', label: 'Immunology', description: 'Immune system analysis' },
  { id: 'endocrinology', label: 'Endocrinology', description: 'Hormone testing' },
  { id: 'pathology', label: 'Pathology', description: 'Tissue examination' },
  { id: 'serology', label: 'Serology', description: 'Antibody testing' },
  { id: 'urinalysis', label: 'Urinalysis', description: 'Urine analysis' },
  { id: 'toxicology', label: 'Toxicology', description: 'Drug and poison testing' },
  { id: 'genetics', label: 'Genetics', description: 'DNA/Genetic testing' },
];

// Priority Levels
export const PRIORITY_LEVELS = [
  { id: 'routine', label: 'Routine', color: 'bg-secondary text-secondary-foreground' },
  { id: 'urgent', label: 'Urgent', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  { id: 'stat', label: 'STAT', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
];

// Common Lab Tests
export const COMMON_TESTS = [
  // Hematology
  { id: 'cbc', name: 'Complete Blood Count (CBC)', category: 'hematology', sampleType: 'blood', turnaround: '4 hours', price: 350 },
  { id: 'hb', name: 'Hemoglobin', category: 'hematology', sampleType: 'blood', turnaround: '2 hours', price: 100 },
  { id: 'esr', name: 'ESR (Erythrocyte Sedimentation Rate)', category: 'hematology', sampleType: 'blood', turnaround: '2 hours', price: 120 },
  { id: 'pt', name: 'Prothrombin Time (PT/INR)', category: 'hematology', sampleType: 'blood', turnaround: '4 hours', price: 450 },
  { id: 'aptt', name: 'Activated Partial Thromboplastin Time', category: 'hematology', sampleType: 'blood', turnaround: '4 hours', price: 400 },
  
  // Biochemistry
  { id: 'lft', name: 'Liver Function Test (LFT)', category: 'biochemistry', sampleType: 'blood', turnaround: '6 hours', price: 800 },
  { id: 'rft', name: 'Renal Function Test (RFT/KFT)', category: 'biochemistry', sampleType: 'blood', turnaround: '6 hours', price: 700 },
  { id: 'lipid', name: 'Lipid Profile', category: 'biochemistry', sampleType: 'blood', turnaround: '6 hours', price: 600 },
  { id: 'glucose_fasting', name: 'Fasting Blood Glucose', category: 'biochemistry', sampleType: 'blood', turnaround: '2 hours', price: 100 },
  { id: 'glucose_pp', name: 'Post Prandial Blood Sugar', category: 'biochemistry', sampleType: 'blood', turnaround: '2 hours', price: 100 },
  { id: 'hba1c', name: 'HbA1c (Glycated Hemoglobin)', category: 'biochemistry', sampleType: 'blood', turnaround: '24 hours', price: 500 },
  { id: 'electrolytes', name: 'Serum Electrolytes', category: 'biochemistry', sampleType: 'blood', turnaround: '4 hours', price: 400 },
  { id: 'uric_acid', name: 'Uric Acid', category: 'biochemistry', sampleType: 'blood', turnaround: '4 hours', price: 200 },
  
  // Endocrinology
  { id: 'thyroid', name: 'Thyroid Profile (T3, T4, TSH)', category: 'endocrinology', sampleType: 'blood', turnaround: '24 hours', price: 900 },
  { id: 'tsh', name: 'TSH', category: 'endocrinology', sampleType: 'blood', turnaround: '24 hours', price: 350 },
  { id: 'vitamin_d', name: 'Vitamin D (25-OH)', category: 'endocrinology', sampleType: 'blood', turnaround: '24 hours', price: 1200 },
  { id: 'vitamin_b12', name: 'Vitamin B12', category: 'endocrinology', sampleType: 'blood', turnaround: '24 hours', price: 800 },
  
  // Immunology/Serology
  { id: 'crp', name: 'C-Reactive Protein (CRP)', category: 'immunology', sampleType: 'blood', turnaround: '6 hours', price: 500 },
  { id: 'ra_factor', name: 'Rheumatoid Factor (RA)', category: 'immunology', sampleType: 'blood', turnaround: '24 hours', price: 450 },
  { id: 'ana', name: 'Antinuclear Antibody (ANA)', category: 'immunology', sampleType: 'blood', turnaround: '48 hours', price: 1500 },
  { id: 'hiv', name: 'HIV 1 & 2 Antibody', category: 'serology', sampleType: 'blood', turnaround: '24 hours', price: 500 },
  { id: 'hbsag', name: 'Hepatitis B Surface Antigen', category: 'serology', sampleType: 'blood', turnaround: '24 hours', price: 400 },
  { id: 'hcv', name: 'Hepatitis C Antibody', category: 'serology', sampleType: 'blood', turnaround: '24 hours', price: 600 },
  
  // Urinalysis
  { id: 'urine_routine', name: 'Urine Routine Examination', category: 'urinalysis', sampleType: 'urine', turnaround: '2 hours', price: 150 },
  { id: 'urine_culture', name: 'Urine Culture & Sensitivity', category: 'urinalysis', sampleType: 'urine', turnaround: '72 hours', price: 600 },
  
  // Microbiology
  { id: 'blood_culture', name: 'Blood Culture', category: 'microbiology', sampleType: 'blood', turnaround: '72 hours', price: 800 },
  { id: 'stool_routine', name: 'Stool Routine Examination', category: 'microbiology', sampleType: 'stool', turnaround: '4 hours', price: 200 },
  { id: 'stool_culture', name: 'Stool Culture', category: 'microbiology', sampleType: 'stool', turnaround: '72 hours', price: 600 },
  
  // Pathology
  { id: 'biopsy', name: 'Tissue Biopsy', category: 'pathology', sampleType: 'tissue', turnaround: '5 days', price: 2500 },
  { id: 'pap_smear', name: 'Pap Smear', category: 'pathology', sampleType: 'swab', turnaround: '48 hours', price: 800 },
];

// Result Status
export const RESULT_STATUS = {
  NORMAL: 'normal',
  ABNORMAL_LOW: 'abnormal_low',
  ABNORMAL_HIGH: 'abnormal_high',
  CRITICAL_LOW: 'critical_low',
  CRITICAL_HIGH: 'critical_high',
  PENDING: 'pending',
};

export const RESULT_STATUS_COLORS = {
  [RESULT_STATUS.NORMAL]: 'text-emerald-600 dark:text-emerald-400',
  [RESULT_STATUS.ABNORMAL_LOW]: 'text-amber-600 dark:text-amber-400',
  [RESULT_STATUS.ABNORMAL_HIGH]: 'text-amber-600 dark:text-amber-400',
  [RESULT_STATUS.CRITICAL_LOW]: 'text-red-600 dark:text-red-400',
  [RESULT_STATUS.CRITICAL_HIGH]: 'text-red-600 dark:text-red-400',
  [RESULT_STATUS.PENDING]: 'text-muted-foreground',
};

// Equipment Status
export const EQUIPMENT_STATUS = [
  { id: 'operational', label: 'Operational', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'maintenance', label: 'Under Maintenance', color: 'bg-amber-100 text-amber-800' },
  { id: 'out_of_order', label: 'Out of Order', color: 'bg-red-100 text-red-800' },
  { id: 'calibrating', label: 'Calibrating', color: 'bg-blue-100 text-blue-800' },
];
