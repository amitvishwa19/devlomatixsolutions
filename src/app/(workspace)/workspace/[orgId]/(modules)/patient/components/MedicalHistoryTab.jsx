import React, { useState } from 'react';
import { Plus, History, Stethoscope, Scissors, Activity, Building, Syringe, AlertTriangle, Trash2, Save, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CONDITION_STATUSES, HISTORY_TYPES } from '../utils/types';
import { useToast } from '@/hooks/use-toast';

const TYPE_ICONS = {
  diagnosis: Stethoscope,
  surgery: Scissors,
  procedure: Activity,
  hospitalization: Building,
  vaccination: Syringe,
  injury: AlertTriangle,
};

export function MedicalHistoryTab({ patient, onUpdatePatient }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const [newCondition, setNewCondition] = useState({
    type: 'diagnosis',
    condition: '',
    diagnosedDate: null,
    status: 'ongoing',
    treatedBy: '',
    facility: '',
    notes: '',
  });

  const medicalHistory = patient?.medicalHistory || [];

  const handleAddCondition = () => {
    if (!newCondition.condition) {
      toast({ title: 'Condition required', description: 'Please enter the condition/diagnosis name.', variant: 'destructive' });
      return;
    }

    const condition = {
      id: `mh-${Date.now()}`,
      ...newCondition,
      diagnosedDate: newCondition.diagnosedDate || new Date(),
    };

    const updatedPatient = {
      ...patient,
      medicalHistory: [condition, ...(patient.medicalHistory || [])],
    };

    onUpdatePatient?.(updatedPatient);
    toast({ title: 'Medical history added', description: `${newCondition.condition} has been added to history.` });

    setNewCondition({
      type: 'diagnosis',
      condition: '',
      diagnosedDate: null,
      status: 'ongoing',
      treatedBy: '',
      facility: '',
      notes: '',
    });
    setShowAddDialog(false);
  };

  const handleDeleteCondition = (conditionId) => {
    const updatedPatient = {
      ...patient,
      medicalHistory: patient.medicalHistory.filter(c => c.id !== conditionId),
    };
    onUpdatePatient?.(updatedPatient);
    toast({ title: 'Entry removed', description: 'Medical history entry has been removed.' });
  };

  const handleUpdateStatus = (conditionId, newStatus) => {
    const updatedPatient = {
      ...patient,
      medicalHistory: patient.medicalHistory.map(c =>
        c.id === conditionId ? { ...c, status: newStatus } : c
      ),
    };
    onUpdatePatient?.(updatedPatient);
    toast({ title: 'Status updated', description: 'Condition status has been updated.' });
  };

  const getStatusInfo = (statusId) => CONDITION_STATUSES.find(s => s.id === statusId);
  const getTypeInfo = (typeId) => HISTORY_TYPES.find(t => t.id === typeId);

  // Group history by year
  const groupedHistory = medicalHistory.reduce((acc, item) => {
    const year = new Date(item.diagnosedDate).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {});

  const sortedYears = Object.keys(groupedHistory).sort((a, b) => b - a);

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold">Medical History</h4>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-3 h-3" />
          Add Entry
        </Button>
      </div>

      {medicalHistory.length > 0 ? (
        <div className="space-y-6">
          {sortedYears.map((year) => (
            <div key={year}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <h5 className="font-semibold text-sm">{year}</h5>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="relative pl-4 border-l-2 border-border ml-4 space-y-4">
                {groupedHistory[year]
                  .sort((a, b) => new Date(b.diagnosedDate) - new Date(a.diagnosedDate))
                  .map((condition) => {
                    const statusInfo = getStatusInfo(condition.status);
                    const typeInfo = getTypeInfo(condition.type);
                    const Icon = TYPE_ICONS[condition.type] || Stethoscope;

                    return (
                      <div
                        key={condition.id || condition.condition}
                        className="relative p-4 bg-secondary/30 rounded-lg border border-border ml-4"
                      >
                        {/* Timeline dot */}
                        <div className="absolute -left-[26px] top-4 w-4 h-4 rounded-full bg-primary border-2 border-background" />

                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                              condition.type === 'surgery' && "bg-purple-100 dark:bg-purple-950",
                              condition.type === 'diagnosis' && "bg-blue-100 dark:bg-blue-950",
                              condition.type === 'hospitalization' && "bg-amber-100 dark:bg-amber-950",
                              condition.type === 'vaccination' && "bg-green-100 dark:bg-green-950",
                              condition.type === 'injury' && "bg-red-100 dark:bg-red-950",
                              condition.type === 'procedure' && "bg-cyan-100 dark:bg-cyan-950",
                            )}>
                              <Icon className={cn(
                                "w-5 h-5",
                                condition.type === 'surgery' && "text-purple-600",
                                condition.type === 'diagnosis' && "text-blue-600",
                                condition.type === 'hospitalization' && "text-amber-600",
                                condition.type === 'vaccination' && "text-green-600",
                                condition.type === 'injury' && "text-red-600",
                                condition.type === 'procedure' && "text-cyan-600",
                              )} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm">{condition.condition}</p>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {typeInfo?.label || condition.type}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(condition.diagnosedDate), 'dd MMM yyyy')}
                              </p>
                              {condition.treatedBy && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Treated by: {condition.treatedBy}
                                </p>
                              )}
                              {condition.facility && (
                                <p className="text-xs text-muted-foreground">
                                  Facility: {condition.facility}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Select
                              value={condition.status}
                              onValueChange={(val) => handleUpdateStatus(condition.id, val)}
                            >
                              <SelectTrigger className={cn("h-7 w-auto text-xs", statusInfo?.color)}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CONDITION_STATUSES.map((status) => (
                                  <SelectItem key={status.id} value={status.id}>{status.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteCondition(condition.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {condition.notes && (
                          <p className="text-xs text-muted-foreground mt-3 p-2 bg-background rounded border border-border">
                            {condition.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">No medical history recorded</p>
      )}

      {/* Add Condition Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Add Medical History
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <Select
                  value={newCondition.type}
                  onValueChange={(val) => setNewCondition({ ...newCondition, type: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HISTORY_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <Select
                  value={newCondition.status}
                  onValueChange={(val) => setNewCondition({ ...newCondition, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_STATUSES.map((status) => (
                      <SelectItem key={status.id} value={status.id}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Condition / Diagnosis *</Label>
              <Input
                placeholder="e.g., Type 2 Diabetes, ACL Surgery"
                value={newCondition.condition}
                onChange={(e) => setNewCondition({ ...newCondition, condition: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {newCondition.diagnosedDate
                      ? format(newCondition.diagnosedDate, 'dd MMM yyyy')
                      : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={newCondition.diagnosedDate}
                    onSelect={(date) => setNewCondition({ ...newCondition, diagnosedDate: date })}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Treated By</Label>
                <Input
                  placeholder="Doctor's name"
                  value={newCondition.treatedBy}
                  onChange={(e) => setNewCondition({ ...newCondition, treatedBy: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Facility</Label>
                <Input
                  placeholder="Hospital/Clinic name"
                  value={newCondition.facility}
                  onChange={(e) => setNewCondition({ ...newCondition, facility: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Notes</Label>
              <Textarea
                placeholder="Additional notes..."
                value={newCondition.notes}
                onChange={(e) => setNewCondition({ ...newCondition, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddCondition} className="gap-2">
              <Save className="w-4 h-4" />
              Add to History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
