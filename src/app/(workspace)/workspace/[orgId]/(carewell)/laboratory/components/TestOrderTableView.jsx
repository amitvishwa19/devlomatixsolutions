import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle } from 'lucide-react';
import { formatLabDate, calculateTurnaround } from '../utils/utils';
import { TEST_ORDER_STATUS_LABELS, TEST_ORDER_STATUS_COLORS, TEST_CATEGORIES } from '../utils/types';

export function TestOrderTableView({ orders, onOrderClick }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No test orders found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[140px]">Order #</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Tests</TableHead>
            <TableHead>Ordered By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Ordered</TableHead>
            <TableHead>TAT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const turnaround = calculateTurnaround(order.orderedAt, order.completedAt);
            return (
              <TableRow
                key={order.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onOrderClick?.(order)}
              >
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.patient.name}</p>
                    <p className="text-xs text-muted-foreground">{order.patient.mrn}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {order.tests.slice(0, 2).map((test, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {test.name.length > 15 ? test.name.substring(0, 15) + '...' : test.name}
                      </Badge>
                    ))}
                    {order.tests.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{order.tests.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{order.orderedBy.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={TEST_ORDER_STATUS_COLORS[order.status]}>
                    {TEST_ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {order.priority === 'stat' ? (
                    <Badge variant="destructive">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      STAT
                    </Badge>
                  ) : order.priority === 'urgent' ? (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800">
                      Urgent
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Routine</Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatLabDate(order.orderedAt)}
                </TableCell>
                <TableCell className="text-sm">{turnaround || '-'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
