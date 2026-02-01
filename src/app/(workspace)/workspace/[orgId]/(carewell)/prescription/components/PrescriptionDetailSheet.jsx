import { format } from 'date-fns';
import { Pill, User, Stethoscope, Calendar, FileText, RefreshCw, Printer, Trash2, Clock, Send, ShieldAlert } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getStatusConfig, getFrequencyLabel, getDurationLabel, getRouteLabel } from '../utils/utils';
import { QuickActionsMenu, ModuleLinkBadge } from '@/carewell/utils/crossModuleNavigation';

export function PrescriptionDetailSheet({
  prescription,
  open,
  onOpenChange,
  onDelete,
  onStatusChange,
  onSendToPharmacy,
  onCheckInteractions
}) {
  if (!prescription) return null;

  const statusConfig = getStatusConfig(prescription.status);

  const handleStatusChange = (newStatus) => {
    onStatusChange?.(prescription.id, newStatus);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              Prescription Details
            </SheetTitle>
            <Badge className={statusConfig.color} variant="outline">
              {statusConfig.label}
            </Badge>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-6 pr-4">
            {/* Patient Info */}
            <div className="p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{prescription.patientName}</p>
                    <p className="text-sm text-muted-foreground">{prescription.patientMrn}</p>
                  </div>
                </div>
                <QuickActionsMenu
                  patientId={prescription.patientMrn}
                  patientName={prescription.patientName}
                  actions={['viewPatient', 'scheduleAppointment', 'orderLabTest', 'viewInvoices']}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Stethoscope className="w-4 h-4" />
                  <span>{prescription.doctor}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(prescription.prescribedDate), 'dd MMM yyyy')}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5"
                onClick={onSendToPharmacy}
              >
                <Send className="w-4 h-4" />
                Send to Pharmacy
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5"
                onClick={onCheckInteractions}
              >
                <ShieldAlert className="w-4 h-4" />
                Check Interactions
              </Button>
            </div>

            {/* Diagnosis */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Diagnosis
              </h4>
              <p className="text-sm text-muted-foreground p-3 bg-secondary/20 rounded-lg">
                {prescription.diagnosis}
              </p>
            </div>

            <Separator />

            {/* Medicines */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Pill className="w-4 h-4" />
                Medicines ({prescription.medicines.length})
              </h4>
              <div className="space-y-3">
                {prescription.medicines.map((med, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg bg-background">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Pill className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{med.name}</p>
                          <p className="text-xs text-muted-foreground">{med.dosage}</p>
                        </div>
                      </div>
                      {med.quantity && (
                        <Badge variant="outline" className="text-xs">
                          Qty: {med.quantity}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                      <div className="p-2 bg-secondary/30 rounded">
                        <p className="text-muted-foreground">Frequency</p>
                        <p className="font-medium">{getFrequencyLabel(med.frequency)}</p>
                      </div>
                      <div className="p-2 bg-secondary/30 rounded">
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-medium">{getDurationLabel(med.duration)}</p>
                      </div>
                      <div className="p-2 bg-secondary/30 rounded">
                        <p className="text-muted-foreground">Route</p>
                        <p className="font-medium">{getRouteLabel(med.route)}</p>
                      </div>
                    </div>

                    {med.instructions && (
                      <p className="text-xs text-muted-foreground mt-3 p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-900 italic">
                        "{med.instructions}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Refills */}
            {prescription.refillsRemaining > 0 && (
              <>
                <Separator />
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      {prescription.refillsRemaining} refill{prescription.refillsRemaining > 1 ? 's' : ''} remaining
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="text-green-600 border-green-300">
                    Request Refill
                  </Button>
                </div>
              </>
            )}

            {/* Notes */}
            {prescription.notes && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground p-3 bg-secondary/20 rounded-lg">
                    {prescription.notes}
                  </p>
                </div>
              </>
            )}

            {/* Status Actions */}
            <Separator />
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Update Status
              </h4>
              <div className="flex flex-wrap gap-2">
                {prescription.status !== 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 border-green-300"
                    onClick={() => handleStatusChange('active')}
                  >
                    Mark Active
                  </Button>
                )}
                {prescription.status !== 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-300"
                    onClick={() => handleStatusChange('completed')}
                  >
                    Mark Completed
                  </Button>
                )}
                {prescription.status !== 'on-hold' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-amber-600 border-amber-300"
                    onClick={() => handleStatusChange('on-hold')}
                  >
                    Put On Hold
                  </Button>
                )}
                {prescription.status !== 'discontinued' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300"
                    onClick={() => handleStatusChange('discontinued')}
                  >
                    Discontinue
                  </Button>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 pt-4 border-t mt-4">
          <Button variant="outline" className="flex-1 gap-2">
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => onDelete?.(prescription.id)}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
