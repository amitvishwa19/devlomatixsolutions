import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { DoorOpen, AlertTriangle, IndianRupee, FileText, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { DISCHARGE_TYPES } from '../utils/types';
import { getRoomTypeById, formatCurrency, calculateEstimatedBill, getLengthOfStay } from '../utils/utils';

export function DischargePatientDialog({ open, onOpenChange, bed, room, onDischarge, onInitiateDischarge }) {
  const [dischargeType, setDischargeType] = React.useState('normal');
  const [notes, setNotes] = React.useState('');
  const [confirmBilling, setConfirmBilling] = React.useState(false);
  const [confirmDocuments, setConfirmDocuments] = React.useState(false);
  const [scheduleCleanup, setScheduleCleanup] = React.useState(true);

  const isPending = bed?.status === 'discharge_pending';
  const estimatedBill = React.useMemo(() => {
    if (!bed || !room) return 0;
    return calculateEstimatedBill(room, bed);
  }, [bed, room]);

  const handleSubmit = () => {
    if (isPending) {
      // Complete discharge
      onDischarge?.({
        bed,
        room,
        dischargeType,
        notes,
        scheduleCleanup,
        dischargedAt: new Date(),
      });
    } else {
      // Initiate discharge
      onInitiateDischarge?.({
        bed,
        room,
        dischargeType,
        notes,
      });
    }

    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setDischargeType('normal');
    setNotes('');
    setConfirmBilling(false);
    setConfirmDocuments(false);
    setScheduleCleanup(true);
  };

  if (!bed || !room) return null;

  const roomType = getRoomTypeById(room.type);
  const canComplete = isPending && confirmBilling && confirmDocuments;

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5" />
            {isPending ? 'Complete Discharge' : 'Initiate Discharge'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Patient & Bed Info */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <Badge className={roomType.color}>{bed.bedNumber}</Badge>
              <Badge variant="outline">{roomType.name}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{bed.patient?.name}</span>
              <span className="text-muted-foreground">{bed.patient?.mrn}</span>
            </div>
            {bed.admission && (
              <div className="text-xs text-muted-foreground">
                Admitted: {format(new Date(bed.admission.admittedAt), 'dd MMM yyyy')}
                {' '}({getLengthOfStay(bed.admission.admittedAt)} days)
              </div>
            )}
          </div>

          {/* Bill Summary */}
          <div className="p-3 border rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <IndianRupee className="h-4 w-4" />
              Room Charges Summary
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Daily Rate</span>
              <span>{formatCurrency(room.dailyRate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Length of Stay</span>
              <span>{getLengthOfStay(bed.admission?.admittedAt) || 1} days</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Estimated Total</span>
              <span>{formatCurrency(estimatedBill)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              *Room charges only. Does not include treatment, medicines, etc.
            </p>
          </div>

          {/* Discharge Type */}
          <div className="space-y-2">
            <Label>Discharge Type</Label>
            <Select value={dischargeType} onValueChange={setDischargeType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISCHARGE_TYPES.map(type => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {dischargeType === 'against_advice' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Patient is leaving against medical advice. Ensure proper documentation is completed.
              </AlertDescription>
            </Alert>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Discharge Notes</Label>
            <Textarea
              placeholder="Enter discharge notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Checklist for completing discharge */}
          {isPending && (
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium">Discharge Checklist</p>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="billing"
                  checked={confirmBilling}
                  onCheckedChange={setConfirmBilling}
                />
                <label htmlFor="billing" className="text-sm flex items-center gap-2">
                  <IndianRupee className="h-3.5 w-3.5" />
                  Billing completed / settled
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="documents"
                  checked={confirmDocuments}
                  onCheckedChange={setConfirmDocuments}
                />
                <label htmlFor="documents" className="text-sm flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  Discharge summary provided
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cleanup"
                  checked={scheduleCleanup}
                  onCheckedChange={setScheduleCleanup}
                />
                <label htmlFor="cleanup" className="text-sm flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  Schedule bed for cleaning
                </label>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isPending && !canComplete}
            variant={dischargeType === 'against_advice' ? 'destructive' : 'default'}
          >
            <DoorOpen className="h-4 w-4 mr-2" />
            {isPending ? 'Complete Discharge' : 'Initiate Discharge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
