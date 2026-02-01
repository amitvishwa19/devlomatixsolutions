import { PRESCRIPTION_STATUSES, DOSAGE_FREQUENCIES, DURATION_OPTIONS, MEDICINE_ROUTES } from './types';

export function getStatusConfig(statusId) {
  return PRESCRIPTION_STATUSES.find(s => s.id === statusId) || PRESCRIPTION_STATUSES[0];
}

export function getFrequencyLabel(frequencyId) {
  const freq = DOSAGE_FREQUENCIES.find(f => f.id === frequencyId);
  return freq?.label || frequencyId;
}

export function getFrequencyShortLabel(frequencyId) {
  const freq = DOSAGE_FREQUENCIES.find(f => f.id === frequencyId);
  return freq?.shortLabel || frequencyId;
}

export function getDurationLabel(durationId) {
  const dur = DURATION_OPTIONS.find(d => d.id === durationId);
  return dur?.label || durationId;
}

export function getRouteLabel(routeId) {
  const route = MEDICINE_ROUTES.find(r => r.id === routeId);
  return route?.label || routeId;
}

export function filterPrescriptions(prescriptions, { search, status, doctor }) {
  return prescriptions.filter(rx => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesPatient = rx.patientName.toLowerCase().includes(searchLower);
      const matchesMrn = rx.patientMrn.toLowerCase().includes(searchLower);
      const matchesDoctor = rx.doctor.toLowerCase().includes(searchLower);
      const matchesDiagnosis = rx.diagnosis.toLowerCase().includes(searchLower);
      const matchesMedicine = rx.medicines.some(m => 
        m.name.toLowerCase().includes(searchLower)
      );
      
      if (!matchesPatient && !matchesMrn && !matchesDoctor && !matchesDiagnosis && !matchesMedicine) {
        return false;
      }
    }

    // Status filter
    if (status && status !== 'all' && rx.status !== status) {
      return false;
    }

    // Doctor filter
    if (doctor && doctor !== 'all' && rx.doctor !== doctor) {
      return false;
    }

    return true;
  });
}

export function calculateStats(prescriptions) {
  const total = prescriptions.length;
  const active = prescriptions.filter(rx => rx.status === 'active').length;
  const completed = prescriptions.filter(rx => rx.status === 'completed').length;
  const onHold = prescriptions.filter(rx => rx.status === 'on-hold').length;
  const discontinued = prescriptions.filter(rx => rx.status === 'discontinued').length;
  
  return { total, active, completed, onHold, discontinued };
}

export function generatePrescriptionId() {
  return `rx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
