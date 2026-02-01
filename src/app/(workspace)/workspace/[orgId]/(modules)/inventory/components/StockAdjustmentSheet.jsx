import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowUpDown, Plus, Minus, ArrowRightLeft, RotateCcw, AlertTriangle, Save } from 'lucide-react';

import { MOVEMENT_TYPES, STORAGE_LOCATIONS, getUnitById, formatCurrency } from '../utils';
import { useFormValidationToast } from '../../hooks/useFormValidationToast';

const adjustmentSchema = z.object({
  type: z.string().min(1, 'Movement type is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  reference: z.string().min(1, 'Reference is required'),
  notes: z.string().optional(),
  targetLocation: z.string().optional(),
});

const ADJUSTMENT_TYPES = [
  { id: 'adjustment_add', name: 'Stock Addition', icon: Plus, description: 'Add stock to inventory' },
  { id: 'adjustment_remove', name: 'Stock Removal', icon: Minus, description: 'Remove stock from inventory' },
  { id: 'transfer_out', name: 'Transfer Out', icon: ArrowRightLeft, description: 'Transfer to another location' },
  { id: 'return', name: 'Customer Return', icon: RotateCcw, description: 'Return from customer' },
  { id: 'damage', name: 'Damage/Loss', icon: AlertTriangle, description: 'Mark as damaged or lost' },
  { id: 'expired', name: 'Expired', icon: AlertTriangle, description: 'Mark as expired' },
];

export function StockAdjustmentSheet({ item, open, onOpenChange, onAdjust }) {
  const showValidationToast = useFormValidationToast();

  const form = useForm({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      type: '',
      quantity: 1,
      reference: '',
      notes: '',
      targetLocation: '',
    },
  });

  const selectedType = form.watch('type');
  const quantity = form.watch('quantity');
  const unit = item ? getUnitById(item.unit) : { name: 'unit' };

  const isReducing = ['adjustment_remove', 'transfer_out', 'damage', 'expired'].includes(selectedType);
  const isTransfer = selectedType === 'transfer_out';

  const newQuantity = isReducing
    ? (item?.quantity || 0) - (quantity || 0)
    : (item?.quantity || 0) + (quantity || 0);

  React.useEffect(() => {
    if (open) {
      form.reset({
        type: '',
        quantity: 1,
        reference: `ADJ-${Date.now().toString().slice(-6)}`,
        notes: '',
        targetLocation: '',
      });
    }
  }, [open, form]);

  const onSubmit = (data) => {
    if (!item) return;

    if (isReducing && data.quantity > item.quantity) {
      form.setError('quantity', {
        message: `Cannot remove more than available stock (${item.quantity})`
      });
      return;
    }

    console.log('Stock Adjustment Data:', data);

    const movement = {
      id: `mov_${Date.now()}`,
      itemId: item.id,
      type: data.type,
      quantity: data.quantity,
      previousQty: item.quantity,
      newQty: newQuantity,
      reference: data.reference,
      notes: data.notes,
      targetLocation: data.targetLocation,
      performedBy: 'Current User',
      date: new Date(),
    };

    onAdjust(item.id, newQuantity, movement);
    onOpenChange(false);
  };

  const onError = (errors) => {
    showValidationToast(errors);
  };

  if (!item) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[620px] p-0 border-0 bg-transparent">
        <div className="h-full flex flex-col bg-card rounded-l-xl border shadow-lg">
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ArrowUpDown className="w-5 h-5 text-primary" />
              </div>
              <div>
                <SheetTitle>Adjust Stock</SheetTitle>
                <SheetDescription>{item.name} ({item.sku})</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                  {/* Current Stock Info */}
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Stock</p>
                          <p className="text-2xl font-bold">{item.quantity} {unit.name}</p>
                        </div>
                        {selectedType && (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">New Stock</p>
                            <p className={`text-2xl font-bold ${newQuantity < 0 ? 'text-red-600' :
                                newQuantity <= item.reorderLevel ? 'text-amber-600' :
                                  'text-green-600'
                              }`}>
                              {newQuantity} {unit.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Movement Type Selection */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adjustment Type *</FormLabel>
                        <div className="grid grid-cols-2 gap-3">
                          {ADJUSTMENT_TYPES.map((type) => (
                            <Card
                              key={type.id}
                              className={`cursor-pointer transition-all ${field.value === type.id
                                  ? 'border-primary ring-2 ring-primary/20'
                                  : 'hover:border-primary/50'
                                }`}
                              onClick={() => field.onChange(type.id)}
                            >
                              <CardContent className="p-3 flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${['adjustment_add', 'return'].includes(type.id)
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-red-100 text-red-600'
                                  }`}>
                                  <type.icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{type.name}</p>
                                  <p className="text-xs text-muted-foreground">{type.description}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Quantity */}
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity *</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              max={isReducing ? item.quantity : undefined}
                              {...field}
                            />
                            <span className="text-muted-foreground">{unit.name}</span>
                          </div>
                        </FormControl>
                        {isReducing && (
                          <p className="text-xs text-muted-foreground">
                            Maximum: {item.quantity} {unit.name}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Target Location (for transfers) */}
                  {isTransfer && (
                    <FormField
                      control={form.control}
                      name="targetLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transfer To *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select destination" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {STORAGE_LOCATIONS.filter(l => l.id !== item.location).map((loc) => (
                                <SelectItem key={loc.id} value={loc.id}>
                                  {loc.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Reference */}
                  <FormField
                    control={form.control}
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., PO-2024-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Reason for adjustment..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Warning for low stock */}
                  {selectedType && newQuantity >= 0 && newQuantity <= item.reorderLevel && (
                    <Card className="border-amber-200 bg-amber-50">
                      <CardContent className="p-4 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <div>
                          <p className="font-medium text-amber-800">Low Stock Warning</p>
                          <p className="text-sm text-amber-700">
                            New quantity will be at or below reorder level ({item.reorderLevel})
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Error for negative stock */}
                  {selectedType && newQuantity < 0 && (
                    <Card className="border-red-200 bg-red-50">
                      <CardContent className="p-4 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="font-medium text-red-800">Invalid Quantity</p>
                          <p className="text-sm text-red-700">
                            Cannot reduce stock below zero
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>

              <div className="px-6 py-4 border-t flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedType || newQuantity < 0}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Confirm Adjustment
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
