import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bed, UserCheck, Clock, Wrench, Sparkles, DoorOpen, TrendingUp, IndianRupee } from 'lucide-react';
import { calculateOccupancyStats, calculateRevenueSummary, formatCurrency } from '../utils';

export function OccupancyStatsCards({ rooms }) {
  const stats = React.useMemo(() => calculateOccupancyStats(rooms), [rooms]);
  const revenue = React.useMemo(() => calculateRevenueSummary(rooms), [rooms]);

  const cards = [
    {
      title: 'Total Beds',
      value: stats.totalBeds,
      icon: Bed,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Occupied',
      value: stats.occupiedBeds + stats.dischargePendingBeds,
      icon: UserCheck,
      color: 'text-green-600',
      bg: 'bg-green-50',
      subtitle: `${stats.occupancyRate}% occupancy`,
    },
    {
      title: 'Available',
      value: stats.availableBeds,
      icon: DoorOpen,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Reserved',
      value: stats.reservedBeds,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Cleaning',
      value: stats.cleaningBeds,
      icon: Sparkles,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Maintenance',
      value: stats.maintenanceBeds,
      icon: Wrench,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
    },
    {
      title: 'Discharge Pending',
      value: stats.dischargePendingBeds,
      icon: DoorOpen,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Daily Revenue',
      value: formatCurrency(revenue.dailyRevenue),
      icon: IndianRupee,
      color: 'text-primary',
      bg: 'bg-primary/10',
      subtitle: `${formatCurrency(revenue.projectedMonthly)}/month projected`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className={`p-1.5 rounded-md ${card.bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${card.color}`} />
                </div>
                <span className="text-xs text-muted-foreground truncate">{card.title}</span>
              </div>
              <div className="text-lg font-bold">{card.value}</div>
              {card.subtitle && (
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{card.subtitle}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
