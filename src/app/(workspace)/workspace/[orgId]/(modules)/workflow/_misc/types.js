// Workflow types and constants

export const OPD_STAGES = [
  { id: 'registration', name: 'Registration', icon: 'ClipboardList', estimatedTime: '5 min', color: 'workflow-registration' },
  { id: 'triage', name: 'Triage', icon: 'HeartPulse', estimatedTime: '10 min', color: 'workflow-triage' },
  { id: 'waiting', name: 'Waiting', icon: 'Clock', estimatedTime: 'variable', color: 'workflow-waiting' },
  { id: 'consultation', name: 'Consultation', icon: 'Stethoscope', estimatedTime: '15-30 min', color: 'workflow-consultation' },
  { id: 'investigation', name: 'Investigation', icon: 'TestTube', estimatedTime: '30-60 min', color: 'workflow-investigation' },
  { id: 'pharmacy', name: 'Pharmacy', icon: 'Pill', estimatedTime: '10 min', color: 'workflow-pharmacy' },
  { id: 'followup', name: 'Follow-up', icon: 'CalendarCheck', estimatedTime: '5 min', color: 'workflow-followup' },
];

export const IPD_STAGES = [
  { id: 'admission', name: 'Admission', icon: 'DoorOpen', estimatedTime: '30 min', color: 'workflow-registration' },
  { id: 'ward-assignment', name: 'Ward Assignment', icon: 'BedDouble', estimatedTime: '15 min', color: 'workflow-triage' },
  { id: 'treatment', name: 'Treatment', icon: 'Syringe', estimatedTime: 'varies', color: 'workflow-consultation' },
  { id: 'monitoring', name: 'Monitoring', icon: 'Activity', estimatedTime: 'ongoing', color: 'workflow-investigation' },
  { id: 'discharge-planning', name: 'Discharge Planning', icon: 'FileText', estimatedTime: '1-2 hours', color: 'workflow-pharmacy' },
  { id: 'discharge', name: 'Discharge', icon: 'LogOut', estimatedTime: '30 min', color: 'workflow-followup' },
];
