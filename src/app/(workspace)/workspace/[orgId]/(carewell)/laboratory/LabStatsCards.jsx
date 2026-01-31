import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FlaskConical, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export function LabStatsCards({ stats }) {
  const cards = [
    {
      title: 'Total Orders',
      value: stats.total,
      subtitle: `${stats.todayOrders} ordered today`,
      icon: FlaskConical,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Pending',
      value: stats.pending + stats.inProgress,
      subtitle: `${stats.inProgress} in progress`,
      icon: Clock,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Completed',
      value: stats.completed,
      subtitle: `${stats.completionRate}% completion rate`,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'STAT Orders',
      value: stats.stat,
      subtitle: `Avg turnaround: ${stats.averageTurnaround}h`,
      icon: AlertTriangle,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              </div>
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
