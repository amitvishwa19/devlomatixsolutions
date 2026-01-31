// Appointment types and statuses
export const APPOINTMENT_STATUSES = [
  { id: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
  { id: 'confirmed', label: 'Confirmed', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-primary/10 text-primary' },
  { id: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-destructive/10 text-destructive' },
  { id: 'no-show', label: 'No Show', color: 'bg-amber-100 text-amber-700' },
  { id: 'waitlisted', label: 'Waitlisted', color: 'bg-purple-100 text-purple-700' },
];

export const APPOINTMENT_TYPES = [
  { id: 'consultation', label: 'Consultation', icon: 'Stethoscope' },
  { id: 'follow-up', label: 'Follow-up', icon: 'RefreshCw' },
  { id: 'checkup', label: 'General Checkup', icon: 'ClipboardCheck' },
  { id: 'lab-test', label: 'Lab Test', icon: 'TestTube' },
  { id: 'procedure', label: 'Procedure', icon: 'Syringe' },
  { id: 'vaccination', label: 'Vaccination', icon: 'Shield' },
];

export const DEPARTMENTS = [
  { id: 'general', label: 'General Medicine' },
  { id: 'cardiology', label: 'Cardiology' },
  { id: 'orthopedics', label: 'Orthopedics' },
  { id: 'pediatrics', label: 'Pediatrics' },
  { id: 'dermatology', label: 'Dermatology' },
  { id: 'neurology', label: 'Neurology' },
  { id: 'gynecology', label: 'Gynecology' },
  { id: 'ophthalmology', label: 'Ophthalmology' },
];

export const DOCTORS = [
  { id: 'dr1', name: 'Dr. Priya Patel', department: 'general', specialization: 'General Medicine' },
  { id: 'dr2', name: 'Dr. Rajesh Kumar', department: 'cardiology', specialization: 'Cardiology' },
  { id: 'dr3', name: 'Dr. Sunita Rao', department: 'pediatrics', specialization: 'Pediatrics' },
  { id: 'dr4', name: 'Dr. Amit Sharma', department: 'orthopedics', specialization: 'Orthopedics' },
  { id: 'dr5', name: 'Dr. Meera Nair', department: 'dermatology', specialization: 'Dermatology' },
  { id: 'dr6', name: 'Dr. Vikram Singh', department: 'neurology', specialization: 'Neurology' },
];

export const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
];

// Recurring appointment patterns (for scheduling)
export const RECURRENCE_PATTERNS = [
  { id: 'none', label: 'Does not repeat' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'biweekly', label: 'Every 2 weeks' },
  { id: 'monthly', label: 'Monthly' },
];

// Doctor availability/working hours
export const DEFAULT_WORKING_HOURS = {
  monday: { enabled: true, start: '09:00 AM', end: '05:00 PM' },
  tuesday: { enabled: true, start: '09:00 AM', end: '05:00 PM' },
  wednesday: { enabled: true, start: '09:00 AM', end: '05:00 PM' },
  thursday: { enabled: true, start: '09:00 AM', end: '05:00 PM' },
  friday: { enabled: true, start: '09:00 AM', end: '05:00 PM' },
  saturday: { enabled: false, start: '09:00 AM', end: '01:00 PM' },
  sunday: { enabled: false, start: '', end: '' },
};

// Mock doctor schedules with blocked times
export const DOCTOR_SCHEDULES = {
  dr1: {
    workingHours: { ...DEFAULT_WORKING_HOURS },
    blockedSlots: [
      { date: new Date(), time: '12:00 PM', reason: 'Lunch break' },
      { date: new Date(), time: '12:30 PM', reason: 'Lunch break' },
    ],
  },
  dr2: {
    workingHours: { ...DEFAULT_WORKING_HOURS, saturday: { enabled: true, start: '10:00 AM', end: '02:00 PM' } },
    blockedSlots: [],
  },
  dr3: {
    workingHours: { ...DEFAULT_WORKING_HOURS },
    blockedSlots: [],
  },
  dr4: {
    workingHours: { ...DEFAULT_WORKING_HOURS },
    blockedSlots: [],
  },
  dr5: {
    workingHours: { ...DEFAULT_WORKING_HOURS, wednesday: { enabled: false, start: '', end: '' } },
    blockedSlots: [],
  },
  dr6: {
    workingHours: { ...DEFAULT_WORKING_HOURS },
    blockedSlots: [],
  },
};
