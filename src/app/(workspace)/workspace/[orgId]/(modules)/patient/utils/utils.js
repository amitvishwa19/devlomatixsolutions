import { format, isToday, isYesterday, isTomorrow, differenceInYears } from 'date-fns';

// Format date for display
export const formatPatientDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'dd MMM yyyy');
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0;
  return differenceInYears(new Date(), new Date(dateOfBirth));
};

// Filter patients based on criteria
export const filterPatients = (patients, filters) => {
  return patients.filter((patient) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        patient.fullName?.toLowerCase().includes(searchLower) ||
        patient.mrn?.toLowerCase().includes(searchLower) ||
        patient.phone?.toLowerCase().includes(searchLower) ||
        patient.email?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (patient.status !== filters.status) return false;
    }

    // Gender filter
    if (filters.gender && filters.gender !== 'all') {
      if (patient.gender !== filters.gender) return false;
    }

    // Blood group filter
    if (filters.bloodGroup && filters.bloodGroup !== 'all') {
      if (patient.bloodGroup !== filters.bloodGroup) return false;
    }

    return true;
  });
};

// Calculate patient stats
export const calculatePatientStats = (patients) => {
  const total = patients.length;
  const active = patients.filter((p) => p.status === 'active').length;
  const admitted = patients.filter((p) => p.status === 'admitted').length;
  const critical = patients.filter((p) => p.status === 'critical').length;
  const discharged = patients.filter((p) => p.status === 'discharged').length;
  const withAllergies = patients.filter((p) => p.allergies?.length > 0).length;

  return {
    total,
    active,
    admitted,
    critical,
    discharged,
    withAllergies,
  };
};

// Sort patients
export const sortPatients = (patients, sortBy = 'name', order = 'asc') => {
  return [...patients].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.fullName.localeCompare(b.fullName);
        break;
      case 'mrn':
        comparison = a.mrn.localeCompare(b.mrn);
        break;
      case 'lastVisit':
        comparison = new Date(b.lastVisit) - new Date(a.lastVisit);
        break;
      case 'age':
        comparison = a.age - b.age;
        break;
      default:
        comparison = 0;
    }
    return order === 'asc' ? comparison : -comparison;
  });
};

// Get status color class
export const getStatusColor = (status) => {
  const colors = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-muted text-muted-foreground',
    critical: 'bg-destructive/10 text-destructive',
    admitted: 'bg-blue-100 text-blue-700',
    discharged: 'bg-amber-100 text-amber-700',
  };
  return colors[status] || colors.active;
};
