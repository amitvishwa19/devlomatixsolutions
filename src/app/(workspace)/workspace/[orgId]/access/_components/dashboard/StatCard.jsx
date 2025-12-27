import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';



export function StatCard({ title, value, description, icon: Icon, trend, className }) {
    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-lg border border-border bg-card px-4  py-2 shadow-soft transition-all duration-300 hover:shadow-medium',
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold text-card-foreground">{value}</p>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                    {trend && (
                        <div className="flex items-center gap-1">
                            <span
                                className={cn(
                                    'text-sm font-medium',
                                    trend.isPositive ? 'text-success' : 'text-destructive'
                                )}
                            >
                                {trend.isPositive ? '+' : ''}{trend.value}%
                            </span>
                            <span className="text-sm text-muted-foreground">from last month</span>
                        </div>
                    )}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
            </div>
        </div>
    );
}
