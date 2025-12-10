import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingDown, TrendingUp, AlertCircle, AlertTriangle } from 'lucide-react';

const activities = [
    {
        id: 1,
        type: 'restock',
        item: 'Surgical Gloves',
        quantity: '+500 units',
        user: 'Dr. Sarah Chen',
        time: '2 hours ago',
        icon: TrendingUp,
    },
    {
        id: 2,
        type: 'usage',
        item: 'N95 Masks',
        quantity: '-120 units',
        user: 'ICU Department',
        time: '3 hours ago',
        icon: TrendingDown,
    },
    {
        id: 3,
        type: 'alert',
        item: 'Insulin Syringes',
        quantity: 'Low stock alert',
        user: 'System',
        time: '5 hours ago',
        icon: AlertCircle,
    },
    {
        id: 4,
        type: 'order',
        item: 'Blood Collection Tubes',
        quantity: 'Order placed',
        user: 'Admin',
        time: '6 hours ago',
        icon: Package,
    },
];

export function RecentActivity() {
    return (
        <Card variant="glass" className="animate-slide-up p-2">

            <CardContent className="flex flex-col gap-2 p-2">
                <div className='flex flex-row justify-between mb-4'>
                    <span className='flex flex-row gap-2 items-center'>
                        <AlertTriangle size={16} />
                        Recent Activity
                    </span>

                </div>


                {activities.map((activity) => (
                    <div
                        key={activity.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                        <div className={`rounded-full p-2 ${activity.type === 'restock' ? 'bg-success/10 text-success' :
                            activity.type === 'usage' ? 'bg-warning/10 text-warning' :
                                activity.type === 'alert' ? 'bg-destructive/10 text-destructive' :
                                    'bg-primary/10 text-primary'
                            }`}>
                            <activity.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{activity.item}</p>
                            <p className="text-xs text-muted-foreground">{activity.user}</p>
                        </div>
                        <div className="text-right">
                            <Badge variant={
                                activity.type === 'restock' ? 'success' :
                                    activity.type === 'usage' ? 'warning' :
                                        activity.type === 'alert' ? 'destructive' :
                                            'secondary'
                            }>
                                {activity.quantity}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
