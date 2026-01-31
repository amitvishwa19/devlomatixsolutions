import { subDays, subHours, addHours, addDays } from 'date-fns';
import { TEST_ORDER_STATUS, COMMON_TESTS, RESULT_STATUS } from './types';

const now = new Date();

// Mock patients for lab orders
const MOCK_PATIENTS = [
  { id: 'p1', name: 'Rahul Sharma', mrn: 'MRN-2024-0001', age: 45, gender: 'male' },
  { id: 'p2', name: 'Priya Patel', mrn: 'MRN-2024-0002', age: 32, gender: 'female' },
  { id: 'p3', name: 'Amit Kumar', mrn: 'MRN-2024-0003', age: 58, gender: 'male' },
  { id: 'p4', name: 'Sunita Devi', mrn: 'MRN-2024-0004', age: 41, gender: 'female' },
  { id: 'p5', name: 'Vikram Singh', mrn: 'MRN-2024-0005', age: 67, gender: 'male' },
  { id: 'p6', name: 'Anjali Gupta', mrn: 'MRN-2024-0006', age: 28, gender: 'female' },
];

// Mock doctors
const MOCK_DOCTORS = [
  { id: 'd1', name: 'Dr. Priya Patel', department: 'Internal Medicine' },
  { id: 'd2', name: 'Dr. Rajesh Kumar', department: 'Cardiology' },
  { id: 'd3', name: 'Dr. Sunita Sharma', department: 'Endocrinology' },
  { id: 'd4', name: 'Dr. Amit Singh', department: 'Nephrology' },
];

// Mock lab technicians
const MOCK_TECHNICIANS = [
  { id: 't1', name: 'Ravi Verma', specialization: 'Hematology' },
  { id: 't2', name: 'Meera Shah', specialization: 'Biochemistry' },
  { id: 't3', name: 'Arun Patel', specialization: 'Microbiology' },
];

// Generate test results for completed orders
const generateTestResults = (testId, status) => {
  if (status !== TEST_ORDER_STATUS.COMPLETED) return null;
  
  const test = COMMON_TESTS.find(t => t.id === testId);
  if (!test) return null;

  // Sample results based on test type
  const resultsMap = {
    cbc: [
      { parameter: 'Hemoglobin', value: '14.2', unit: 'g/dL', normalRange: '12.0-16.0', status: RESULT_STATUS.NORMAL },
      { parameter: 'RBC Count', value: '4.8', unit: 'million/µL', normalRange: '4.5-5.5', status: RESULT_STATUS.NORMAL },
      { parameter: 'WBC Count', value: '11500', unit: '/µL', normalRange: '4000-11000', status: RESULT_STATUS.ABNORMAL_HIGH },
      { parameter: 'Platelet Count', value: '250000', unit: '/µL', normalRange: '150000-400000', status: RESULT_STATUS.NORMAL },
      { parameter: 'Hematocrit', value: '42', unit: '%', normalRange: '36-46', status: RESULT_STATUS.NORMAL },
    ],
    lft: [
      { parameter: 'Total Bilirubin', value: '0.8', unit: 'mg/dL', normalRange: '0.1-1.2', status: RESULT_STATUS.NORMAL },
      { parameter: 'SGOT (AST)', value: '45', unit: 'U/L', normalRange: '10-40', status: RESULT_STATUS.ABNORMAL_HIGH },
      { parameter: 'SGPT (ALT)', value: '52', unit: 'U/L', normalRange: '7-56', status: RESULT_STATUS.NORMAL },
      { parameter: 'Alkaline Phosphatase', value: '85', unit: 'U/L', normalRange: '44-147', status: RESULT_STATUS.NORMAL },
      { parameter: 'Total Protein', value: '7.2', unit: 'g/dL', normalRange: '6.0-8.3', status: RESULT_STATUS.NORMAL },
      { parameter: 'Albumin', value: '4.1', unit: 'g/dL', normalRange: '3.5-5.0', status: RESULT_STATUS.NORMAL },
    ],
    rft: [
      { parameter: 'Blood Urea', value: '28', unit: 'mg/dL', normalRange: '15-40', status: RESULT_STATUS.NORMAL },
      { parameter: 'Serum Creatinine', value: '1.8', unit: 'mg/dL', normalRange: '0.7-1.3', status: RESULT_STATUS.ABNORMAL_HIGH },
      { parameter: 'BUN', value: '18', unit: 'mg/dL', normalRange: '7-20', status: RESULT_STATUS.NORMAL },
      { parameter: 'Uric Acid', value: '6.5', unit: 'mg/dL', normalRange: '3.5-7.2', status: RESULT_STATUS.NORMAL },
    ],
    lipid: [
      { parameter: 'Total Cholesterol', value: '220', unit: 'mg/dL', normalRange: '<200', status: RESULT_STATUS.ABNORMAL_HIGH },
      { parameter: 'Triglycerides', value: '180', unit: 'mg/dL', normalRange: '<150', status: RESULT_STATUS.ABNORMAL_HIGH },
      { parameter: 'HDL Cholesterol', value: '45', unit: 'mg/dL', normalRange: '>40', status: RESULT_STATUS.NORMAL },
      { parameter: 'LDL Cholesterol', value: '140', unit: 'mg/dL', normalRange: '<100', status: RESULT_STATUS.ABNORMAL_HIGH },
      { parameter: 'VLDL', value: '36', unit: 'mg/dL', normalRange: '5-40', status: RESULT_STATUS.NORMAL },
    ],
    thyroid: [
      { parameter: 'T3', value: '1.2', unit: 'ng/mL', normalRange: '0.8-2.0', status: RESULT_STATUS.NORMAL },
      { parameter: 'T4', value: '8.5', unit: 'µg/dL', normalRange: '5.1-14.1', status: RESULT_STATUS.NORMAL },
      { parameter: 'TSH', value: '6.8', unit: 'mIU/L', normalRange: '0.4-4.0', status: RESULT_STATUS.ABNORMAL_HIGH },
    ],
    glucose_fasting: [
      { parameter: 'Fasting Blood Glucose', value: '126', unit: 'mg/dL', normalRange: '70-100', status: RESULT_STATUS.ABNORMAL_HIGH },
    ],
    hba1c: [
      { parameter: 'HbA1c', value: '7.2', unit: '%', normalRange: '<5.7', status: RESULT_STATUS.ABNORMAL_HIGH },
    ],
    urine_routine: [
      { parameter: 'Color', value: 'Yellow', unit: '', normalRange: 'Pale Yellow', status: RESULT_STATUS.NORMAL },
      { parameter: 'pH', value: '6.0', unit: '', normalRange: '4.5-8.0', status: RESULT_STATUS.NORMAL },
      { parameter: 'Specific Gravity', value: '1.020', unit: '', normalRange: '1.005-1.030', status: RESULT_STATUS.NORMAL },
      { parameter: 'Protein', value: 'Trace', unit: '', normalRange: 'Negative', status: RESULT_STATUS.ABNORMAL_HIGH },
      { parameter: 'Glucose', value: 'Negative', unit: '', normalRange: 'Negative', status: RESULT_STATUS.NORMAL },
    ],
  };

  return resultsMap[testId] || [
    { parameter: 'Result', value: 'Normal', unit: '', normalRange: 'Normal', status: RESULT_STATUS.NORMAL },
  ];
};

// Mock Test Orders
export const mockTestOrders = [
  {
    id: 'lab-001',
    orderNumber: 'LAB-2024-0001',
    patient: MOCK_PATIENTS[0],
    orderedBy: MOCK_DOCTORS[0],
    tests: [
      { ...COMMON_TESTS.find(t => t.id === 'cbc'), results: generateTestResults('cbc', TEST_ORDER_STATUS.COMPLETED) },
      { ...COMMON_TESTS.find(t => t.id === 'lft'), results: generateTestResults('lft', TEST_ORDER_STATUS.COMPLETED) },
    ],
    status: TEST_ORDER_STATUS.COMPLETED,
    priority: 'routine',
    orderedAt: subDays(now, 3),
    sampleCollectedAt: subDays(now, 3),
    completedAt: subDays(now, 2),
    collectedBy: MOCK_TECHNICIANS[0],
    verifiedBy: MOCK_DOCTORS[0],
    notes: 'Annual health checkup',
    tags: ['tag1'],
    categories: ['cat1'],
  },
  {
    id: 'lab-002',
    orderNumber: 'LAB-2024-0002',
    patient: MOCK_PATIENTS[1],
    orderedBy: MOCK_DOCTORS[2],
    tests: [
      { ...COMMON_TESTS.find(t => t.id === 'thyroid'), results: generateTestResults('thyroid', TEST_ORDER_STATUS.COMPLETED) },
      { ...COMMON_TESTS.find(t => t.id === 'vitamin_d'), results: null },
    ],
    status: TEST_ORDER_STATUS.COMPLETED,
    priority: 'routine',
    orderedAt: subDays(now, 2),
    sampleCollectedAt: subDays(now, 2),
    completedAt: subDays(now, 1),
    collectedBy: MOCK_TECHNICIANS[1],
    verifiedBy: MOCK_DOCTORS[2],
    notes: 'Follow-up for thyroid disorder',
    tags: [],
    categories: [],
  },
  {
    id: 'lab-003',
    orderNumber: 'LAB-2024-0003',
    patient: MOCK_PATIENTS[2],
    orderedBy: MOCK_DOCTORS[1],
    tests: [
      { ...COMMON_TESTS.find(t => t.id === 'lipid'), results: null },
      { ...COMMON_TESTS.find(t => t.id === 'glucose_fasting'), results: null },
      { ...COMMON_TESTS.find(t => t.id === 'hba1c'), results: null },
    ],
    status: TEST_ORDER_STATUS.IN_PROGRESS,
    priority: 'urgent',
    orderedAt: subHours(now, 8),
    sampleCollectedAt: subHours(now, 7),
    completedAt: null,
    collectedBy: MOCK_TECHNICIANS[0],
    verifiedBy: null,
    notes: 'Cardiac risk assessment',
    tags: ['tag2'],
    categories: [],
  },
  {
    id: 'lab-004',
    orderNumber: 'LAB-2024-0004',
    patient: MOCK_PATIENTS[3],
    orderedBy: MOCK_DOCTORS[3],
    tests: [
      { ...COMMON_TESTS.find(t => t.id === 'rft'), results: null },
      { ...COMMON_TESTS.find(t => t.id === 'urine_routine'), results: null },
    ],
    status: TEST_ORDER_STATUS.SAMPLE_COLLECTED,
    priority: 'routine',
    orderedAt: subHours(now, 4),
    sampleCollectedAt: subHours(now, 3),
    completedAt: null,
    collectedBy: MOCK_TECHNICIANS[2],
    verifiedBy: null,
    notes: 'Kidney function monitoring',
    tags: [],
    categories: ['cat2'],
  },
  {
    id: 'lab-005',
    orderNumber: 'LAB-2024-0005',
    patient: MOCK_PATIENTS[4],
    orderedBy: MOCK_DOCTORS[0],
    tests: [
      { ...COMMON_TESTS.find(t => t.id === 'blood_culture'), results: null },
    ],
    status: TEST_ORDER_STATUS.ORDERED,
    priority: 'stat',
    orderedAt: subHours(now, 1),
    sampleCollectedAt: null,
    completedAt: null,
    collectedBy: null,
    verifiedBy: null,
    notes: 'Suspected sepsis - URGENT',
    tags: ['tag3'],
    categories: [],
  },
  {
    id: 'lab-006',
    orderNumber: 'LAB-2024-0006',
    patient: MOCK_PATIENTS[5],
    orderedBy: MOCK_DOCTORS[2],
    tests: [
      { ...COMMON_TESTS.find(t => t.id === 'cbc'), results: generateTestResults('cbc', TEST_ORDER_STATUS.COMPLETED) },
    ],
    status: TEST_ORDER_STATUS.COMPLETED,
    priority: 'routine',
    orderedAt: subDays(now, 5),
    sampleCollectedAt: subDays(now, 5),
    completedAt: subDays(now, 4),
    collectedBy: MOCK_TECHNICIANS[1],
    verifiedBy: MOCK_DOCTORS[2],
    notes: 'Pre-operative assessment',
    tags: [],
    categories: [],
  },
  {
    id: 'lab-007',
    orderNumber: 'LAB-2024-0007',
    patient: MOCK_PATIENTS[0],
    orderedBy: MOCK_DOCTORS[1],
    tests: [
      { ...COMMON_TESTS.find(t => t.id === 'electrolytes'), results: null },
    ],
    status: TEST_ORDER_STATUS.ON_HOLD,
    priority: 'routine',
    orderedAt: subDays(now, 1),
    sampleCollectedAt: null,
    completedAt: null,
    collectedBy: null,
    verifiedBy: null,
    notes: 'Patient NPO status needed - on hold',
    tags: [],
    categories: [],
  },
];

// Mock Equipment
export const mockEquipment = [
  {
    id: 'eq-001',
    name: 'Hematology Analyzer',
    model: 'Sysmex XN-1000',
    serialNumber: 'SYS-2022-001',
    department: 'Hematology',
    status: 'operational',
    lastCalibration: subDays(now, 7),
    nextCalibration: addDays(now, 23),
    lastMaintenance: subDays(now, 30),
    nextMaintenance: addDays(now, 60),
  },
  {
    id: 'eq-002',
    name: 'Chemistry Analyzer',
    model: 'Roche Cobas c501',
    serialNumber: 'ROC-2021-045',
    department: 'Biochemistry',
    status: 'operational',
    lastCalibration: subDays(now, 3),
    nextCalibration: addDays(now, 27),
    lastMaintenance: subDays(now, 45),
    nextMaintenance: addDays(now, 45),
  },
  {
    id: 'eq-003',
    name: 'Immunoassay Analyzer',
    model: 'Abbott Architect i1000SR',
    serialNumber: 'ABB-2023-012',
    department: 'Immunology',
    status: 'maintenance',
    lastCalibration: subDays(now, 14),
    nextCalibration: addDays(now, 16),
    lastMaintenance: now,
    nextMaintenance: addDays(now, 90),
  },
  {
    id: 'eq-004',
    name: 'Blood Gas Analyzer',
    model: 'Radiometer ABL90',
    serialNumber: 'RAD-2022-078',
    department: 'Critical Care',
    status: 'operational',
    lastCalibration: subDays(now, 1),
    nextCalibration: addDays(now, 29),
    lastMaintenance: subDays(now, 60),
    nextMaintenance: addDays(now, 30),
  },
  {
    id: 'eq-005',
    name: 'Centrifuge',
    model: 'Eppendorf 5804R',
    serialNumber: 'EPP-2020-156',
    department: 'General',
    status: 'out_of_order',
    lastCalibration: subDays(now, 90),
    nextCalibration: subDays(now, 60),
    lastMaintenance: subDays(now, 120),
    nextMaintenance: subDays(now, 30),
  },
];

// Mock Quality Control Records
export const mockQCRecords = [
  {
    id: 'qc-001',
    equipment: mockEquipment[0],
    testType: 'Daily QC',
    performedBy: MOCK_TECHNICIANS[0],
    performedAt: subHours(now, 2),
    status: 'passed',
    parameters: [
      { name: 'WBC Control L1', expected: '3.5', actual: '3.48', status: 'pass' },
      { name: 'WBC Control L2', expected: '12.0', actual: '12.1', status: 'pass' },
      { name: 'RBC Control L1', expected: '2.5', actual: '2.52', status: 'pass' },
      { name: 'RBC Control L2', expected: '5.5', actual: '5.48', status: 'pass' },
    ],
    notes: 'All parameters within acceptable range',
  },
  {
    id: 'qc-002',
    equipment: mockEquipment[1],
    testType: 'Daily QC',
    performedBy: MOCK_TECHNICIANS[1],
    performedAt: subHours(now, 3),
    status: 'passed',
    parameters: [
      { name: 'Glucose Control', expected: '100', actual: '98', status: 'pass' },
      { name: 'Creatinine Control', expected: '2.0', actual: '2.05', status: 'pass' },
    ],
    notes: '',
  },
];
