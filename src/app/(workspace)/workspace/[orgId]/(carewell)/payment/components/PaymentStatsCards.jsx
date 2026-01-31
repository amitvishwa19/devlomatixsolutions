import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  IndianRupee, 
  TrendingUp, 
  CreditCard, 
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  ArrowUpRight,
} from 'lucide-react';
import { formatCurrency, formatIndianNumber } from '../utils';

export function PaymentStatsCards({ stats }) {
  const cards = [
    {
      title: 'Total Collected',
      value: formatIndianNumber(stats.totalCollected),
      subValue: `${stats.successfulCount} transactions`,
      icon: IndianRupee,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: "Today's Collection",
      value: formatCurrency(stats.todayCollected),
      subValue: `${stats.todayCount} transactions today`,
      icon: TrendingUp,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      subValue: `${stats.failedCount} failed`,
      icon: CheckCircle2,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pending',
      value: stats.pendingCount,
      subValue: 'Awaiting confirmation',
      icon: Clock,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.subValue}</p>
              </div>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
            {card.trend && (
              <div className="mt-2 flex items-center gap-1">
                <ArrowUpRight className={`w-3 h-3 ${card.trendUp ? 'text-emerald-500' : 'text-red-500'}`} />
                <span className={`text-xs ${card.trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                  {card.trend} from last month
                </span>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
