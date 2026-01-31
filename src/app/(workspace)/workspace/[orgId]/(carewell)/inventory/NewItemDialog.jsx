import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Package, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { useFormValidationToast } from '@/carewell/hooks/useFormValidationToast';
import { INVENTORY_CATEGORIES, STORAGE_LOCATIONS, UNITS, SUPPLIERS } from './types';
import { generateSKU } from './utils';

const itemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  quantity: z.coerce.number().min(0, 'Quantity must be 0 or more'),
  reorderLevel: z.coerce.number().min(0, 'Reorder level must be 0 or more'),
  costPrice: z.coerce.number().min(0, 'Cost price must be 0 or more'),
  sellingPrice: z.coerce.number().min(0, 'Selling price must be 0 or more'),
  location: z.string().min(1, 'Location is required'),
  supplier: z.string().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

export function NewItemDialog({ open, onOpenChange, onSave, editItem, existingItems }) {
  const [activeTab, setActiveTab] = React.useState('basic');
  const showValidationToast = useFormValidationToast();

  const form = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      unit: 'piece',
      quantity: 0,
      reorderLevel: 10,
      costPrice: 0,
      sellingPrice: 0,
      location: 'main_store',
      supplier: '',
      batchNumber: '',
      expiryDate: '',
      notes: '',
      isActive: true,
    },
  });

  React.useEffect(() => {
    if (editItem) {
      form.reset({
        name: editItem.name || '',
        description: editItem.description || '',
        category: editItem.category || '',
        unit: editItem.unit || 'piece',
        quantity: editItem.quantity || 0,
        reorderLevel: editItem.reorderLevel || 10,
        costPrice: editItem.costPrice || 0,
        sellingPrice: editItem.sellingPrice || 0,
        location: editItem.location || 'main_store',
        supplier: editItem.supplier || '',
        batchNumber: editItem.batchNumber || '',
        expiryDate: editItem.expiryDate ? format(new Date(editItem.expiryDate), 'yyyy-MM-dd') : '',
        notes: editItem.notes || '',
        isActive: editItem.isActive ?? true,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        category: '',
        unit: 'piece',
        quantity: 0,
        reorderLevel: 10,
        costPrice: 0,
        sellingPrice: 0,
        location: 'main_store',
        supplier: '',
        batchNumber: '',
        expiryDate: '',
        notes: '',
        isActive: true,
      });
    }
    setActiveTab('basic');
  }, [editItem, open, form]);

  const onSubmit = (data) => {
    console.log('Inventory Item Form Data:', data);
    
    const itemData = {
      ...data,
      id: editItem?.id || `inv_${Date.now()}`,
      sku: editItem?.sku || generateSKU(data.category, existingItems || []),
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      lastRestocked: editItem?.lastRestocked || new Date(),
    };
    
    onSave(itemData);
    onOpenChange(false);
  };

  const onError = (errors) => {
    showValidationToast(errors);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[720px] p-0 border-0 bg-transparent">
        <div className="h-full flex flex-col bg-card rounded-l-xl border shadow-lg">
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <SheetTitle>{editItem ? 'Edit Item' : 'Add New Item'}</SheetTitle>
                <SheetDescription>
                  {editItem ? 'Update inventory item details' : 'Add a new item to inventory'}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="flex-1 flex flex-col overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-2 border-b">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="stock">Stock & Pricing</TabsTrigger>
                    <TabsTrigger value="additional">Additional</TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-6">
                    <TabsContent value="basic" className="mt-0 space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Item Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter item name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Item description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {INVENTORY_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                      {cat.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="unit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {UNITS.map((unit) => (
                                    <SelectItem key={unit.id} value={unit.id}>
                                      {unit.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Storage Location *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {STORAGE_LOCATIONS.map((loc) => (
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
                    </TabsContent>

                    <TabsContent value="stock" className="mt-0 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Quantity *</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="reorderLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reorder Level *</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="costPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cost Price (₹) *</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sellingPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Selling Price (₹) *</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="batchNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Batch Number</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., BATCH-2024-001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="additional" className="mt-0 space-y-4">
                      <FormField
                        control={form.control}
                        name="supplier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supplier</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select supplier" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SUPPLIERS.map((sup) => (
                                  <SelectItem key={sup.id} value={sup.id}>
                                    {sup.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Additional notes about this item" 
                                rows={4}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Active Status</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Inactive items won't appear in regular inventory views
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </div>
                </ScrollArea>
              </Tabs>

              <div className="px-6 py-4 border-t flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {editItem ? 'Update Item' : 'Add Item'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
