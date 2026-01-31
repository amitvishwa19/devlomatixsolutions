import { Card, CardContent } from '@/components/ui/card';
import { Package, CheckCircle, XCircle, Ban, TrendingUp, IndianRupee } from 'lucide-react';
import { formatCurrency } from './utils';

export function ServiceStatsCards({ stats }) {
  const cards = [
    {
      label: 'Total Services',
      value: stats.total,
      icon: Package,
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Active',
      value: stats.active,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      label: 'Inactive',
      value: stats.inactive,
      icon: XCircle,
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    },
    {
      label: 'Discontinued',
      value: stats.discontinued,
      icon: Ban,
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    },
    {
      label: 'Avg. Price',
      value: formatCurrency(stats.avgPrice),
      icon: IndianRupee,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      isText: true,
    },
    {
      label: 'Top Category',
      value: stats.topCategory ? `${stats.topCategory} (${stats.topCategoryCount})` : 'N/A',
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="border border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className={`font-bold text-foreground truncate ${card.isText ? 'text-sm' : 'text-xl'}`}>
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
