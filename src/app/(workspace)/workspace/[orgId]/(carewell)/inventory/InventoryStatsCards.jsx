import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, AlertTriangle, XCircle, TrendingUp, Clock, IndianRupee } from 'lucide-react';
import { formatCurrency } from './utils';

export function InventoryStatsCards({ stats }) {
  const statCards = [
    {
      title: 'Total Items',
      value: stats.totalItems,
      subtitle: `${stats.activeItems} active`,
      icon: Package,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Low Stock',
      value: stats.lowStock,
      subtitle: 'Need reorder',
      icon: AlertTriangle,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStock,
      subtitle: 'Requires attention',
      icon: XCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringSoon,
      subtitle: 'Within 30 days',
      icon: Clock,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(stats.totalValue),
      subtitle: 'At cost price',
      icon: IndianRupee,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      isLarge: true,
    },
    {
      title: 'Potential Revenue',
      value: formatCurrency(stats.potentialRevenue),
      subtitle: 'At selling price',
      icon: TrendingUp,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      isLarge: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className={`font-bold ${stat.isLarge ? 'text-lg' : 'text-2xl'}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
