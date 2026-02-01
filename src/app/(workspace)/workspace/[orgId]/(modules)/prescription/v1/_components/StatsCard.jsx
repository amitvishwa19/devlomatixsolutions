import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';


export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
    iconClassName,
}) {
    return (
        <Card className={cn('overflow-hidden', className)}>
            <CardContent className="px-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold font-display tracking-tight">{value}</h3>
                            {trend && (
                                <span
                                    className={cn(
                                        'text-sm font-medium',
                                        trend.isPositive ? 'text-success' : 'text-destructive'
                                    )}
                                >
                                    {trend.isPositive ? '+' : '-'}{trend.value}%
                                </span>
                            )}
                        </div>
                        {description && (
                            <p className="text-xs text-muted-foreground">{description}</p>
                        )}
                    </div>
                    <div
                        className={cn(
                            'flex h-12 w-12 items-center justify-center rounded-xl',
                            iconClassName || 'bg-primary/10 text-primary'
                        )}
                    >
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
