import { Calendar, Clock, CheckCircle2, XCircle, UserX, CalendarCheck } from 'lucide-react';

export function AppointmentStatsCards({ stats }) {
  const statItems = [
    { label: 'Today', value: stats.today, icon: Calendar, bgColor: 'bg-primary/10', iconColor: 'text-primary' },
    { label: 'Scheduled', value: stats.scheduled, icon: Clock, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
    { label: 'Confirmed', value: stats.confirmed, icon: CalendarCheck, bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, bgColor: 'bg-amber-100', iconColor: 'text-amber-600' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, bgColor: 'bg-green-100', iconColor: 'text-green-600' },
    { label: 'Cancelled', value: stats.cancelled, icon: XCircle, bgColor: 'bg-destructive/10', iconColor: 'text-destructive' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm"
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.bgColor}`}>
            <item.icon className={`w-5 h-5 ${item.iconColor}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
