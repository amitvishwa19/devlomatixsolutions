import { useState } from "react";
import { format } from "date-fns";
import {
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Phone,
    Video,
    Building2,
    ArrowUpDown,
    Bell,
    CheckCircle2,
    XCircle,
    Clock,
    Stethoscope,
    Accessibility
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomBadge } from "../../../../(misc)/_components/CustomBadge";

const typeIcons = {
    clinic: Building2,
    video: Video,
    phone: Phone,
};

const statusConfig = {
    scheduled: {
        label: "Scheduled",
        className: "bg-status-scheduled/10 text-status-scheduled border-status-scheduled/20"
    },
    pending: {
        label: "Pending",
        className: "bg-status-pending/10 text-status-pending border-status-pending/20"
    },
    completed: {
        label: "Completed",
        className: "bg-status-completed/10 text-status-completed border-status-completed/20"
    },
    cancelled: {
        label: "Cancelled",
        className: "bg-status-cancelled/10 text-status-cancelled border-status-cancelled/20"
    },
};

export function AppointmentTable({
    appointmentss,
    onView,
    onEdit,
    onDelete,
    onStatusChange,
    onSendReminder
}) {
    const appointments = []
    const [sortColumn, setSortColumn] = useState("date");
    const [sortDirection, setSortDirection] = useState("asc");

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    const sortedAppointments = [...appointments].sort((a, b) => {
        let aVal, bVal;

        switch (sortColumn) {
            case "date":
                aVal = new Date(a.date);
                bVal = new Date(b.date);
                break;
            case "patient":
                aVal = a.patient.displayName?.toLowerCase() || "";
                bVal = b.patient.displayName?.toLowerCase() || "";
                break;
            case "doctor":
                aVal = a.doctor.displayName?.toLowerCase() || "";
                bVal = b.doctor.displayName?.toLowerCase() || "";
                break;
            case "status":
                aVal = a.status || "";
                bVal = b.status || "";
                break;
            default:
                return 0;
        }

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
    });

    const SortableHeader = ({ column, children }) => (
        <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 hover:bg-transparent"
            onClick={() => handleSort(column)}
        >
            {children}
            <ArrowUpDown className={cn(
                "ml-2 h-3.5 w-3.5 transition-colors",
                sortColumn === column ? "text-primary" : "text-muted-foreground"
            )} />
        </Button>
    );

    return (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                        <TableHead className="w-[180px]">
                            <SortableHeader column="patient">Patient</SortableHeader>
                        </TableHead>
                        <TableHead className="w-[200px]">
                            <SortableHeader column="doctor">Doctor</SortableHeader>
                        </TableHead>
                        <TableHead className="w-[140px]">
                            <SortableHeader column="date">Date & Time</SortableHeader>
                        </TableHead>
                        <TableHead className="w-[100px]">Type</TableHead>
                        <TableHead className="w-[110px]">
                            <SortableHeader column="status">Status</SortableHeader>
                        </TableHead>
                        <TableHead className="w-[70px] text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedAppointments.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-32 text-center">
                                <p className="text-muted-foreground">No appointments found</p>
                            </TableCell>
                        </TableRow>
                    ) : (
                        sortedAppointments.map((appointment) => {
                            const TypeIcon = typeIcons[appointment.visitType] || Building2;
                            const status = statusConfig[appointment.status] || statusConfig.scheduled;

                            return (
                                <TableRow
                                    key={appointment.id}
                                    className="cursor-pointer hover:bg-secondary/30 transition-colors"
                                    onClick={() => onView(appointment)}
                                >
                                    <TableCell>

                                        <div className="flex flex-row items-center gap-2">
                                            <div>
                                                <Accessibility className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">
                                                    {appointment.patient.displayName}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {appointment.patient.email || "No email"}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-row items-center gap-2">
                                            <div>
                                                <Stethoscope className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">
                                                    Dr. {appointment.doctor.displayName}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {appointment.doctor.department || 'General Physician'}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">
                                                {appointment.date}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {appointment.time}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-secondary/80">
                                                <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                            </div>
                                            <span className="text-sm capitalize text-foreground">
                                                {appointment?.type?.type}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <CustomBadge
                                            variant="outline"
                                            status={appointment?.status}
                                            className={cn("font-medium border")}
                                        >
                                            {status.label}
                                        </CustomBadge>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(appointment); }}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(appointment); }}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSendReminder(appointment); }}>
                                                    <Bell className="mr-2 h-4 w-4" />
                                                    Send Reminder
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {appointment.status !== "completed" && (
                                                    <DropdownMenuItem
                                                        onClick={(e) => { e.stopPropagation(); onStatusChange(appointment.id, "completed"); }}
                                                    >
                                                        <CheckCircle2 className="mr-2 h-4 w-4 text-status-completed" />
                                                        Mark Complete
                                                    </DropdownMenuItem>
                                                )}
                                                {appointment.status !== "cancelled" && (
                                                    <DropdownMenuItem
                                                        onClick={(e) => { e.stopPropagation(); onStatusChange(appointment.id, "cancelled"); }}
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4 text-status-cancelled" />
                                                        Cancel
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={(e) => { e.stopPropagation(); onDelete(appointment.id); }}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

export default AppointmentTable;
