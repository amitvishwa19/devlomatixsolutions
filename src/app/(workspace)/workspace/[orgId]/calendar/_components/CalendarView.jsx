import { useState, useCallback, useMemo } from 'react';
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Plus } from 'lucide-react';
import { CalendarHeader } from './CalendarHeader';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { AppointmentSidebar } from './AppointmentSidebar';
import { AppointmentDetailsModal } from './AppointmentDetailsModal';
import { AppointmentFormModal } from './AppointmentFormModal';
import { SearchFilters, FilterState } from './SearchFilters';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { mockAppointments } from '../_data/mockData';



export function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('month');
    const [appointments, setAppointments] = useState(mockAppointments);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);

    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        doctorId: 'all',
        dateFrom: undefined,
        dateTo: undefined,
    });

    // Filter appointments
    const filteredAppointments = useMemo(() => {
        return appointments.filter(apt => {
            // Search filter
            if (filters.search) {
                const search = filters.search.toLowerCase();
                const matchesSearch =
                    apt.patient.name.toLowerCase().includes(search) ||
                    apt.doctor.name.toLowerCase().includes(search) ||
                    apt.type.toLowerCase().includes(search);
                if (!matchesSearch) return false;
            }

            // Status filter
            if (filters.status !== 'all' && apt.status !== filters.status) {
                return false;
            }

            // Doctor filter
            if (filters.doctorId !== 'all' && apt.doctor.id !== filters.doctorId) {
                return false;
            }

            // Date range filter
            if (filters.dateFrom || filters.dateTo) {
                const aptDate = startOfDay(apt.date);
                if (filters.dateFrom && aptDate < startOfDay(filters.dateFrom)) {
                    return false;
                }
                if (filters.dateTo && aptDate > endOfDay(filters.dateTo)) {
                    return false;
                }
            }

            return true;
        });
    }, [appointments, filters]);

    const handlePrevious = useCallback(() => {
        switch (viewMode) {
            case 'month':
                setCurrentDate(prev => subMonths(prev, 1));
                break;
            case 'week':
                setCurrentDate(prev => subWeeks(prev, 1));
                break;
            case 'day':
                setCurrentDate(prev => subDays(prev, 1));
                break;
        }
    }, [viewMode]);

    const handleNext = useCallback(() => {
        switch (viewMode) {
            case 'month':
                setCurrentDate(prev => addMonths(prev, 1));
                break;
            case 'week':
                setCurrentDate(prev => addWeeks(prev, 1));
                break;
            case 'day':
                setCurrentDate(prev => addDays(prev, 1));
                break;
        }
    }, [viewMode]);

    const handleToday = useCallback(() => {
        setCurrentDate(new Date());
    }, []);

    const handleAppointmentClick = useCallback((appointment) => {
        setSelectedAppointment(appointment);
        setIsDetailsModalOpen(true);
    }, []);

    const handleDayClick = useCallback((date) => {
        setCurrentDate(date);
        setViewMode('day');
    }, []);

    const handleDelegate = useCallback((appointmentId, newDoctor) => {
        setAppointments(prev => prev.map(apt => {
            if (apt.id === appointmentId) {
                return {
                    ...apt,
                    delegatedFrom: apt.doctor,
                    doctor: newDoctor,
                    status: 'delegated',
                };
            }
            return apt;
        }));
        setIsDetailsModalOpen(false);
        toast.success(`Appointment delegated to ${newDoctor.name}`);
    }, []);

    const handleStatusChange = useCallback((appointmentId, status) => {
        setAppointments(prev => prev.map(apt => {
            if (apt.id === appointmentId) {
                return { ...apt, status };
            }
            return apt;
        }));
        setIsDetailsModalOpen(false);
        toast.success(`Appointment ${status}`);
    }, []);

    const handleAddAppointment = useCallback(() => {
        setEditingAppointment(null);
        setIsFormModalOpen(true);
    }, []);

    const handleEditAppointment = useCallback((appointment) => {
        setEditingAppointment(appointment);
        setIsDetailsModalOpen(false);
        setIsFormModalOpen(true);
    }, []);

    const handleSaveAppointment = useCallback((appointmentData) => {
        if (editingAppointment) {
            // Update existing appointment
            setAppointments(prev => prev.map(apt =>
                apt.id === editingAppointment.id
                    ? { ...appointmentData, id: apt.id }
                    : apt
            ));
            toast.success('Appointment updated');
        } else {
            // Create new appointment
            const newAppointment = {
                ...appointmentData,
                id: `apt-${Date.now()}`,
            };
            setAppointments(prev => [...prev, newAppointment]);
            toast.success('Appointment created');
        }
        setIsFormModalOpen(false);
        setEditingAppointment(null);
    }, [editingAppointment]);

    const renderView = () => {
        switch (viewMode) {
            case 'week':
                return (
                    <WeekView
                        currentDate={currentDate}
                        appointments={filteredAppointments}
                        onAppointmentClick={handleAppointmentClick}
                    />
                );
            case 'day':
                return (
                    <DayView
                        currentDate={currentDate}
                        appointments={filteredAppointments}
                        onAppointmentClick={handleAppointmentClick}
                    />
                );
            case 'month':
            default:
                return (
                    <MonthView
                        currentDate={currentDate}
                        appointments={filteredAppointments}
                        onAppointmentClick={handleAppointmentClick}
                        onDayClick={handleDayClick}
                    />
                );
        }
    };

    return (
        <div className="">
            <div className="flex flex-col gap-2">
                <CalendarHeader
                    currentDate={currentDate}
                    viewMode={viewMode}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onToday={handleToday}
                    onViewChange={setViewMode}
                />

                {/* Search and Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-2 rounded-md bg-card border">
                    <SearchFilters filters={filters} onFiltersChange={setFilters} />
                    {/* <Button onClick={handleAddAppointment} className="gap-2" variant='save' size='sm'>
                        <Plus className="h-4 w-4" />
                        New Appointment
                    </Button> */}
                </div>

                <div className="flex gap-6">
                    <div className="flex-1">
                        {renderView()}
                    </div>
                    <AppointmentSidebar
                        appointments={filteredAppointments}
                        onAppointmentClick={handleAppointmentClick}
                    />
                </div>
            </div>

            <AppointmentDetailsModal
                appointment={selectedAppointment}
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                onDelegate={handleDelegate}
                onStatusChange={handleStatusChange}
                onEdit={handleEditAppointment}
            />

            <AppointmentFormModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setEditingAppointment(null);
                }}
                onSave={handleSaveAppointment}
                appointment={editingAppointment}
            />
        </div>
    );
}
