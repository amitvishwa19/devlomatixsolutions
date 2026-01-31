import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, User, Stethoscope, FlaskConical, AlertTriangle } from 'lucide-react';
import { formatLabDate, getInitials, calculateTurnaround } from './utils';
import { TEST_ORDER_STATUS_LABELS, TEST_ORDER_STATUS_COLORS, PRIORITY_LEVELS, TEST_CATEGORIES } from './types';
import { AssignedTags } from '@/carewell/taxonomy/components/TaxonomySelector';

export function TestOrderCard({ order, onClick }) {
  const statusLabel = TEST_ORDER_STATUS_LABELS[order.status];
  const statusColor = TEST_ORDER_STATUS_COLORS[order.status];
  const priority = PRIORITY_LEVELS.find((p) => p.id === order.priority);
  const turnaround = calculateTurnaround(order.orderedAt, order.completedAt);

  // Get unique categories from tests
  const categories = [...new Set(order.tests.map((t) => t.category))];
  const categoryLabels = categories.map((c) => TEST_CATEGORIES.find((cat) => cat.id === c)?.label || c);

  return (
    <Card
      className="border border-border hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick?.(order)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Patient Avatar */}
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-lg shrink-0">
            {getInitials(order.patient.name)}
          </div>

          {/* Order Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground truncate">{order.patient.name}</h3>
                <p className="text-xs text-muted-foreground">{order.orderNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                {order.priority === 'stat' && (
                  <Badge variant="destructive" className="shrink-0">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    STAT
                  </Badge>
                )}
                <Badge variant="outline" className={`shrink-0 ${statusColor}`}>
                  {statusLabel}
                </Badge>
              </div>
            </div>

            {/* Tests */}
            <div className="flex flex-wrap gap-1">
              {order.tests.slice(0, 3).map((test, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  <FlaskConical className="w-3 h-3 mr-1" />
                  {test.name}
                </Badge>
              ))}
              {order.tests.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{order.tests.length - 3} more
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Stethoscope className="w-3 h-3" />
                <span className="truncate">{order.orderedBy.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatLabDate(order.orderedAt)}</span>
              </div>
              {order.collectedBy && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span className="truncate">{order.collectedBy.name}</span>
                </div>
              )}
              {turnaround && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>TAT: {turnaround}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {(order.tags?.length > 0 || order.categories?.length > 0) && (
              <AssignedTags tagIds={order.tags} categoryIds={order.categories} compact />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
