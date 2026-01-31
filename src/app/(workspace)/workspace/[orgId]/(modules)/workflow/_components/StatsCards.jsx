import { Users, Building2, BedDouble, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const statItems = [
  { key: 'totalActive', label: 'Total Active', icon: Users, bgClass: 'bg-primary/10', iconClass: 'text-primary' },
  { key: 'opdPatients', label: 'OPD Patients', icon: Building2, bgClass: 'bg-blue-100', iconClass: 'text-blue-600' },
  { key: 'ipdPatients', label: 'IPD Patients', icon: BedDouble, bgClass: 'bg-violet-100', iconClass: 'text-violet-600' },
  { key: 'inProgress', label: 'In Progress', icon: Clock, bgClass: 'bg-amber-100', iconClass: 'text-amber-600' },
  { key: 'dischargedToday', label: 'Discharged Today', icon: CheckCircle, bgClass: 'bg-emerald-100', iconClass: 'text-emerald-600' },
  { key: 'critical', label: 'Critical', icon: AlertTriangle, bgClass: 'bg-red-100', iconClass: 'text-red-600' },
];

export function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item) => {
        const Icon = item.icon;
        const value = stats[item.key];
        
        return (
          <div key={item.key} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.bgClass}`}>
              <Icon className={`w-6 h-6 ${item.iconClass}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
