import { format, isToday, isTomorrow, isYesterday, isSameDay } from 'date-fns';

export const formatAppointmentDate = (date) => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'dd MMM yyyy');
};

export const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const filterAppointments = (appointments, filters) => {
  return appointments.filter((apt) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        apt.patientName.toLowerCase().includes(searchLower) ||
        apt.patientId.toLowerCase().includes(searchLower) ||
        apt.doctorName.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (apt.status !== filters.status) return false;
    }

    // Department filter
    if (filters.department && filters.department !== 'all') {
      if (apt.department !== filters.department) return false;
    }

    // Doctor filter
    if (filters.doctor && filters.doctor !== 'all') {
      if (apt.doctorId !== filters.doctor) return false;
    }

    // Date filter
    if (filters.date) {
      if (!isSameDay(apt.date, filters.date)) return false;
    }

    return true;
  });
};

export const calculateAppointmentStats = (appointments) => {
  const today = new Date();
  const todayAppointments = appointments.filter((apt) => isToday(apt.date));

  return {
    total: appointments.length,
    today: todayAppointments.length,
    scheduled: appointments.filter((apt) => apt.status === 'scheduled').length,
    confirmed: appointments.filter((apt) => apt.status === 'confirmed').length,
    inProgress: appointments.filter((apt) => apt.status === 'in-progress').length,
    completed: appointments.filter((apt) => apt.status === 'completed').length,
    cancelled: appointments.filter((apt) => apt.status === 'cancelled').length,
    noShow: appointments.filter((apt) => apt.status === 'no-show').length,
  };
};

export const groupAppointmentsByDate = (appointments) => {
  const grouped = {};
  appointments.forEach((apt) => {
    const dateKey = format(apt.date, 'yyyy-MM-dd');
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(apt);
  });
  return grouped;
};

export const sortAppointmentsByTime = (appointments) => {
  return [...appointments].sort((a, b) => {
    const timeA = a.time;
    const timeB = b.time;
    return timeA.localeCompare(timeB);
  });
};
