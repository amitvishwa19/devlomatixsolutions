import { Card, CardContent } from '@/components/ui/card';
import { IndianRupee, FileText, Clock, AlertTriangle, Percent, TrendingUp } from 'lucide-react';
import { formatCurrency } from './utils';

export function BillingStatsCards({ stats }) {
  const cards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      subtitle: `${formatCurrency(stats.thisMonthRevenue)} this month`,
      icon: IndianRupee,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Outstanding',
      value: formatCurrency(stats.totalOutstanding),
      subtitle: `${stats.pendingCount} pending invoices`,
      icon: Clock,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Overdue',
      value: formatCurrency(stats.totalOverdue),
      subtitle: `${stats.overdueCount} overdue invoices`,
      icon: AlertTriangle,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'GST Collected',
      value: formatCurrency(stats.totalGST),
      subtitle: `${stats.paidCount} paid invoices`,
      icon: Percent,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Total Invoices',
      value: stats.totalInvoices,
      subtitle: `${stats.thisMonthInvoices} this month`,
      icon: FileText,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Collection Rate',
      value: stats.totalRevenue > 0 ? `${Math.round((stats.paidCount / stats.totalInvoices) * 100)}%` : '0%',
      subtitle: 'Invoice success rate',
      icon: TrendingUp,
      iconBg: 'bg-teal-100 dark:bg-teal-900/30',
      iconColor: 'text-teal-600 dark:text-teal-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <p className="text-xs text-muted-foreground">{card.title}</p>
                <p className="text-xl font-bold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground truncate">{card.subtitle}</p>
              </div>
              <div className={`p-2 rounded-lg ${card.iconBg} shrink-0`}>
                <card.icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
