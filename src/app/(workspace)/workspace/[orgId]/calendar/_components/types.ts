export interface Appointment {
  id: string;
  title: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show";
  type: "consultation" | "follow-up" | "procedure" | "emergency" | "checkup";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  department: string;
  specialty: string;
  avatar?: string;
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export type CalendarView = "month" | "week" | "day";

export interface AppointmentFilters {
  status?: string;
  type?: string;
  doctorId?: string;
  department?: string;
}
