import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { labTests, patients } from '@/data/mockLabData';
import { FlaskConical, Barcode } from 'lucide-react';

const specimenTypes = ['Blood', 'Urine', 'Stool', 'Saliva', 'CSF', 'Tissue', 'Sputum', 'Swab'];

const testOptions = labTests.filter(t => t.isActive).map(test => ({
  value: test.id,
  label: `${test.testCode} - ${test.testName}`,
  description: `${test.category} • ${test.specimenType}${test.price ? ` • $${test.price}` : ''}`,
}));

const specimenOptions = specimenTypes.map(type => ({
  value: type,
  label: type,
}));

export function NewOrderDialog({ open, onOpenChange, onCreateOrder }) {
  const [patientId, setPatientId] = useState('');
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [selectedSpecimenTypes, setSelectedSpecimenTypes] = useState([]);
  const [priority, setPriority] = useState('routine');
  const [orderedBy, setOrderedBy] = useState('');
  const [collectedBy, setCollectedBy] = useState('');

  const generateBarcode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BC-${timestamp}-${random}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const patient = patients.find(p => p.id === patientId);
    const selectedTests = labTests.filter(t => selectedTestIds.includes(t.id));
    
    if (!patient || selectedTests.length === 0) return;

    const specimenId = `SPEC-${String(Date.now()).slice(-6)}`;
    const barcode = generateBarcode();

    onCreateOrder({
      patient,
      tests: selectedTests,
      specimenId,
      specimenTypes: selectedSpecimenTypes,
      specimenTracking: {
        specimenId,
        barcode,
        type: selectedSpecimenTypes.join(', '),
        collectedAt: new Date(),
        collectedBy: collectedBy || 'Unknown',
        status: 'collected',
        chainOfCustody: [{
          id: crypto.randomUUID(),
          timestamp: new Date(),
          action: 'Specimen collected',
          performedBy: collectedBy || 'Unknown',
        }]
      },
      collectedAt: new Date(),
      status: 'pending',
      priority,
      orderedBy,
    });

    // Reset form
    setPatientId('');
    setSelectedTestIds([]);
    setSelectedSpecimenTypes([]);
    setPriority('routine');
    setOrderedBy('');
    setCollectedBy('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FlaskConical className="h-5 w-5 text-primary" />
            New Lab Order
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="patient">Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {patients.map(patient => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} ({patient.mrn})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Multi-select Tests */}
          <div className="space-y-2">
            <Label>Tests</Label>
            <MultiSelect
              options={testOptions}
              selected={selectedTestIds}
              onChange={setSelectedTestIds}
              placeholder="Select tests..."
              searchPlaceholder="Search tests..."
              emptyMessage="No tests found."
              maxDisplayed={4}
            />
          </div>

          {/* Multi-select Specimen Types */}
          <div className="space-y-2">
            <Label>Specimen Types</Label>
            <MultiSelect
              options={specimenOptions}
              selected={selectedSpecimenTypes}
              onChange={setSelectedSpecimenTypes}
              placeholder="Select specimen types..."
              searchPlaceholder="Search specimen types..."
              emptyMessage="No specimen types found."
              badgeVariant="outline"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="stat">STAT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collectedBy">Collected By</Label>
              <Input
                id="collectedBy"
                value={collectedBy}
                onChange={(e) => setCollectedBy(e.target.value)}
                placeholder="Phlebotomist name"
                className="bg-input border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderedBy">Ordered By</Label>
            <Input
              id="orderedBy"
              value={orderedBy}
              onChange={(e) => setOrderedBy(e.target.value)}
              placeholder="Dr. Name"
              className="bg-input border-border"
            />
          </div>

          {/* Barcode Preview */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border flex items-center gap-3">
            <Barcode className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Specimen barcode will be generated</div>
              <div className="font-mono text-sm">BC-XXXXXX-XXXX</div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!patientId || selectedTestIds.length === 0 || selectedSpecimenTypes.length === 0 || !orderedBy}
            >
              Create Order
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
