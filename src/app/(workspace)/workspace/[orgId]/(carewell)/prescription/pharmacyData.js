import { subHours, subDays } from 'date-fns';

const now = new Date();

// Mock pharmacy database
export const MOCK_PHARMACIES = [
  {
    id: 'ph-001',
    name: 'CVS Pharmacy',
    address: '123 Main Street, Downtown',
    phone: '(555) 123-4567',
    fax: '(555) 123-4568',
    hours: '8:00 AM - 10:00 PM',
    preferred: true,
    acceptsEPrescribe: true,
  },
  {
    id: 'ph-002',
    name: 'Walgreens',
    address: '456 Oak Avenue, Westside',
    phone: '(555) 234-5678',
    fax: '(555) 234-5679',
    hours: '24 Hours',
    preferred: false,
    acceptsEPrescribe: true,
  },
  {
    id: 'ph-003',
    name: 'Rite Aid',
    address: '789 Elm Boulevard, Eastside',
    phone: '(555) 345-6789',
    fax: '(555) 345-6790',
    hours: '9:00 AM - 9:00 PM',
    preferred: false,
    acceptsEPrescribe: true,
  },
  {
    id: 'ph-004',
    name: 'Costco Pharmacy',
    address: '321 Commerce Drive, North Mall',
    phone: '(555) 456-7890',
    fax: '(555) 456-7891',
    hours: '10:00 AM - 8:30 PM',
    preferred: false,
    acceptsEPrescribe: true,
  },
  {
    id: 'ph-005',
    name: 'Community Care Pharmacy',
    address: '555 Health Center Way',
    phone: '(555) 567-8901',
    fax: '(555) 567-8902',
    hours: '8:00 AM - 6:00 PM',
    preferred: true,
    acceptsEPrescribe: true,
  },
];

// Mock sent prescriptions for tracking
export const MOCK_SENT_PRESCRIPTIONS = [
  {
    id: 'erx-001',
    prescriptionId: 'rx-002',
    patientName: 'James Miller',
    pharmacy: MOCK_PHARMACIES[0],
    sentAt: subHours(now, 2),
    status: 'ready',
    medicines: [{ name: 'Metformin', dosage: '1000mg' }],
  },
  {
    id: 'erx-002',
    prescriptionId: 'rx-003',
    patientName: 'Sofia Garcia',
    pharmacy: MOCK_PHARMACIES[1],
    sentAt: subDays(now, 1),
    status: 'dispensed',
    medicines: [{ name: 'Amlodipine', dosage: '5mg' }],
  },
  {
    id: 'erx-003',
    prescriptionId: 'rx-005',
    patientName: 'Maria Santos',
    pharmacy: MOCK_PHARMACIES[4],
    sentAt: subHours(now, 5),
    status: 'processing',
    medicines: [{ name: 'Sumatriptan', dosage: '50mg' }],
  },
];
