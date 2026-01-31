import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Users
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function KanbanStats({ columns }) {
  const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0);
  const completedTasks = columns.find(c => c.id === 'completed')?.tasks.length || 0;
  const inProgressTasks = columns.find(c => c.id === 'in-progress')?.tasks.length || 0;
  const criticalTasks = columns.reduce(
    (sum, col) => sum + col.tasks.filter(t => t.priority === 'critical').length, 
    0
  );
  
  const overdueTasks = columns.reduce(
    (sum, col) => sum + col.tasks.filter(t => new Date(t.dueDate) < new Date() && col.id !== 'completed').length,
    0
  );

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'In Progress',
      value: inProgressTasks,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      label: 'Completed',
      value: completedTasks,
      subValue: `${completionRate}%`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Critical',
      value: criticalTasks,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      highlight: criticalTasks > 0,
    },
    {
      label: 'Overdue',
      value: overdueTasks,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      highlight: overdueTasks > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.label} 
            className={cn(
              'transition-all duration-200 hover:shadow-md',
              stat.highlight && 'border-destructive/50'
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                  <Icon className={cn('w-4 h-4', stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                    {stat.subValue && (
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        ({stat.subValue})
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
