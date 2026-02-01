import * as React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { addMonths } from 'date-fns';
import { X } from 'lucide-react';
import { useFormValidationToast } from '../../hooks/useFormValidationToast';

const medicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required'),
  genericName: z.string().min(1, 'Generic name is required'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  reorderLevel: z.number().min(1, 'Reorder level is required'),
  batchNumber: z.string().min(1, 'Batch number is required'),
  costPrice: z.number().min(0, 'Cost price is required'),
  sellingPrice: z.number().min(0, 'Selling price is required'),
  supplier: z.string().min(1, 'Supplier is required'),
  location: z.string().optional(),
  manufacturer: z.string().optional(),
});

export function AddMedicineDialog({ open, onOpenChange, onAdd, categories, suppliers }) {
  const { showValidationErrors } = useFormValidationToast();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      unit: 'tablets',
      quantity: 0,
      reorderLevel: 50,
      costPrice: 0,
      sellingPrice: 0,
    }
  });

  const handleOpenChange = (value) => {
    if (!value) {
      reset();
    }
    onOpenChange(value);
  };

  const onSubmit = (data) => {
    console.log('Adding medicine:', data);
    onAdd({
      ...data,
      expiryDate: addMonths(new Date(), 12),
    });
    reset();
    onOpenChange(false);
  };

  const onError = (errors) => {
    showValidationErrors(errors);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="bg-transparent border-0 p-2 min-w-[620px]">
        <div className="bg-card h-full rounded-lg border flex flex-col">
          <SheetHeader className="space-y-4 p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle>Add New Medicine</SheetTitle>
              <Button variant="ghost" size="icon" onClick={() => handleOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 p-4">
            <form id="add-medicine-form" onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Medicine Name *</Label>
                  <Input id="name" {...register('name')} placeholder="e.g., Paracetamol 500mg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genericName">Generic Name *</Label>
                  <Input id="genericName" {...register('genericName')} placeholder="e.g., Acetaminophen" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select onValueChange={(v) => setValue('category', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input id="quantity" type="number" {...register('quantity', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Unit *</Label>
                  <Select defaultValue="tablets" onValueChange={(v) => setValue('unit', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tablets">Tablets</SelectItem>
                      <SelectItem value="capsules">Capsules</SelectItem>
                      <SelectItem value="ml">ML</SelectItem>
                      <SelectItem value="vials">Vials</SelectItem>
                      <SelectItem value="strips">Strips</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reorderLevel">Reorder Level *</Label>
                  <Input id="reorderLevel" type="number" {...register('reorderLevel', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost Price (₹) *</Label>
                  <Input id="costPrice" type="number" step="0.01" {...register('costPrice', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price (₹) *</Label>
                  <Input id="sellingPrice" type="number" step="0.01" {...register('sellingPrice', { valueAsNumber: true })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batchNumber">Batch Number *</Label>
                  <Input id="batchNumber" {...register('batchNumber')} placeholder="e.g., PCM-2024-001" />
                </div>
                <div className="space-y-2">
                  <Label>Supplier *</Label>
                  <Select onValueChange={(v) => setValue('supplier', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(sup => (
                        <SelectItem key={sup.id} value={sup.name}>{sup.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Storage Location</Label>
                  <Input id="location" {...register('location')} placeholder="e.g., A1-01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input id="manufacturer" {...register('manufacturer')} placeholder="e.g., Sun Pharma" />
                </div>
              </div>
            </form>
          </ScrollArea>

          <div className="p-4 border-t flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" form="add-medicine-form">Add Medicine</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
