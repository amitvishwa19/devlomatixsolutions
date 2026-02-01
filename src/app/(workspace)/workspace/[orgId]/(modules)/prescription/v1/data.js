const setPatients = [
    { id: '1', name: 'John Smith', age: 45, gender: 'male', phone: '+1 234 567 8901', email: 'john.smith@email.com' },
    { id: '2', name: 'Sarah Johnson', age: 32, gender: 'female', phone: '+1 234 567 8902', email: 'sarah.j@email.com' },
    { id: '3', name: 'Michael Brown', age: 58, gender: 'male', phone: '+1 234 567 8903' },
    { id: '4', name: 'Emily Davis', age: 28, gender: 'female', phone: '+1 234 567 8904', email: 'emily.d@email.com' },
    { id: '5', name: 'Robert Wilson', age: 67, gender: 'male', phone: '+1 234 567 8905' },
];

const patients = [
    { id: '1', name: 'John Smith', age: 45, gender: 'male', phone: '+1 234 567 8901', email: 'john.smith@email.com' },
    { id: '2', name: 'Sarah Johnson', age: 32, gender: 'female', phone: '+1 234 567 8902', email: 'sarah.j@email.com' },
    { id: '3', name: 'Michael Brown', age: 58, gender: 'male', phone: '+1 234 567 8903' },
    { id: '4', name: 'Emily Davis', age: 28, gender: 'female', phone: '+1 234 567 8904', email: 'emily.d@email.com' },
    { id: '5', name: 'Robert Wilson', age: 67, gender: 'male', phone: '+1 234 567 8905' },
];

const doctors = [
    { id: '1', name: 'Dr. Amanda Chen', specialization: 'General Medicine', licenseNumber: 'MD-12345' },
    { id: '2', name: 'Dr. James Rodriguez', specialization: 'Cardiology', licenseNumber: 'MD-12346' },
    { id: '3', name: 'Dr. Lisa Thompson', specialization: 'Pediatrics', licenseNumber: 'MD-12347' },
];

export const mockPrescriptions = [
    {
        id: '1',
        prescriptionNumber: 'RX-2024-001',
        patient: patients[0],
        doctor: doctors[0],
        medications: [
            { id: '1', name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '7 days', instructions: 'Take with food' },
            { id: '2', name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed', duration: '5 days', instructions: 'Max 3 times daily' },
        ],
        diagnosis: 'Upper respiratory tract infection',
        notes: 'Patient should rest and stay hydrated',
        status: 'pending',
        createdAt: new Date('2024-12-09T10:30:00'),
        updatedAt: new Date('2024-12-09T10:30:00'),
    },
    {
        id: '2',
        prescriptionNumber: 'RX-2024-002',
        patient: patients[1],
        doctor: doctors[1],
        medications: [
            { id: '3', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take in the morning' },
            { id: '4', name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', duration: '30 days' },
        ],
        diagnosis: 'Hypertension',
        status: 'dispensed',
        createdAt: new Date('2024-12-08T14:15:00'),
        updatedAt: new Date('2024-12-08T16:00:00'),
        dispensedAt: new Date('2024-12-08T16:00:00'),
    },
    {
        id: '3',
        prescriptionNumber: 'RX-2024-003',
        patient: patients[2],
        doctor: doctors[0],
        medications: [
            { id: '5', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days', instructions: 'Take with meals' },
        ],
        diagnosis: 'Type 2 Diabetes',
        notes: 'Monitor blood sugar levels regularly',
        status: 'dispensed',
        createdAt: new Date('2024-12-07T09:00:00'),
        updatedAt: new Date('2024-12-07T11:30:00'),
        dispensedAt: new Date('2024-12-07T11:30:00'),
    },
    {
        id: '4',
        prescriptionNumber: 'RX-2024-004',
        patient: patients[3],
        doctor: doctors[2],
        medications: [
            { id: '6', name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', duration: '14 days', instructions: 'Take before breakfast' },
        ],
        diagnosis: 'Gastroesophageal reflux disease',
        status: 'pending',
        createdAt: new Date('2024-12-09T08:45:00'),
        updatedAt: new Date('2024-12-09T08:45:00'),
    },
    {
        id: '5',
        prescriptionNumber: 'RX-2024-005',
        patient: patients[4],
        doctor: doctors[1],
        medications: [
            { id: '7', name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take at bedtime' },
            { id: '8', name: 'Metoprolol', dosage: '50mg', frequency: 'Twice daily', duration: '30 days' },
        ],
        diagnosis: 'Hyperlipidemia, Atrial fibrillation',
        notes: 'Schedule follow-up in 2 weeks',
        status: 'cancelled',
        createdAt: new Date('2024-12-06T13:20:00'),
        updatedAt: new Date('2024-12-06T15:00:00'),
    },
];

export const getPatients = () => patients;
export const getDoctors = () => doctors;