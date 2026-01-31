import { formatDistanceToNow } from 'date-fns';

export const getTimeInStage = (date) => {
  return formatDistanceToNow(date, { addSuffix: false });
};

export const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const calculateStats = (opdPatients, ipdPatients) => {
  const allOpdPatients = Object.values(opdPatients).flat();
  const allIpdPatients = Object.values(ipdPatients).flat();
  const allPatients = [...allOpdPatients, ...allIpdPatients];

  return {
    totalActive: allPatients.length,
    opdPatients: allOpdPatients.length,
    ipdPatients: allIpdPatients.length,
    inProgress: allPatients.filter((p) => p.status === 'in-progress').length,
    dischargedToday: 0,
    critical: allPatients.filter((p) => p.status === 'critical' || p.priority === 'critical').length,
  };
};

export const filterPatients = (patients, searchQuery, statusFilter) => {
  return patients.filter((patient) => {
    const matchesSearch =
      searchQuery === '' ||
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || patient.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
};

export const generateMRN = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `MRN-${year}-${randomNum}`;
};
