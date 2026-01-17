import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';



export function StatCard({
    title,
    value,
    change,
    changeType = 'neutral',
    icon: Icon,
    iconColor = 'text-primary',
}) {
    return (
        <Card className=" transition-all duration-300 animate-slide-up rounded-md p-0">
            <CardContent className="py-2 px-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-3xl font-bold text-foreground">{value}</p>
                        {change && (
                            <p
                                className={cn(
                                    'text-xs font-medium',
                                    changeType === 'positive' && 'text-success',
                                    changeType === 'negative' && 'text-destructive',
                                    changeType === 'neutral' && 'text-muted-foreground'
                                )}
                            >
                                {change}
                            </p>
                        )}
                    </div>
                    <div className={cn('rounded-xl bg-primary/10 p-3', iconColor.includes('destructive') && 'bg-destructive/10')}>
                        <Icon className={cn('h-6 w-6', iconColor)} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
