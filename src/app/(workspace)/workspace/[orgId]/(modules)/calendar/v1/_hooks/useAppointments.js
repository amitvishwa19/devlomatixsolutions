import { useState, useMemo } from "react";
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from "date-fns";

// Mock data for doctors with Indian names
const mockDoctors = [
  { id: "d1", name: "Dr. Anil Kapoor", department: "Cardiology", specialty: "Heart Surgery" },
  { id: "d2", name: "Dr. Suresh Menon", department: "Neurology", specialty: "Brain Surgery" },
  { id: "d3", name: "Dr. Nandini Iyer", department: "Pediatrics", specialty: "Child Care" },
  { id: "d4", name: "Dr. Ramesh Nair", department: "Orthopedics", specialty: "Joint Replacement" },
  { id: "d5", name: "Dr. Lakshmi Venkatesh", department: "Dermatology", specialty: "Skin Care" },
];

// Mock data for patients with Indian names
const mockPatients = [
  { id: "p1", name: "Rohit Sharma", email: "rohit.sharma@gmail.com", phone: "98765-43210" },
  { id: "p2", name: "Priyanka Chopra", email: "priyanka.c@gmail.com", phone: "98765-43211" },
  { id: "p3", name: "Virat Kohli", email: "virat.k@gmail.com", phone: "98765-43212" },
  { id: "p4", name: "Deepika Padukone", email: "deepika.p@gmail.com", phone: "98765-43213" },
  { id: "p5", name: "Ranbir Kapoor", email: "ranbir.k@gmail.com", phone: "98765-43214" },
];

// Mock appointments with Indian names
const generateMockAppointments = () => {
  const today = new Date();
  return [
    {
      id: "1",
      title: "Heart Checkup",
      patientId: "p1",
      patientName: "Rohit Sharma",
      doctorId: "d1",
      doctorName: "Dr. Anil Kapoor",
      department: "Cardiology",
      date: today,
      startTime: "09:00",
      endTime: "09:30",
      status: "confirmed",
      type: "checkup",
      notes: "Regular heart checkup",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      title: "Neurology Consultation",
      patientId: "p2",
      patientName: "Priyanka Chopra",
      doctorId: "d2",
      doctorName: "Dr. Suresh Menon",
      department: "Neurology",
      date: today,
      startTime: "10:00",
      endTime: "10:45",
      status: "scheduled",
      type: "consultation",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      title: "Follow-up Visit",
      patientId: "p3",
      patientName: "Virat Kohli",
      doctorId: "d3",
      doctorName: "Dr. Nandini Iyer",
      department: "Pediatrics",
      date: addDays(today, 1),
      startTime: "14:00",
      endTime: "14:30",
      status: "scheduled",
      type: "follow-up",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "4",
      title: "Knee Surgery Consultation",
      patientId: "p4",
      patientName: "Deepika Padukone",
      doctorId: "d4",
      doctorName: "Dr. Ramesh Nair",
      department: "Orthopedics",
      date: addDays(today, 2),
      startTime: "11:00",
      endTime: "12:00",
      status: "confirmed",
      type: "procedure",
      notes: "Pre-surgery consultation",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "5",
      title: "Skin Examination",
      patientId: "p5",
      patientName: "Ranbir Kapoor",
      doctorId: "d5",
      doctorName: "Dr. Lakshmi Venkatesh",
      department: "Dermatology",
      date: addDays(today, -1),
      startTime: "15:00",
      endTime: "15:30",
      status: "completed",
      type: "checkup",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "6",
      title: "Emergency Consultation",
      patientId: "p1",
      patientName: "Rohit Sharma",
      doctorId: "d2",
      doctorName: "Dr. Suresh Menon",
      department: "Neurology",
      date: addDays(today, 3),
      startTime: "08:00",
      endTime: "09:00",
      status: "scheduled",
      type: "emergency",
      notes: "Urgent neurological assessment",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
};

export function useAppointments() {
  const [appointments, setAppointments] = useState(generateMockAppointments());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState("month");
  const [filters, setFilters] = useState({});
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Get days for calendar based on view
  const calendarDays = useMemo(() => {
    if (calendarView === "month") {
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    } else if (calendarView === "week") {
      const weekStart = startOfWeek(selectedDate);
      const weekEnd = endOfWeek(selectedDate);
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    } else {
      return [selectedDate];
    }
  }, [selectedDate, calendarView]);

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (filters.status && apt.status !== filters.status) return false;
      if (filters.type && apt.type !== filters.type) return false;
      if (filters.doctorId && apt.doctorId !== filters.doctorId) return false;
      if (filters.department && apt.department !== filters.department) return false;
      return true;
    });
  }, [appointments, filters]);

  // Get appointments for a specific day
  const getAppointmentsForDay = (date) => {
    return filteredAppointments.filter((apt) => isSameDay(new Date(apt.date), date));
  };

  // Today's appointments
  const todayAppointments = useMemo(() => {
    return getAppointmentsForDay(new Date());
  }, [filteredAppointments]);

  // Upcoming appointments (next 7 days)
  const upcomingAppointments = useMemo(() => {
    const today = new Date();
    const weekLater = addDays(today, 7);
    return filteredAppointments
      .filter((apt) => {
        const aptDate = new Date(apt.date);
        return aptDate >= today && aptDate <= weekLater && apt.status !== "cancelled" && apt.status !== "completed";
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        return a.startTime.localeCompare(b.startTime);
      });
  }, [filteredAppointments]);

  // Navigation
  const navigatePrevious = () => {
    if (calendarView === "month") {
      setSelectedDate(subMonths(selectedDate, 1));
    } else if (calendarView === "week") {
      setSelectedDate(subWeeks(selectedDate, 1));
    } else {
      setSelectedDate(subDays(selectedDate, 1));
    }
  };

  const navigateNext = () => {
    if (calendarView === "month") {
      setSelectedDate(addMonths(selectedDate, 1));
    } else if (calendarView === "week") {
      setSelectedDate(addWeeks(selectedDate, 1));
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  const navigateToday = () => {
    setSelectedDate(new Date());
  };

  // CRUD operations
  const createAppointment = (data) => {
    const newAppointment = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setAppointments((prev) => [...prev, newAppointment]);
    setCreateDialogOpen(false);
  };

  const updateAppointment = (id, data) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id ? { ...apt, ...data, updatedAt: new Date() } : apt
      )
    );
    setEditDialogOpen(false);
    setSelectedAppointment(null);
  };

  const deleteAppointment = (id) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== id));
    setViewDialogOpen(false);
    setSelectedAppointment(null);
  };

  const cancelAppointment = (id) => {
    updateAppointment(id, { status: "cancelled" });
  };

  const confirmAppointment = (id) => {
    updateAppointment(id, { status: "confirmed" });
  };

  // View/Edit handlers
  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setViewDialogOpen(true);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setEditDialogOpen(true);
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    if (calendarView === "month") {
      setCalendarView("day");
    }
  };

  return {
    // Data
    appointments: filteredAppointments,
    calendarDays,
    selectedDate,
    calendarView,
    filters,
    doctors: mockDoctors,
    patients: mockPatients,
    todayAppointments,
    upcomingAppointments,
    selectedAppointment,

    // Setters
    setSelectedDate,
    setCalendarView,
    setFilters,

    // Dialog states
    createDialogOpen,
    setCreateDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    viewDialogOpen,
    setViewDialogOpen,

    // Navigation
    navigatePrevious,
    navigateNext,
    navigateToday,

    // CRUD operations
    createAppointment,
    updateAppointment,
    deleteAppointment,
    cancelAppointment,
    confirmAppointment,

    // Handlers
    getAppointmentsForDay,
    handleViewAppointment,
    handleEditAppointment,
    handleDayClick,
  };
}
