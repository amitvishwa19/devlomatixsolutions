import * as React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Pill, AlertCircle, X } from 'lucide-react';
import { useFormValidationToast } from '../../hooks/useFormValidationToast';

const dispenseSchema = z.object({
  patientName: z.string().min(1, 'Patient name is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  medicineId: z.string().min(1, 'Medicine is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  prescriptionId: z.string().optional(),
  dispensedBy: z.string().min(1, 'Dispensed by is required'),
});

export function DispenseDialog({ open, onOpenChange, inventory, onDispense }) {
  const { showValidationErrors } = useFormValidationToast();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedMedicine, setSelectedMedicine] = React.useState(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(dispenseSchema),
    defaultValues: {
      quantity: 1,
      dispensedBy: 'Dr. Patel',
    }
  });

  const quantity = watch('quantity');

  const handleOpenChange = (value) => {
    if (!value) {
      reset();
      setSelectedMedicine(null);
      setSearchQuery('');
    }
    onOpenChange(value);
  };

  const filteredMedicines = React.useMemo(() => {
    if (!searchQuery) return inventory.slice(0, 5);
    return inventory.filter(m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [inventory, searchQuery]);

  const handleMedicineSelect = (medicine) => {
    setSelectedMedicine(medicine);
    setValue('medicineId', medicine.id);
    setSearchQuery(medicine.name);
  };

  const onSubmit = (data) => {
    console.log('Dispensing:', data);
    onDispense({
      ...data,
      medicineName: selectedMedicine.name,
    });
    reset();
    setSelectedMedicine(null);
    setSearchQuery('');
    onOpenChange(false);
  };

  const onError = (errors) => {
    showValidationErrors(errors);
  };

  const isLowStock = selectedMedicine && quantity > selectedMedicine.quantity;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="bg-transparent border-0 p-2 min-w-[520px]">
        <div className="bg-card h-full rounded-lg border flex flex-col">
          <SheetHeader className="space-y-4 p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle>Dispense Medicine</SheetTitle>
              <Button variant="ghost" size="icon" onClick={() => handleOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 p-4">
            <form id="dispense-form" onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Patient Name *</Label>
                  <Input id="patientName" {...register('patientName')} placeholder="Enter patient name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient ID *</Label>
                  <Input id="patientId" {...register('patientId')} placeholder="e.g., P001" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Medicine *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search medicine..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {searchQuery && !selectedMedicine && (
                  <div className="border rounded-lg mt-2 max-h-48 overflow-y-auto">
                    {filteredMedicines.map(med => (
                      <div
                        key={med.id}
                        className="p-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                        onClick={() => handleMedicineSelect(med)}
                      >
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{med.name}</p>
                            <p className="text-xs text-muted-foreground">{med.genericName}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{med.quantity} available</Badge>
                      </div>
                    ))}
                  </div>
                )}
                {selectedMedicine && (
                  <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedMedicine.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedMedicine.genericName}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{selectedMedicine.quantity} in stock</Badge>
                      <p className="text-xs text-muted-foreground mt-1">₹{selectedMedicine.sellingPrice} per unit</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input id="quantity" type="number" {...register('quantity', { valueAsNumber: true })} min={1} />
                  {isLowStock && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Exceeds available stock
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prescriptionId">Prescription ID</Label>
                  <Input id="prescriptionId" {...register('prescriptionId')} placeholder="e.g., RX-001" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dispensed By *</Label>
                <Select defaultValue="Dr. Patel" onValueChange={(v) => setValue('dispensedBy', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Patel">Dr. Patel</SelectItem>
                    <SelectItem value="Dr. Sharma">Dr. Sharma</SelectItem>
                    <SelectItem value="Dr. Gupta">Dr. Gupta</SelectItem>
                    <SelectItem value="Pharmacist - Ravi">Pharmacist - Ravi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedMedicine && quantity > 0 && (
                <div className="p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Amount</span>
                    <span className="text-lg font-bold">₹{(selectedMedicine.sellingPrice * quantity).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </form>
          </ScrollArea>

          <div className="p-4 border-t flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" form="dispense-form" disabled={isLowStock || !selectedMedicine}>
              Dispense
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
