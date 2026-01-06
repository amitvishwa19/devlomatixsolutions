import {
    Calendar,
    Users,
    Stethoscope,
    Clock,
    TrendingUp,
    TrendingDown,
    ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { useAppointment } from "../../_provider/appointmentProvider";
import { CustomBadge } from "../../../(misc)/_components/CustomBadge";

const stats = [
    {
        title: "Total Appointments",
        value: 248,
        change: "+12%",
        trend: "up",
        icon: Calendar,
        gradient: "from-primary/20 to-primary/5",
        iconColor: "text-primary",
    },
    {
        title: "Active Patients",
        value: 1420,
        change: "+8%",
        trend: "up",
        icon: Users,
        gradient: "from-status-completed/20 to-status-completed/5",
        iconColor: "text-status-completed",
    },
    {
        title: "Doctors",
        value: 24,
        change: "+2",
        trend: "up",
        icon: Stethoscope,
        gradient: "from-status-scheduled/20 to-status-scheduled/5",
        iconColor: "text-status-scheduled",
    },
    {
        title: "Pending Today",
        value: 18,
        change: "-3",
        trend: "down",
        icon: Clock,
        gradient: "from-status-pending/20 to-status-pending/5",
        iconColor: "text-status-pending",
    },
];

const weeklyData = [
    { name: "Mon", appointments: 32, completed: 28 },
    { name: "Tue", appointments: 45, completed: 40 },
    { name: "Wed", appointments: 38, completed: 35 },
    { name: "Thu", appointments: 52, completed: 48 },
    { name: "Fri", appointments: 48, completed: 42 },
    { name: "Sat", appointments: 25, completed: 22 },
    { name: "Sun", appointments: 8, completed: 7 },
];

const statusData = [
    { name: "Completed", value: 145, color: "hsl(var(--status-completed))" },
    { name: "Scheduled", value: 68, color: "hsl(var(--status-scheduled))" },
    { name: "Pending", value: 25, color: "hsl(var(--status-pending))" },
    { name: "Cancelled", value: 10, color: "hsl(var(--status-cancelled))" },
];

const upcomingAppointments = [
    { id: 1, patient: "John Smith", doctor: "Dr. Sarah Johnson", time: "09:30 AM", type: "Consultation", status: "scheduled" },
    { id: 2, patient: "Jane Doe", doctor: "Dr. Michael Chen", time: "10:15 AM", type: "Follow-up", status: "pending" },
    { id: 3, patient: "Alex Johnson", doctor: "Dr. Emily Davis", time: "11:00 AM", type: "Checkup", status: "scheduled" },
    { id: 4, patient: "Maria Garcia", doctor: "Dr. Robert Wilson", time: "02:00 PM", type: "Consultation", status: "scheduled" },
    { id: 5, patient: "David Brown", doctor: "Dr. Lisa Anderson", time: "03:30 PM", type: "Emergency", status: "pending" },
];

const recentActivity = [
    { id: 1, action: "Appointment completed", patient: "Sarah Connor", doctor: "Dr. Emily Davis", time: "2 min ago" },
    { id: 2, action: "New appointment booked", patient: "Mike Johnson", doctor: "Dr. Sarah Johnson", time: "15 min ago" },
    { id: 3, action: "Appointment cancelled", patient: "Lisa Wong", doctor: "Dr. Michael Chen", time: "32 min ago" },
    { id: 4, action: "Reminder sent", patient: "Tom Hardy", doctor: "Dr. Robert Wilson", time: "1 hour ago" },
];

const statusConfig = {
    scheduled: { label: "Scheduled", className: "bg-blue-500/10 text-blue-500 border-blue-500/20s" },
    pending: { label: "Pending", className: "bg-teal-500/10 text-teal-500 border-teal-500/20" },
    completed: { label: "Completed", className: "bg-green-500/10 text-green-500 border-green-500/20" },
    cancelled: { label: "Cancelled", className: "bg-red-500/10 text-red-500 border-red-500/20" },
};




export function DashboardContent() {
    const { category, setCategory, appointments } = useAppointment()
    const today = new Date();

    return (
        <div>


            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2 animate-fade-in" >
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
                    return (
                        <div
                            key={stat.title}
                            className="stat-card group border rounded-lg p-2 px-4 bg-card hover:border-primary/30 transition-colors animate-fade-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                                    <p className="text-3xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                                </div>
                                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} transition-transform group-hover:scale-110`}>
                                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-1.5 text-xs">
                                <TrendIcon className={cn(
                                    "h-3.5 w-3.5",
                                    stat.trend === "up" ? "text-status-completed" : "text-status-cancelled"
                                )} />
                                <span className={cn(
                                    stat.trend === "up" ? "text-status-completed" : "text-status-cancelled"
                                )}>
                                    {stat.change}
                                </span>
                                <span className="text-muted-foreground">from last week</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-2 mb-2 animate-fade-in">
                {/* Weekly Appointments Chart */}
                <Card className="lg:col-span-2  border">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Weekly Appointments</CardTitle>
                        <CardDescription>Appointment trends for this week</CardDescription>
                    </CardHeader>
                    <CardContent >
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyData}>
                                    <defs>
                                        <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--status-completed))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--status-completed))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "0.75rem",
                                            boxShadow: "var(--shadow-md)"
                                        }}
                                        labelStyle={{ color: "hsl(var(--foreground))" }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="appointments"
                                        stroke="hsl(var(--primary))"
                                        fillOpacity={1}
                                        fill="url(#colorAppointments)"
                                        strokeWidth={2}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="completed"
                                        stroke="hsl(var(--status-completed))"
                                        fillOpacity={1}
                                        fill="url(#colorCompleted)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                {/* <Card className="glass-effect border">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Status Distribution</CardTitle>
                        <CardDescription>Appointment status breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "0.75rem"
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            {statusData.map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs text-muted-foreground">{item.name}</span>
                                    <span className="text-xs font-medium text-foreground ml-auto">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card> */}
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 animate-fade-in">
                {/* Today's Appointments */}
                <Card className=" border">
                    <CardHeader>
                        <div>
                            <CardTitle className="text-lg font-semibold">Today's Appointments</CardTitle>
                            <CardDescription>{format(today, "EEEE, MMMM d, yyyy")}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">


                            {appointments?.map((apt, index) => {
                                const status = statusConfig[apt.status];
                                return (
                                    <div
                                        key={apt.id}
                                        className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Clock className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{apt.patient?.displayName}</p>
                                                <p className="text-xs text-muted-foreground">Dr. {apt.doctor?.displayName} • {apt?.type?.type}</p>
                                            </div>

                                        </div>
                                        <div className="text-sm font-medium capitalize">
                                            {apt?.visitType}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-foreground">{apt.time}</span>
                                            <Badge variant="outline" className={cn("text-xs", status.className)}>
                                                {status.label}
                                            </Badge>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                        <CardDescription>Latest updates and changes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map((activity, index) => (
                                <div key={activity.id} className="flex items-start gap-3">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full mt-2 shrink-0",
                                        index === 0 ? "bg-primary animate-pulse" : "bg-muted-foreground/50"
                                    )} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-foreground font-medium">{activity.action}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {activity.patient} with {activity.doctor}
                                        </p>
                                    </div>
                                    <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default DashboardContent;
