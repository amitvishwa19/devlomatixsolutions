import React, { useState } from 'react';
import { Plus, Pill, Trash2, Save, X, Printer, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { format, addDays } from 'date-fns';
import { DOSAGE_FREQUENCIES, DURATION_OPTIONS, MEDICINE_ROUTES, COMMON_MEDICINES } from '../types';
import { useToast } from '@/hooks/use-toast';

export function PrescriptionsTab({ patient, onUpdatePatient }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const { toast } = useToast();

  const [newPrescription, setNewPrescription] = useState({
    doctor: '',
    diagnosis: '',
    notes: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', route: 'oral', instructions: '' }],
  });

  const prescriptions = patient?.prescriptions || [];

  const addMedicine = () => {
    setNewPrescription(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '', route: 'oral', instructions: '' }],
    }));
  };

  const removeMedicine = (index) => {
    setNewPrescription(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const updateMedicine = (index, field, value) => {
    setNewPrescription(prev => ({
      ...prev,
      medicines: prev.medicines.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      ),
    }));
  };

  const handleAddPrescription = () => {
    if (!newPrescription.doctor) {
      toast({ title: 'Doctor required', description: 'Please enter the prescribing doctor.', variant: 'destructive' });
      return;
    }

    const validMedicines = newPrescription.medicines.filter(m => m.name && m.dosage);
    if (validMedicines.length === 0) {
      toast({ title: 'Medicines required', description: 'Please add at least one medicine with name and dosage.', variant: 'destructive' });
      return;
    }

    const prescription = {
      id: `rx-${Date.now()}`,
      date: new Date(),
      doctor: newPrescription.doctor,
      diagnosis: newPrescription.diagnosis,
      notes: newPrescription.notes,
      medicines: validMedicines,
      status: 'active',
      refillsRemaining: 0,
    };

    const updatedPatient = {
      ...patient,
      prescriptions: [prescription, ...(patient.prescriptions || [])],
    };

    onUpdatePatient?.(updatedPatient);
    toast({ title: 'Prescription added', description: `Prescription with ${validMedicines.length} medicine(s) created.` });
    
    setNewPrescription({
      doctor: '',
      diagnosis: '',
      notes: '',
      medicines: [{ name: '', dosage: '', frequency: '', duration: '', route: 'oral', instructions: '' }],
    });
    setShowAddDialog(false);
  };

  const handleDeletePrescription = (rxId) => {
    const updatedPatient = {
      ...patient,
      prescriptions: patient.prescriptions.filter(rx => rx.id !== rxId),
    };
    onUpdatePatient?.(updatedPatient);
    toast({ title: 'Prescription deleted', description: 'Prescription has been removed.' });
  };

  const getDurationLabel = (duration) => {
    const option = DURATION_OPTIONS.find(d => d.id === duration);
    return option?.label || duration;
  };

  const getFrequencyLabel = (frequency) => {
    const option = DOSAGE_FREQUENCIES.find(f => f.id === frequency);
    return option?.label || frequency;
  };

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold">Prescriptions</h4>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-3 h-3" />
          New Prescription
        </Button>
      </div>

      {prescriptions.length > 0 ? (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="p-4 bg-secondary/30 rounded-lg border border-border">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{rx.doctor}</p>
                    <Badge variant="outline" className={
                      rx.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                    }>
                      {rx.status || 'active'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(rx.date), 'dd MMM yyyy, HH:mm')}
                  </p>
                  {rx.diagnosis && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Diagnosis: {rx.diagnosis}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {rx.medicines.length} medicine{rx.medicines.length > 1 ? 's' : ''}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDeletePrescription(rx.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {rx.medicines.map((med, index) => (
                  <div key={index} className="flex items-center justify-between text-sm bg-background rounded p-3 border border-border">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Pill className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{med.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {med.dosage} • {getFrequencyLabel(med.frequency)} • {med.route || 'Oral'}
                        </p>
                        {med.instructions && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            "{med.instructions}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">{getDurationLabel(med.duration)}</p>
                      {med.refillsRemaining > 0 && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          <RefreshCw className="w-3 h-3" />
                          {med.refillsRemaining} refills
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {rx.notes && (
                <p className="text-xs text-muted-foreground mt-3 p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-900">
                  <strong>Notes:</strong> {rx.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">No prescriptions</p>
      )}

      {/* Add Prescription Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              New Prescription
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Prescription Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Prescribing Doctor *</Label>
                <Input
                  placeholder="Dr. Name"
                  value={newPrescription.doctor}
                  onChange={(e) => setNewPrescription({ ...newPrescription, doctor: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Diagnosis</Label>
                <Input
                  placeholder="e.g., Upper Respiratory Infection"
                  value={newPrescription.diagnosis}
                  onChange={(e) => setNewPrescription({ ...newPrescription, diagnosis: e.target.value })}
                />
              </div>
            </div>

            <Separator />

            {/* Medicines Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Medicines</Label>
                <Button variant="outline" size="sm" onClick={addMedicine} className="gap-1">
                  <Plus className="w-3 h-3" />
                  Add Medicine
                </Button>
              </div>

              {newPrescription.medicines.map((medicine, index) => (
                <div key={index} className="p-4 border border-border rounded-lg space-y-4 bg-secondary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Medicine {index + 1}</span>
                    {newPrescription.medicines.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive"
                        onClick={() => removeMedicine(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Medicine Name *</Label>
                      <Input
                        placeholder="e.g., Amoxicillin"
                        value={medicine.name}
                        onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                        list={`medicines-${index}`}
                      />
                      <datalist id={`medicines-${index}`}>
                        {COMMON_MEDICINES.map(m => <option key={m} value={m} />)}
                      </datalist>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Dosage *</Label>
                      <Input
                        placeholder="e.g., 500mg"
                        value={medicine.dosage}
                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Frequency</Label>
                      <Select 
                        value={medicine.frequency} 
                        onValueChange={(val) => updateMedicine(index, 'frequency', val)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {DOSAGE_FREQUENCIES.map((freq) => (
                            <SelectItem key={freq.id} value={freq.id}>{freq.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Duration</Label>
                      <Select 
                        value={medicine.duration} 
                        onValueChange={(val) => updateMedicine(index, 'duration', val)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATION_OPTIONS.map((dur) => (
                            <SelectItem key={dur.id} value={dur.id}>{dur.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Route</Label>
                      <Select 
                        value={medicine.route} 
                        onValueChange={(val) => updateMedicine(index, 'route', val)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {MEDICINE_ROUTES.map((route) => (
                            <SelectItem key={route.id} value={route.id}>{route.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Special Instructions</Label>
                    <Input
                      placeholder="e.g., Take with food, avoid alcohol"
                      value={medicine.instructions}
                      onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-xs">Additional Notes</Label>
              <Textarea
                placeholder="Any additional instructions or notes..."
                value={newPrescription.notes}
                onChange={(e) => setNewPrescription({ ...newPrescription, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddPrescription} className="gap-2">
              <Save className="w-4 h-4" />
              Save Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
