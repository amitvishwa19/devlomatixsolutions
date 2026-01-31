import { useState } from "react";
import {
    Plus,
    Calendar,
    Search,
    List,
    CalendarDays,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    Download,
    Filter
} from "lucide-react";
import { isToday, isYesterday, isTomorrow, isThisWeek, isThisMonth, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import NewAppointmentSheet from "../NewAppointmentSheet";
import AppointmentTable from "../AppointmentTable";
import AppointmentDetailSheet from "../AppointmentDetailSheet";
import DeleteConfirmDialog from "../DeleteConfirmDialog";
import CalendarView from "../CalendarView";
import { useAppointment } from "../../../_provider/appointmentProvider";

const dateFilterOptions = [
    { value: "all", label: "All Dates" },
    { value: "yesterday", label: "Yesterday" },
    { value: "today", label: "Today" },
    { value: "tomorrow", label: "Tomorrow" },
    { value: "thisWeek", label: "This Week" },
    { value: "thisMonth", label: "This Month" },
];

const mockAppointments = [
    {
        id: "1",
        doctorName: "Dr. Sarah Johnson",
        specialty: "Cardiologist",
        patientName: "John Smith",
        patientEmail: "john.smith@email.com",
        patientPhone: "+1 234 567 8901",
        date: "04 Jan 2026",
        time: "09:30 AM",
        duration: "30 min",
        type: "clinic",
        status: "scheduled",
        visitType: "consultation",
        notes: "Regular heart checkup. Patient has history of hypertension.",
        priority: "normal",
    },
    {
        id: "2",
        doctorName: "Dr. Michael Chen",
        specialty: "Neurologist",
        patientName: "Jane Doe",
        patientEmail: "jane.doe@email.com",
        patientPhone: "+1 234 567 8902",
        date: "05 Jan 2026",
        time: "10:15 AM",
        duration: "45 min",
        type: "video",
        status: "pending",
        visitType: "follow-up",
        notes: "",
        priority: "high",
    },
    {
        id: "3",
        doctorName: "Dr. Emily Davis",
        specialty: "Pediatrician",
        patientName: "Alex Johnson",
        patientEmail: "alex.johnson@email.com",
        patientPhone: "+1 234 567 8903",
        date: "03 Jan 2026",
        time: "02:00 PM",
        duration: "30 min",
        type: "phone",
        status: "completed",
        visitType: "routine",
        notes: "Annual wellness check completed successfully.",
        priority: "normal",
    },
    {
        id: "4",
        doctorName: "Dr. Robert Wilson",
        specialty: "Orthopedic",
        patientName: "Maria Garcia",
        patientEmail: "maria.garcia@email.com",
        patientPhone: "+1 234 567 8904",
        date: "06 Jan 2026",
        time: "11:00 AM",
        duration: "60 min",
        type: "clinic",
        status: "cancelled",
        visitType: "consultation",
        notes: "Patient cancelled due to emergency",
        priority: "normal",
    },
    {
        id: "5",
        doctorName: "Dr. Lisa Anderson",
        specialty: "Dermatologist",
        patientName: "David Brown",
        patientEmail: "david.brown@email.com",
        patientPhone: "+1 234 567 8905",
        date: "04 Jan 2026",
        time: "03:30 PM",
        duration: "30 min",
        type: "video",
        status: "scheduled",
        visitType: "consultation",
        notes: "Skin rash examination",
        priority: "normal",
    },
];

const statCards = [
    {
        key: "total",
        label: "Total Appointments",
        icon: Calendar,
        gradient: "from-primary/20 to-primary/5",
        iconColor: "text-primary",
    },
    {
        key: "scheduled",
        label: "Scheduled",
        icon: Clock,
        gradient: "from-status-scheduled/20 to-status-scheduled/5",
        iconColor: "text-status-scheduled",
    },
    {
        key: "completed",
        label: "Completed",
        icon: CheckCircle2,
        gradient: "from-status-completed/20 to-status-completed/5",
        iconColor: "text-status-completed",
    },
    {
        key: "pending",
        label: "Pending",
        icon: AlertCircle,
        gradient: "from-status-pending/20 to-status-pending/5",
        iconColor: "text-status-pending",
    },
];

export function AppointmentsContent() {
    const { category, setCategory, appointments, setAppointments } = useAppointment()
    const { toast } = useToast();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    //const [appointments, setAppointments] = useState(mockAppointments);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");
    const [viewMode, setViewMode] = useState("list");

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const getStatValue = (key) => {
        if (key === "total") return appointments?.length;
        return appointments?.filter((a) => a.status === key).length;
    };

    const handleSaveAppointment = (data) => {
        if (editingAppointment) {
            setAppointments(appointments.map(apt =>
                apt.id === editingAppointment.id
                    ? {
                        ...apt,
                        doctorName: `Dr. ${data.doctor}`,
                        patientName: data.patient,
                        date: data.date?.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                        time: data.time,
                        type: data.appointmentType,
                        visitType: data.visitType,
                        notes: data.notes,
                    }
                    : apt
            ));
            toast({
                title: "Appointment Updated",
                description: "Your appointment has been successfully updated.",
            });
            setEditingAppointment(null);
        } else {
            const newAppointment = {
                id: Date.now().toString(),
                doctorName: `Dr. ${data.doctor}`,
                specialty: "General",
                patientName: data.patient,
                patientEmail: "",
                patientPhone: "",
                date: data.date?.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                time: data.time,
                duration: "30 min",
                type: data.appointmentType,
                status: "scheduled",
                visitType: data.visitType,
                notes: data.notes,
                priority: "normal",
            };
            setAppointments([newAppointment, ...appointments]);
            toast({
                title: "Appointment Created",
                description: "New appointment has been scheduled successfully.",
            });
        }
    };

    const handleViewAppointment = (appointment) => {
        setSelectedAppointment(appointment);
        setIsDetailOpen(true);
    };

    const handleEditAppointment = (appointment) => {
        setEditingAppointment(appointment);
        setIsDetailOpen(false);
        setIsSheetOpen(true);
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = () => {
        setAppointments(appointments?.filter(apt => apt.id !== deleteId));
        toast({
            title: "Appointment Deleted",
            description: "The appointment has been successfully deleted.",
        });
        setIsDeleteOpen(false);
        setIsDetailOpen(false);
        setDeleteId(null);
    };

    const handleStatusChange = (id, newStatus) => {
        setAppointments(appointments?.map(apt =>
            apt.id === id ? { ...apt, status: newStatus } : apt
        ));
        toast({
            title: "Status Updated",
            description: `Appointment marked as ${newStatus}.`,
        });
        setIsDetailOpen(false);
    };

    const handleExportAppointments = () => {
        const csv = [
            ["Doctor", "Patient", "Date", "Time", "Type", "Status", "Visit Type", "Notes"],
            ...filteredAppointments.map(apt => [
                apt.doctorName,
                apt.patientName,
                apt.date,
                apt.time,
                apt.type,
                apt.status,
                apt.visitType,
                apt.notes
            ])
        ].map(row => row.join(",")).join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `appointments-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();

        toast({
            title: "Export Complete",
            description: "Appointments exported to CSV file.",
        });
    };

    const parseAppointmentDate = (dateStr) => {
        try {
            return parse(dateStr, "dd MMM yyyy", new Date());
        } catch {
            return null;
        }
    };

    const matchesDateFilter = (apt) => {
        if (dateFilter === "all") return true;
        const aptDate = parseAppointmentDate(apt.date);
        if (!aptDate) return false;

        switch (dateFilter) {
            case "yesterday":
                return isYesterday(aptDate);
            case "today":
                return isToday(aptDate);
            case "tomorrow":
                return isTomorrow(aptDate);
            case "thisWeek":
                return isThisWeek(aptDate, { weekStartsOn: 1 });
            case "thisMonth":
                return isThisMonth(aptDate);
            default:
                return true;
        }
    };

    const filteredAppointments = appointments?.filter((apt) => {
        const matchesSearch =
            apt?.doctor?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt?.patient?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.doctor?.department?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
        const matchesDate = matchesDateFilter(apt);
        return matchesSearch && matchesStatus && matchesDate;
    });

    const appointmentToDelete = appointments?.find(apt => apt.id === deleteId);
    const todayAppointments = appointments?.filter(apt => apt.date === "04 Jan 2026").length;

    return (
        <div>
            {/* Header */}
            {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleExportAppointments}
                        className="border-border/60 hover:border-primary/40 hover:bg-primary/5"
                    >
                        <Download className="h-4 w-4" />
                    </Button>

                </div>
            </div> */}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 animate-fade-in">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    const value = getStatValue(stat.key);
                    return (
                        <div
                            key={stat.key}
                            className="bg-card border px-4 py-2 group hover:border-primary/30 transition-colors  rounded-lg"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                                    <p className="text-3xl font-bold text-foreground">{value}</p>
                                </div>
                                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} transition-transform group-hover:scale-110`}>
                                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                                </div>
                            </div>
                            {stat.key === "total" && (
                                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <TrendingUp className="h-3.5 w-3.5 text-status-completed" />
                                    <span>+12% from last week</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Search, Filter and View Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by doctor, patient, or specialty..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-11 bg-secondary/80 border-border/60 focus:border-primary/50 rounded-xl"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setViewMode("list")}
                        className={`h-11 w-11 rounded-xl ${viewMode === "list" ? "bg-primary shadow-glow-sm" : "border-border/60"}`}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "calendar" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setViewMode("calendar")}
                        className={`h-11 w-11 rounded-xl ${viewMode === "calendar" ? "bg-primary shadow-glow-sm" : "border-border/60"}`}
                    >
                        <CalendarDays className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Date Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
                    <Filter className="h-4 w-4" />
                    <span>Date:</span>
                </div>
                {dateFilterOptions.map((option) => (
                    <Button
                        key={option.value}
                        variant={dateFilter === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDateFilter(option.value)}
                        className={`rounded-lg text-sm ${dateFilter === option.value
                            ? "bg-primary text-primary-foreground shadow-glow-sm"
                            : "border-border/60 hover:border-primary/40 hover:bg-primary/5"
                            }`}
                    >
                        {option.label}
                    </Button>
                ))}
            </div>

            {/* Status Tabs */}
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-8">
                <TabsList className="bg-secondary/60 border border-border/60 p-1.5 rounded-xl h-auto flex-wrap">
                    {[
                        { value: "all", label: "All" },
                        { value: "scheduled", label: "Scheduled" },
                        { value: "pending", label: "Pending" },
                        { value: "completed", label: "Completed" },
                        { value: "cancelled", label: "Cancelled" },
                    ].map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-sm transition-all"
                        >
                            {tab.label}
                            <span className="ml-2 text-xs opacity-70">
                                ({tab.value === "all" ? appointments?.length : appointments?.filter(a => a.status === tab.value).length})
                            </span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* View Content */}
            {viewMode === "calendar" ? (
                <CalendarView
                    appointments={filteredAppointments}
                    onSelectAppointment={handleViewAppointment}
                />
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground">
                            {statusFilter === "all"
                                ? "All Appointments"
                                : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Appointments`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {filteredAppointments?.length} {filteredAppointments?.length === 1 ? "result" : "results"}
                        </p>
                    </div>

                    <AppointmentTable
                        appointments={filteredAppointments}
                        onView={handleViewAppointment}
                        onEdit={handleEditAppointment}
                        onDelete={handleDeleteClick}
                        onStatusChange={handleStatusChange}
                    />
                </div>
            )}

            {/* Sheets and Dialogs */}
            <NewAppointmentSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                onSave={handleSaveAppointment}
                editingAppointment={editingAppointment}
                existingAppointments={appointments}
            />

            <AppointmentDetailSheet
                appointment={selectedAppointment}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                onEdit={handleEditAppointment}
                onDelete={handleDeleteClick}
                onStatusChange={handleStatusChange}
            />

            <DeleteConfirmDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={handleConfirmDelete}
                appointmentName={appointmentToDelete ? `${appointmentToDelete?.patientName}'s appointment` : ""}
            />
        </div>
    );
}

export default AppointmentsContent;
