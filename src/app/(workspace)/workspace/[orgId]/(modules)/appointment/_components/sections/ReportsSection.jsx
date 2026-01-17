import { useState } from "react";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Calendar,
    Activity,
    Download,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    BarChart,
    Bar,
    LineChart,
    Line,
    Legend,
} from "recharts";

const monthlyData = [
    { month: "Jan", appointments: 248, completed: 210, cancelled: 18, revenue: 24800 },
    { month: "Feb", appointments: 312, completed: 285, cancelled: 12, revenue: 31200 },
    { month: "Mar", appointments: 285, completed: 252, cancelled: 15, revenue: 28500 },
    { month: "Apr", appointments: 320, completed: 298, cancelled: 10, revenue: 32000 },
    { month: "May", appointments: 356, completed: 320, cancelled: 14, revenue: 35600 },
    { month: "Jun", appointments: 298, completed: 265, cancelled: 18, revenue: 29800 },
    { month: "Jul", appointments: 378, completed: 345, cancelled: 12, revenue: 37800 },
    { month: "Aug", appointments: 342, completed: 310, cancelled: 16, revenue: 34200 },
    { month: "Sep", appointments: 395, completed: 368, cancelled: 11, revenue: 39500 },
    { month: "Oct", appointments: 412, completed: 385, cancelled: 14, revenue: 41200 },
    { month: "Nov", appointments: 368, completed: 340, cancelled: 13, revenue: 36800 },
    { month: "Dec", appointments: 425, completed: 398, cancelled: 15, revenue: 42500 },
];

const specialtyData = [
    { specialty: "Cardiology", appointments: 156, percentage: 18 },
    { specialty: "Neurology", appointments: 98, percentage: 11 },
    { specialty: "Pediatrics", appointments: 234, percentage: 27 },
    { specialty: "Orthopedics", appointments: 87, percentage: 10 },
    { specialty: "Dermatology", appointments: 145, percentage: 17 },
    { specialty: "General", appointments: 148, percentage: 17 },
];

const statusDistribution = [
    { name: "Completed", value: 3476, color: "hsl(var(--status-completed))" },
    { name: "Scheduled", value: 248, color: "hsl(var(--status-scheduled))" },
    { name: "Pending", value: 85, color: "hsl(var(--status-pending))" },
    { name: "Cancelled", value: 158, color: "hsl(var(--status-cancelled))" },
];

const topDoctors = [
    { name: "Dr. Sarah Johnson", specialty: "Cardiologist", appointments: 156, rating: 4.9 },
    { name: "Dr. Emily Davis", specialty: "Pediatrician", appointments: 234, rating: 4.8 },
    { name: "Dr. James Miller", specialty: "General Physician", appointments: 312, rating: 4.7 },
    { name: "Dr. Lisa Anderson", specialty: "Dermatologist", appointments: 145, rating: 4.9 },
    { name: "Dr. Michael Chen", specialty: "Neurologist", appointments: 98, rating: 4.6 },
];

const dailyTrend = Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), "MMM d"),
    appointments: Math.floor(Math.random() * 30) + 15,
    completed: Math.floor(Math.random() * 25) + 12,
}));

const summaryStats = [
    { title: "Total Appointments", value: "3,967", change: "+12.5%", trend: "up", icon: Calendar },
    { title: "Completion Rate", value: "93.2%", change: "+2.1%", trend: "up", icon: Activity },
    { title: "Avg. Daily", value: "32", change: "+5", trend: "up", icon: BarChart3 },
    { title: "Cancellation Rate", value: "4.0%", change: "-0.8%", trend: "down", icon: TrendingDown },
];

export function ReportsContent() {
    const [timeRange, setTimeRange] = useState("year");
    const [reportType, setReportType] = useState("overview");

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">

                <div className="flex items-center gap-3">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[140px] bg-secondary/80 border-border/60">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="quarter">This Quarter</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="border-border/60 hover:border-primary/40">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {summaryStats.map((stat) => {
                    const Icon = stat.icon;
                    const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
                    return (
                        <div key={stat.title} className="stat-card">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-primary/10">
                                    <Icon className="h-5 w-5 text-primary" />
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
                                <span className="text-muted-foreground">vs last period</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Report Tabs */}
            <Tabs value={reportType} onValueChange={setReportType} className="space-y-6">
                <TabsList className="bg-secondary/60 border border-border/60 p-1.5 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg px-4 py-2">Overview</TabsTrigger>
                    <TabsTrigger value="appointments" className="rounded-lg px-4 py-2">Appointments</TabsTrigger>
                    <TabsTrigger value="doctors" className="rounded-lg px-4 py-2">Doctors</TabsTrigger>
                    <TabsTrigger value="trends" className="rounded-lg px-4 py-2">Trends</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Monthly Appointments Chart */}
                        <Card className="lg:col-span-2 glass-effect border-border/60">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Monthly Appointments</CardTitle>
                                <CardDescription>Appointment trends over the year</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "hsl(var(--card))",
                                                    border: "1px solid hsl(var(--border))",
                                                    borderRadius: "0.75rem"
                                                }}
                                            />
                                            <Bar dataKey="appointments" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="completed" fill="hsl(var(--status-completed))" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status Distribution */}
                        <Card className="glass-effect border-border/60">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Status Distribution</CardTitle>
                                <CardDescription>All-time appointment status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {statusDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    {statusDistribution.map((item) => (
                                        <div key={item.name} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-xs text-muted-foreground">{item.name}</span>
                                            <span className="text-xs font-medium text-foreground ml-auto">{item.value.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Specialty Breakdown */}
                    <Card className="glass-effect border-border/60">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Appointments by Specialty</CardTitle>
                            <CardDescription>Distribution across medical departments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {specialtyData.map((item) => (
                                    <div key={item.specialty} className="flex items-center gap-4">
                                        <div className="w-32 text-sm font-medium text-foreground">{item.specialty}</div>
                                        <div className="flex-1">
                                            <div className="h-3 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                                    style={{ width: `${item.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="w-20 text-right">
                                            <span className="text-sm font-semibold text-foreground">{item.appointments}</span>
                                            <span className="text-xs text-muted-foreground ml-1">({item.percentage}%)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appointments Tab */}
                <TabsContent value="appointments" className="space-y-6">
                    <Card className="glass-effect border-border/60">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Daily Appointment Trend</CardTitle>
                            <CardDescription>Last 30 days appointment activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dailyTrend}>
                                        <defs>
                                            <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "0.75rem"
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="appointments"
                                            stroke="hsl(var(--primary))"
                                            fillOpacity={1}
                                            fill="url(#colorDaily)"
                                            strokeWidth={2}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="completed"
                                            stroke="hsl(var(--status-completed))"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Doctors Tab */}
                <TabsContent value="doctors" className="space-y-6">
                    <Card className="glass-effect border-border/60">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Top Performing Doctors</CardTitle>
                            <CardDescription>Based on appointment volume and ratings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topDoctors.map((doctor, index) => (
                                    <div key={doctor.name} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/30">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 font-bold text-primary">
                                            #{index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-foreground">{doctor.name}</p>
                                            <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-foreground">{doctor.appointments} appointments</p>
                                            <p className="text-sm text-status-completed">★ {doctor.rating} rating</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Trends Tab */}
                <TabsContent value="trends" className="space-y-6">
                    <Card className="glass-effect border-border/60">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
                            <CardDescription>Monthly revenue from appointments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "0.75rem"
                                            }}
                                            formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={3}
                                            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default ReportsContent;
