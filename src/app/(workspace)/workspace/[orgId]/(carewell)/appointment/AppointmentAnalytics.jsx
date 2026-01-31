import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, getHours, isToday, subDays } from 'date-fns';
import { DEPARTMENTS, DOCTORS, APPOINTMENT_STATUSES } from './types';

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function AppointmentAnalytics({ appointments }) {
  // Calculate analytics data
  const analytics = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    // Status distribution
    const statusCounts = appointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {});

    const statusData = APPOINTMENT_STATUSES.map((status) => ({
      name: status.label,
      value: statusCounts[status.id] || 0,
      color: status.id === 'completed' ? CHART_COLORS[0] :
             status.id === 'confirmed' ? CHART_COLORS[1] :
             status.id === 'scheduled' ? CHART_COLORS[2] :
             status.id === 'no-show' ? CHART_COLORS[3] :
             CHART_COLORS[4],
    })).filter((item) => item.value > 0);

    // Department distribution
    const deptCounts = appointments.reduce((acc, apt) => {
      acc[apt.department] = (acc[apt.department] || 0) + 1;
      return acc;
    }, {});

    const departmentData = DEPARTMENTS.map((dept) => ({
      name: dept.label.split(' ')[0], // Shorter name
      appointments: deptCounts[dept.id] || 0,
    })).filter((item) => item.appointments > 0);

    // Peak hours analysis
    const hourCounts = appointments.reduce((acc, apt) => {
      const hour = parseInt(apt.time?.split(':')[0]) || 0;
      const isPM = apt.time?.includes('PM');
      const hour24 = isPM && hour !== 12 ? hour + 12 : hour;
      acc[hour24] = (acc[hour24] || 0) + 1;
      return acc;
    }, {});

    const peakHoursData = Array.from({ length: 12 }, (_, i) => {
      const hour = i + 9; // 9 AM to 8 PM
      return {
        hour: hour <= 12 ? `${hour}AM` : `${hour - 12}PM`,
        appointments: hourCounts[hour] || 0,
      };
    });

    // Weekly trend
    const days = eachDayOfInterval({ start: subDays(now, 6), end: now });
    const weeklyData = days.map((day) => {
      const dayAppointments = appointments.filter(
        (apt) => format(new Date(apt.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      return {
        day: format(day, 'EEE'),
        total: dayAppointments.length,
        completed: dayAppointments.filter((a) => a.status === 'completed').length,
        noShow: dayAppointments.filter((a) => a.status === 'no-show').length,
      };
    });

    // Doctor utilization
    const doctorCounts = appointments.reduce((acc, apt) => {
      acc[apt.doctorId] = (acc[apt.doctorId] || 0) + 1;
      return acc;
    }, {});

    const doctorData = DOCTORS.map((doc) => ({
      name: doc.name.replace('Dr. ', ''),
      appointments: doctorCounts[doc.id] || 0,
    })).sort((a, b) => b.appointments - a.appointments);

    // Key metrics
    const totalAppointments = appointments.length;
    const completedCount = statusCounts['completed'] || 0;
    const noShowCount = statusCounts['no-show'] || 0;
    const cancelledCount = statusCounts['cancelled'] || 0;
    const completionRate = totalAppointments > 0 ? ((completedCount / totalAppointments) * 100).toFixed(1) : 0;
    const noShowRate = totalAppointments > 0 ? ((noShowCount / totalAppointments) * 100).toFixed(1) : 0;

    // Find peak hour
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    const peakHourFormatted = peakHour ? (parseInt(peakHour[0]) <= 12 ? `${peakHour[0]}:00 AM` : `${parseInt(peakHour[0]) - 12}:00 PM`) : 'N/A';

    return {
      statusData,
      departmentData,
      peakHoursData,
      weeklyData,
      doctorData,
      metrics: {
        totalAppointments,
        completionRate,
        noShowRate,
        peakHour: peakHourFormatted,
        cancelledCount,
      },
    };
  }, [appointments]);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 pb-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.metrics.totalAppointments}</p>
                  <p className="text-xs text-muted-foreground">Total Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.metrics.completionRate}%</p>
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.metrics.noShowRate}%</p>
                  <p className="text-xs text-muted-foreground">No-Show Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.metrics.peakHour}</p>
                  <p className="text-xs text-muted-foreground">Peak Hour</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
              <CardDescription className="text-xs">Appointment outcomes breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {analytics.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Weekly Trend</CardTitle>
              <CardDescription className="text-xs">Last 7 days performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} name="Total" />
                    <Line type="monotone" dataKey="completed" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Completed" />
                    <Line type="monotone" dataKey="noShow" stroke="hsl(45 93% 47%)" strokeWidth={2} name="No Show" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Peak Hours */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Peak Hours Analysis</CardTitle>
              <CardDescription className="text-xs">Busiest times of the day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.peakHoursData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hour" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="appointments" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Department Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Department Distribution</CardTitle>
              <CardDescription className="text-xs">Appointments by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.departmentData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                    <Tooltip />
                    <Bar dataKey="appointments" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Doctor Utilization */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Doctor Utilization</CardTitle>
            <CardDescription className="text-xs">Appointments per doctor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.doctorData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="appointments" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
