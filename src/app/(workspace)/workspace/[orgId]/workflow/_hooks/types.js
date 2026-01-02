export const OPD_WORKFLOW_STEPS = [
    { id: 'registration', name: 'Registration', description: 'Patient check-in and registration', icon: 'clipboard-list', estimatedTime: '5 min' },
    { id: 'triage', name: 'Triage', description: 'Vitals assessment and priority assignment', icon: 'activity', estimatedTime: '10 min' },
    { id: 'waiting', name: 'Waiting', description: 'In queue for consultation', icon: 'hourglass', estimatedTime: 'variable' },
    { id: 'consultation', name: 'Consultation', description: 'Doctor consultation and examination', icon: 'stethoscope', estimatedTime: '15-30 min' },
    { id: 'investigation', name: 'Investigation', description: 'Lab tests and diagnostic imaging', icon: 'test-tube', estimatedTime: '30-60 min' },
    { id: 'pharmacy', name: 'Pharmacy', description: 'Medication dispensing', icon: 'pill', estimatedTime: '10 min' },
    { id: 'follow-up', name: 'Follow-up', description: 'Schedule next appointment', icon: 'calendar-check', estimatedTime: '5 min' },
    { id: 'discharged', name: 'Discharged', description: 'Patient discharged from OPD', icon: 'check-circle-2' },
];

export const IPD_WORKFLOW_STEPS = [
    { id: 'admission-request', name: 'Admission Request', description: 'Request for inpatient admission', icon: 'file-input', estimatedTime: '15 min' },
    { id: 'bed-allocation', name: 'Bed Allocation', description: 'Room and bed assignment', icon: 'bed', estimatedTime: '10 min' },
    { id: 'admitted', name: 'Admitted', description: 'Patient formally admitted', icon: 'door-open', estimatedTime: '20 min' },
    { id: 'initial-assessment', name: 'Initial Assessment', description: 'Complete medical assessment', icon: 'clipboard-check', estimatedTime: '30 min' },
    { id: 'treatment', name: 'Treatment', description: 'Active treatment and care', icon: 'heart-pulse', estimatedTime: '50' },
    { id: 'daily-rounds', name: 'Daily Rounds', description: 'Regular doctor visits and monitoring', icon: 'repeat', estimatedTime: 'Daily' },
    { id: 'discharge-planning', name: 'Discharge Planning', description: 'Prepare for discharge', icon: 'list-checks', estimatedTime: '1-2 hrs' },
    { id: 'discharge-summary', name: 'Discharge Summary', description: 'Complete documentation', icon: 'file-text', estimatedTime: '30 min' },
    { id: 'clearance', name: 'Final Clearance', description: 'Billing and pharmacy clearance', icon: 'badge-check', estimatedTime: '20 min' },
    { id: 'discharged', name: 'Discharged', description: 'Patient discharged from IPD', icon: 'check-circle' },
];