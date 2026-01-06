import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.jsx';
import { Eye, Printer, Play, CheckCircle2, Barcode } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig = {
  pending: { label: 'Pending', variant: 'pending' },
  processing: { label: 'Processing', variant: 'processing' },
  completed: { label: 'Completed', variant: 'completed' },
};

const priorityConfig = {
  routine: { label: 'Routine', className: 'text-muted-foreground' },
  urgent: { label: 'Urgent', className: 'text-warning font-medium' },
  stat: { label: 'STAT', className: 'text-destructive font-bold' },
};

export function OrdersTable({ orders, onViewOrder, onUpdateStatus, onPrintResult, onViewTracking }) {
  return (
    <div className="bg-card border rounded-xl overflow-hidden animate-slide-up">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-muted-foreground font-semibold">Order ID</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Patient</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Tests</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Specimen</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Priority</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Collected</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="border-border/30 hover:bg-accent/30 transition-colors">
              <TableCell className="font-mono text-sm text-primary">{order.orderId}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{order.patient.name}</p>
                  <p className="text-xs text-muted-foreground">{order.patient.mrn}</p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">
                    {order.tests.length === 1
                      ? order.tests[0].testCode
                      : `${order.tests.length} tests`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.tests.length === 1
                      ? order.tests[0].testName
                      : order.tests.map(t => t.testCode).join(', ')}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium flex items-center gap-1">
                    <Barcode className="h-3 w-3" />
                    {order.specimenId}
                  </p>
                  <p className="text-xs text-muted-foreground">{order.specimenTypes.join(', ')}</p>
                </div>
              </TableCell>
              <TableCell>
                <span className={priorityConfig[order.priority].className}>
                  {priorityConfig[order.priority].label}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={statusConfig[order.status].variant}>
                  {statusConfig[order.status].label}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(order.collectedAt, 'MMM dd, HH:mm')}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onViewOrder(order)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {onViewTracking && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewTracking(order)}
                      className="text-info hover:text-info"
                    >
                      <Barcode className="h-4 w-4" />
                    </Button>
                  )}
                  {order.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onUpdateStatus(order.id, 'processing')}
                      className="text-info hover:text-info"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  {order.status === 'processing' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onUpdateStatus(order.id, 'completed')}
                      className="text-success hover:text-success"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                  {order.status === 'completed' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onPrintResult(order)}
                      className="text-primary hover:text-primary"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
