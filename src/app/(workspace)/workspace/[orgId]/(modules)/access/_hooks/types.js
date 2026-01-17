export const OPD_WORKFLOW_STEPS = [
    { id: 'registration', name: 'Registration', description: 'Patient check-in and registration', icon: 'ClipboardList', estimatedTime: '5 min' },
    { id: 'triage', name: 'Triage', description: 'Vitals assessment and priority assignment', icon: 'Activity', estimatedTime: '10 min' },
    { id: 'waiting', name: 'Waiting', description: 'In queue for consultation', icon: 'Clock', estimatedTime: 'Variable' },
    { id: 'consultation', name: 'Consultation', description: 'Doctor consultation and examination', icon: 'Stethoscope', estimatedTime: '15-30 min' },
    { id: 'investigation', name: 'Investigation', description: 'Lab tests and diagnostic imaging', icon: 'TestTube', estimatedTime: '30-60 min' },
    { id: 'pharmacy', name: 'Pharmacy', description: 'Medication dispensing', icon: 'Pill', estimatedTime: '10 min' },
    { id: 'follow-up', name: 'Follow-up', description: 'Schedule next appointment', icon: 'CalendarCheck', estimatedTime: '5 min' },
    { id: 'discharged', name: 'Discharged', description: 'Patient discharged from OPD', icon: 'CheckCircle2' },
];

export const IPD_WORKFLOW_STEPS = [
    { id: 'admission-request', name: 'Admission Request', description: 'Request for inpatient admission', icon: 'FileInput', estimatedTime: '15 min' },
    { id: 'bed-allocation', name: 'Bed Allocation', description: 'Room and bed assignment', icon: 'Bed', estimatedTime: '10 min' },
    { id: 'admitted', name: 'Admitted', description: 'Patient formally admitted', icon: 'DoorOpen', estimatedTime: '20 min' },
    { id: 'initial-assessment', name: 'Initial Assessment', description: 'Complete medical assessment', icon: 'ClipboardCheck', estimatedTime: '30 min' },
    { id: 'treatment', name: 'Treatment', description: 'Active treatment and care', icon: 'HeartPulse', estimatedTime: 'Ongoing' },
    { id: 'daily-rounds', name: 'Daily Rounds', description: 'Regular doctor visits and monitoring', icon: 'Repeat', estimatedTime: 'Daily' },
    { id: 'discharge-planning', name: 'Discharge Planning', description: 'Prepare for discharge', icon: 'ListChecks', estimatedTime: '1-2 hrs' },
    { id: 'discharge-summary', name: 'Discharge Summary', description: 'Complete documentation', icon: 'FileText', estimatedTime: '30 min' },
    { id: 'clearance', name: 'Final Clearance', description: 'Billing and pharmacy clearance', icon: 'BadgeCheck', estimatedTime: '20 min' },
    { id: 'discharged', name: 'Discharged', description: 'Patient discharged from IPD', icon: 'CheckCircle2' },
];