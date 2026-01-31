import { Pill, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function PrescriptionStatsCards({ stats }) {
  const cards = [
    {
      label: 'Total Prescriptions',
      value: stats.total,
      icon: Pill,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Active',
      value: stats.active,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: 'On Hold',
      value: stats.onHold,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
    {
      label: 'Discontinued',
      value: stats.discontinued,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
