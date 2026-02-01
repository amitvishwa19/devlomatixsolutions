import { Users, UserCheck, Building2, AlertTriangle, LogOut, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function PatientStatsCards({ stats }) {
  const cards = [
    {
      label: 'Total Patients',
      value: stats.total,
      icon: Users,
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Active',
      value: stats.active,
      icon: UserCheck,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Admitted',
      value: stats.admitted,
      icon: Building2,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Critical',
      value: stats.critical,
      icon: AlertTriangle,
      color: 'bg-destructive/10 text-destructive',
    },
    {
      label: 'Discharged',
      value: stats.discharged,
      icon: LogOut,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'With Allergies',
      value: stats.withAllergies,
      icon: AlertCircle,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="border border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
