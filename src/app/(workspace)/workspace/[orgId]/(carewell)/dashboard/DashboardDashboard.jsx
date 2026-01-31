import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Calendar,
  Bed,
  DollarSign,
  Stethoscope,
  Scissors,
  Clock,
  TrendingUp,
  UserPlus,
  CalendarPlus,
  FileText,
  Pill,
  Upload,
  Building2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Activity,
  Video,
  User,
  CreditCard,
  Package,
  Syringe,
  Bandage,
  Shield,
  Heart,
  Baby,
  Zap,
  Link,
  Keyboard,
} from 'lucide-react';
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
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useDashboardWidgets, WidgetSettingsDialog, DashboardWidget } from '@/components/DashboardWidgets';

// Mock data
const statsData = {
  totalPatients: { value: 2847, change: '+12%', label: 'from last month' },
  appointmentsToday: { value: 48, pending: 8, label: 'pending' },
  availableBeds: { value: 32, occupancy: 75, label: 'occupancy' },
  revenueToday: { value: 142000, change: '+18%', label: 'growth' },
  activeDoctors: { value: 5, total: 12, label: 'on shift' },
  surgeriesToday: { value: 4, completed: 1, label: 'procedures' },
  satisfaction: { value: 92, label: 'satisfaction' },
  utilization: { value: 78, label: 'utilization' },
  efficiency: { value: 85, label: 'efficiency' },
};

const todaysAppointments = [
  { id: 1, name: 'Priya Sharma', doctor: 'Dr. Rajesh Gupta', department: 'Cardiology', time: '09:00 AM', status: 'Confirmed', hasVideo: true },
  { id: 2, name: 'Vikram Patel', doctor: 'Dr. Sunita Rao', department: 'Neurology', time: '10:30 AM', status: 'In Progress', hasVideo: false },
  { id: 3, name: 'Anjali Verma', doctor: 'Dr. Amit Sharma', department: 'Orthopedics', time: '11:15 AM', status: 'Confirmed', hasVideo: true },
  { id: 4, name: 'Suresh Kumar', doctor: 'Dr. Meera Nair', department: 'Dermatology', time: '02:00 PM', status: 'Pending', hasVideo: true },
];

const todaysSurgeries = [
  { id: 1, name: 'Coronary Bypass', patient: 'Ramesh Iyer', doctor: 'Dr. Rajesh Gupta', time: '09:00 AM', duration: '4h', room: 'OR-1', status: 'In Progress' },
  { id: 2, name: 'Hip Replacement', patient: 'Lakshmi Devi', doctor: 'Dr. Amit Sharma', time: '11:30 AM', duration: '2.5h', room: 'OR-2', status: 'Scheduled' },
  { id: 3, name: 'Appendectomy', patient: 'Arun Mehta', doctor: 'Dr. Meera Nair', time: '02:00 PM', duration: '1.5h', room: 'OR-3', status: 'Scheduled' },
  { id: 4, name: 'Spinal Fusion', patient: 'Kavitha Reddy', doctor: 'Dr. Sunita Rao', time: '04:30 PM', duration: '5h', room: 'OR-1', status: 'Scheduled' },
];

const activeDoctors = [
  { id: 1, name: 'Dr. Rajesh Gupta', department: 'Cardiology', patients: 12, initials: 'RG', color: 'bg-emerald-500' },
  { id: 2, name: 'Dr. Sunita Rao', department: 'Neurology', patients: 8, initials: 'SR', color: 'bg-blue-500' },
  { id: 3, name: 'Dr. Amit Sharma', department: 'Orthopedics', patients: 15, initials: 'AS', color: 'bg-amber-500' },
  { id: 4, name: 'Dr. Meera Nair', department: 'Dermatology', patients: 6, initials: 'MN', color: 'bg-purple-500', available: true },
  { id: 5, name: 'Dr. Priya Patel', department: 'Pediatrics', patients: 10, initials: 'PP', color: 'bg-pink-500' },
];

const staffSchedule = [
  { shift: 'Morning Shift', staff: 24 },
  { shift: 'Afternoon Shift', staff: 18 },
  { shift: 'Night Shift', staff: 12 },
];

const upcomingShifts = [
  { name: 'Dr. Anita Desai', department: 'Cardiology', time: '2:00 PM' },
  { name: 'Nurse Rekha Jain', department: 'Emergency', time: '6:00 PM' },
];

const inventoryStatus = [
  { name: 'Surgical Masks', quantity: 2450, unit: 'units', status: 'good', icon: Shield },
  { name: 'Latex Gloves', quantity: 1820, unit: 'units', status: 'good', icon: Shield },
  { name: 'IV Fluids', quantity: 340, unit: 'units', status: 'good', icon: Activity },
  { name: 'Syringes', quantity: 89, unit: 'units', status: 'low', icon: Syringe },
  { name: 'Bandages', quantity: 567, unit: 'units', status: 'good', icon: Bandage },
  { name: 'Antibiotics', quantity: 45, unit: 'units', status: 'low', icon: Pill },
];

const departmentLoad = [
  { name: 'Cardiology', current: 156, capacity: 200, percent: 78 },
  { name: 'Neurology', current: 89, capacity: 120, percent: 74 },
  { name: 'Orthopedics', current: 134, capacity: 150, percent: 89 },
  { name: 'Pediatrics', current: 78, capacity: 100, percent: 78 },
  { name: 'Oncology', current: 67, capacity: 80, percent: 84 },
];

const bedOccupancy = [
  { name: 'ICU', occupied: 8, total: 10, icon: AlertTriangle, critical: true },
  { name: 'General Ward', occupied: 35, total: 50, icon: Bed },
  { name: 'Pediatric', occupied: 12, total: 20, icon: Baby },
  { name: 'Maternity', occupied: 14, total: 15, icon: Heart, critical: true },
  { name: 'Emergency', occupied: 6, total: 12, icon: Zap },
];

const activityFeed = [
  { id: 1, type: 'patient', title: 'New patient registered', desc: 'Rahul Sharma - Room 204', time: '2 min ago', icon: UserPlus },
  { id: 2, type: 'lab', title: 'Lab report uploaded', desc: 'Blood test results for Sneha Gupta', time: '15 min ago', icon: FileText },
  { id: 3, type: 'payment', title: 'Payment received', desc: '₹94,250 from Vikram Patel', time: '32 min ago', icon: CreditCard },
  { id: 4, type: 'prescription', title: 'Prescription issued', desc: 'Dr. Gupta to Priya Sharma', time: '1 hour ago', icon: Link },
  { id: 5, type: 'alert', title: 'Low inventory alert', desc: 'Paracetamol stock below threshold', time: '2 hours ago', icon: AlertTriangle },
];

const alerts = [
  { id: 1, title: 'ICU Bed Shortage', desc: 'Only 2 ICU beds available', time: '5 min ago', critical: true },
  { id: 2, title: 'Low Blood Supply', desc: 'O- blood type running low', time: '15 min ago', critical: false },
  { id: 3, title: 'Staff Meeting', desc: 'Department meeting at 3 PM', time: '30 min ago', critical: false },
  { id: 4, title: 'Equipment Maintenance', desc: 'MRI scheduled for maintenance', time: '1 hour ago', critical: false },
];

const demographicsData = [
  { name: '0-18', value: 15 },
  { name: '19-35', value: 25 },
  { name: '36-50', value: 30 },
  { name: '51-65', value: 20 },
  { name: '65+', value: 10 },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const quickActions = [
  { icon: UserPlus, label: 'Add Patient', path: '/patients' },
  { icon: CalendarPlus, label: 'New Appointment', path: '/appointments' },
  { icon: FileText, label: 'Create Invoice', path: '/billing' },
  { icon: Pill, label: 'Prescription', path: '/prescriptions' },
  { icon: Upload, label: 'Upload Doc', path: '/documents' },
  { icon: Building2, label: 'Manage Beds', path: '/accommodation' },
];

// Components
function StatCard({ icon: Icon, title, value, subtitle, trend, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {trend && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                {subtitle}
              </p>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CircularProgress({ value, label, size = 80, strokeWidth = 6, highlight = false }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            className="text-muted"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className={highlight ? "text-emerald-500" : "text-primary"}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{value}%</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

function MiniCalendar() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const events = { 5: 'emerald', 12: 'red', 18: 'blue', 25: 'amber' };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">{monthName}</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((day) => (
          <div key={day} className="text-xs font-medium text-muted-foreground py-1">{day}</div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="py-1" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
          const eventColor = events[day];
          
          return (
            <div key={day} className={`py-1 text-xs rounded cursor-pointer relative ${isToday ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}>
              {day}
              {eventColor && <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-${eventColor}-500`} />}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Appointments</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Surgeries</div>
        <div className="flex items-center gap-1 text-muted-foreground">Meetings</div>
      </div>
    </div>
  );
}

export default function DashboardDashboard() {
  const navigate = useNavigate();
  const { widgets, toggleWidget, resetWidgets, isWidgetEnabled } = useDashboardWidgets();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Hospital overview and real-time metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
            <Keyboard className="h-3 w-3" />
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px] font-mono">⌘K</kbd>
            <span>for quick search</span>
          </div>
          <WidgetSettingsDialog 
            widgets={widgets} 
            toggleWidget={toggleWidget} 
            resetWidgets={resetWidgets} 
          />
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard icon={Users} title="Patients" value="2,847" subtitle="+12% this month" trend color="primary" />
        <StatCard icon={Calendar} title="Appointments" value="48" subtitle="8 pending" color="blue" />
        <StatCard icon={Bed} title="Beds" value="32" subtitle="75% occupancy" color="emerald" />
        <StatCard icon={DollarSign} title="Revenue" value="₹14.2L" subtitle="+18% growth" trend color="emerald" />
        <StatCard icon={Stethoscope} title="Doctors" value="5" subtitle="on shift" color="purple" />
        <StatCard icon={Scissors} title="Surgeries" value="4" subtitle="1 in progress" color="amber" />
        <StatCard icon={Clock} title="Wait Time" value="14m" subtitle="-3 min avg" trend color="blue" />
        <StatCard icon={TrendingUp} title="Satisfaction" value="94%" subtitle="+2.1% this week" trend color="emerald" />
      </div>

      {/* Row 1: Appointments, Performance, Calendar & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Appointments */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Today's Appointments</CardTitle>
                <p className="text-xs text-muted-foreground">{todaysAppointments.length} scheduled for today</p>
              </div>
              <Button variant="link" size="sm" className="text-primary" onClick={() => navigate('/appointments')}>View All</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaysAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                    {apt.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{apt.name}</span>
                      {apt.hasVideo && <Video className="w-3 h-3 text-muted-foreground" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{apt.doctor} • {apt.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">{apt.time}</span>
                  </div>
                  <Badge variant={apt.status === 'Confirmed' ? 'outline' : apt.status === 'In Progress' ? 'default' : 'secondary'} className="text-xs mt-1">
                    {apt.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Performance</CardTitle>
            <p className="text-xs text-muted-foreground">Hospital metrics</p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-around mb-6">
              <CircularProgress value={92} label="Satisfaction" />
              <CircularProgress value={78} label="Utilization" />
              <CircularProgress value={85} label="Efficiency" highlight />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-lg font-bold">₹14.2L</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="text-lg font-bold">+18%</p>
                  <p className="text-xs text-muted-foreground">Growth</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar & Alerts */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <MiniCalendar />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Alerts</CardTitle>
                <Badge variant="destructive" className="text-xs">{alerts.filter(a => a.critical).length} critical</Badge>
              </div>
              <p className="text-xs text-muted-foreground">System notifications</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className={`p-2 rounded-lg text-sm ${alert.critical ? 'bg-red-50 dark:bg-red-950/30' : 'bg-muted/50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`w-4 h-4 mt-0.5 ${alert.critical ? 'text-red-500' : 'text-muted-foreground'}`} />
                      <div>
                        <p className={`font-medium ${alert.critical ? 'text-red-700 dark:text-red-400' : ''}`}>{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.desc}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {alert.time}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 2: Surgeries, Doctors, Staff Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Surgeries */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Today's Surgeries</CardTitle>
                <p className="text-xs text-muted-foreground">Operating room schedule</p>
              </div>
              <Badge variant="outline" className="text-primary">{todaysSurgeries.length} procedures</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaysSurgeries.map((surgery) => (
              <div key={surgery.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{surgery.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="w-3 h-3" /> {surgery.patient}
                    </p>
                  </div>
                  <Badge variant={surgery.status === 'In Progress' ? 'default' : 'secondary'}>{surgery.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {surgery.time} ({surgery.duration})</span>
                  <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3" /> {surgery.doctor}</span>
                  <span className="font-medium">{surgery.room}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Active Doctors */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Active Doctors</CardTitle>
                <p className="text-xs text-muted-foreground">Currently on shift</p>
              </div>
              <span className="text-sm text-muted-foreground">{activeDoctors.length} total</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeDoctors.map((doctor) => (
              <div key={doctor.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${doctor.color} flex items-center justify-center text-white text-xs font-medium relative`}>
                    {doctor.initials}
                    {doctor.available && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{doctor.name}</p>
                    <p className="text-xs text-muted-foreground">{doctor.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{doctor.patients}</p>
                  <p className="text-xs text-muted-foreground">patients</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Staff Schedule & Inventory */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Staff Schedule</CardTitle>
              <p className="text-xs text-muted-foreground">Current shift overview</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {staffSchedule.map((shift) => (
                <div key={shift.shift} className="flex items-center justify-between">
                  <span className="text-sm">{shift.shift}</span>
                  <span className="font-bold">{shift.staff} staff</span>
                </div>
              ))}
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">Upcoming Shifts</p>
                {upcomingShifts.map((shift, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-medium">{shift.name}</p>
                      <p className="text-xs text-muted-foreground">{shift.department}</p>
                    </div>
                    <span className="text-sm">{shift.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 3: Department Load, Bed Occupancy, Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Department Load */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Department Load</CardTitle>
            <p className="text-xs text-muted-foreground">Current patient distribution</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {departmentLoad.map((dept) => (
              <div key={dept.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{dept.name}</span>
                  <span className="text-muted-foreground">{dept.current}/{dept.capacity} ({dept.percent}%)</span>
                </div>
                <Progress value={dept.percent} className={`h-2 ${dept.percent > 85 ? '[&>div]:bg-amber-500' : '[&>div]:bg-primary'}`} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Bed Occupancy */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Bed Occupancy</CardTitle>
                <p className="text-xs text-muted-foreground">Current availability</p>
              </div>
              <Badge variant="destructive" className="text-xs">{bedOccupancy.filter(b => b.critical).length} critical</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {bedOccupancy.map((ward) => {
              const Icon = ward.icon;
              const percent = (ward.occupied / ward.total) * 100;
              return (
                <div key={ward.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${ward.critical ? 'text-amber-500' : 'text-muted-foreground'}`} />
                      <span>{ward.name}</span>
                    </div>
                    <span className="text-muted-foreground">{ward.occupied}/{ward.total}</span>
                  </div>
                  <Progress value={percent} className={`h-2 ${percent > 90 ? '[&>div]:bg-red-500' : percent > 70 ? '[&>div]:bg-emerald-500' : '[&>div]:bg-emerald-500'}`} />
                </div>
              );
            })}
            <div className="pt-2 border-t flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Occupancy</span>
              <span className="font-bold">75/107 (70%)</span>
            </div>
          </CardContent>
        </Card>

        {/* Patient Demographics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Patient Demographics</CardTitle>
            <p className="text-xs text-muted-foreground">Age distribution breakdown</p>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={demographicsData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                    {demographicsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-3 mt-2 text-xs">
              {demographicsData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-around pt-4 mt-4 border-t">
              <div className="text-center">
                <p className="text-xl font-bold">50%</p>
                <p className="text-xs text-muted-foreground">Male</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">48%</p>
                <p className="text-xs text-muted-foreground">Female</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">2%</p>
                <p className="text-xs text-muted-foreground">Other</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Activity Feed, Inventory, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Feed */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Activity Feed</CardTitle>
            <p className="text-xs text-muted-foreground">Recent updates</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityFeed.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.desc}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" /> {activity.time}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Inventory Status */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Inventory Status</CardTitle>
                <p className="text-xs text-muted-foreground">Medical supplies overview</p>
              </div>
              <Badge variant="destructive" className="text-xs">{inventoryStatus.filter(i => i.status === 'low').length} critical</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {inventoryStatus.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.name} className={`flex items-center justify-between p-2 rounded-lg ${item.status === 'low' ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-muted/30'}`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${item.status === 'low' ? 'text-amber-600' : 'text-muted-foreground'}`} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className={`text-sm font-medium ${item.status === 'low' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {item.quantity} {item.unit}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <p className="text-xs text-muted-foreground">Frequently used tasks</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-1.5 hover:bg-primary/5 hover:border-primary/30"
                  onClick={() => navigate(action.path)}
                >
                  <action.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
