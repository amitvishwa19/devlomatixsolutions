import { AlertTriangle, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LowStockAlert({ medicines, onReorder }) {
  const lowStockItems = medicines.filter(
    (m) => m.status === 'low-stock' || m.status === 'out-of-stock'
  );

  if (lowStockItems.length === 0) {
    return (
      <div className="stat-card animate-fade-in">
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-success/10">
            <Package className="w-6 h-6 text-success" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">All Stock Levels Normal</h3>
            <p className="text-sm text-muted-foreground">No items require attention</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {lowStockItems.map((medicine, index) => (
        <div
          key={medicine.id}
          className={cn(
            'stat-card animate-fade-in',
            medicine.status === 'out-of-stock' && 'border-destructive/30'
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'p-3 rounded-lg',
                  medicine.status === 'out-of-stock'
                    ? 'bg-destructive/10'
                    : 'bg-warning/10'
                )}
              >
                <AlertTriangle
                  className={cn(
                    'w-5 h-5',
                    medicine.status === 'out-of-stock'
                      ? 'text-destructive'
                      : 'text-warning'
                  )}
                />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{medicine.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-muted-foreground">
                    Current: <span className={cn(
                      'font-medium',
                      medicine.quantity === 0 ? 'text-destructive' : 'text-warning'
                    )}>{medicine.quantity}</span>
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    Reorder Level: {medicine.reorderLevel}
                  </span>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReorder?.(medicine)}
              className="gap-2"
            >
              Reorder
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
