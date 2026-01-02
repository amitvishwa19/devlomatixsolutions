import { cn } from '@/lib/utils';

const accentStyles = {
  primary: 'text-primary border-primary/30 bg-primary/10',
  success: 'text-success border-success/30 bg-success/10',
  warning: 'text-warning border-warning/30 bg-warning/10',
  info: 'text-info border-info/30 bg-info/10',
  destructive: 'text-destructive border-destructive/30 bg-destructive/10',
};

export function StatCard({ title, value, icon: Icon, accentColor = 'primary' }) {
  return (
    <div className="glass-card rounded-xl p-5 animate-fade-in hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
        </div>
        <div className={cn('p-3 rounded-xl border', accentStyles[accentColor])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
