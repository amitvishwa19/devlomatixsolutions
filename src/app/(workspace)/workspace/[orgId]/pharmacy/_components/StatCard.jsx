import { cn } from '@/lib/utils';

const variantStyles = {
  default: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }) {
  return (
    <div className="stat-card animate-fade-in bg-card border p-4 rounded-lg hover:border-primary/30 transition-colors animate-fade-in">
      <div className="relative z-10 flex items-start justify-between">
        <div>

          <div className="text-sm font-medium text-muted-foreground flex flex-row items-center justify-between ">
            <div className={cn('p-2 rounded-lg bg-secondary/50 mr-6', variantStyles[variant])}>
              <Icon className="w-4 h-4" />
            </div>
            <span>{title}</span>
          </div>


          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                'mt-2 text-sm font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
