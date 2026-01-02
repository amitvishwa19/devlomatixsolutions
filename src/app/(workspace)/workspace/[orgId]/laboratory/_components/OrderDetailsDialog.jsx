import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { User, TestTube, Calendar, Stethoscope, FileText } from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pending', variant: 'pending' },
  processing: { label: 'Processing', variant: 'processing' },
  completed: { label: 'Completed', variant: 'completed' },
};

export function OrderDetailsDialog({ order, open, onOpenChange, onUpdateOrder }) {
  const [result, setResult] = useState(order?.result || '');
  const [resultNote, setResultNote] = useState(order?.resultNote || '');
  const [technicianName, setTechnicianName] = useState(order?.technicianName || '');

  if (!order) return null;

  const handleSaveResult = () => {
    onUpdateOrder(order.id, {
      result,
      resultNote,
      technicianName,
      status: 'completed',
      completedAt: new Date(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-xl">Order Details</span>
            <Badge variant={statusConfig[order.status].variant} className="text-sm">
              {statusConfig[order.status].label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="font-medium">{order.patient.name}</p>
                  <p className="text-sm text-muted-foreground">{order.patient.mrn} • {order.patient.age}y • {order.patient.gender}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-info/10 text-info">
                  <TestTube className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tests</p>
                  <p className="font-medium">{order.tests.map(t => t.testName).join(', ')}</p>
                  <p className="text-sm text-muted-foreground">Codes: {order.tests.map(t => t.testCode).join(', ')}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-warning/10 text-warning">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Specimen</p>
                  <p className="font-medium">{order.specimenId}</p>
                  <p className="text-sm text-muted-foreground">{order.specimenTypes.join(', ')} • Collected {format(order.collectedAt, 'MMM dd, HH:mm')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-success/10 text-success">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ordered By</p>
                  <p className="font-medium">{order.orderedBy}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Result Entry Section */}
          {order.status !== 'pending' && (
            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <FileText className="h-5 w-5 text-primary" />
                Lab Results
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Result</Label>
                  <Textarea
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    placeholder="Enter test results..."
                    className="bg-input border-border min-h-[100px]"
                    disabled={order.status === 'completed'}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes / Interpretation</Label>
                  <Textarea
                    value={resultNote}
                    onChange={(e) => setResultNote(e.target.value)}
                    placeholder="Clinical notes or interpretation..."
                    className="bg-input border-border"
                    disabled={order.status === 'completed'}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Technician Name</Label>
                  <Input
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    placeholder="Lab Tech: Name"
                    className="bg-input border-border"
                    disabled={order.status === 'completed'}
                  />
                </div>

                {order.status === 'processing' && (
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleSaveResult} variant="success" disabled={!result}>
                      Complete & Save Result
                    </Button>
                  </div>
                )}

                {order.completedAt && (
                  <p className="text-sm text-muted-foreground">
                    Completed on {format(order.completedAt, 'MMM dd, yyyy HH:mm')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
