import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// Note: This creates a BILL (dynamic, editable during care)
// Invoices are generated from finalized bills and are immutable
import { z } from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, FileText, X } from 'lucide-react';
import { useFormValidationToast } from '@/carewell/hooks/useFormValidationToast';
import { servicesCatalog } from './mockInvoices';
import { INVOICE_STATUS, GST_RATES, INSURANCE_PROVIDERS } from './types';
import { generateInvoiceId, calculateInvoiceTotals, formatCurrency } from './utils';

const invoiceSchema = z.object({
  patientName: z.string().min(1, 'Patient name is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  patientPhone: z.string().min(10, 'Valid phone number required'),
  dueDate: z.string().min(1, 'Due date is required'),
  gstRate: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Price must be positive'),
    hsn: z.string().optional(),
  })).min(1, 'At least one item is required'),
  discount: z.number().min(0).optional(),
  notes: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceClaimNumber: z.string().optional(),
});

export function NewInvoiceDialog({ onAddInvoice, existingInvoices }) {
  const [open, setOpen] = useState(false);
  const { showValidationErrors } = useFormValidationToast();

  const form = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      patientName: '',
      patientId: '',
      patientPhone: '',
      dueDate: '',
      gstRate: 'gst18',
      items: [{ description: '', quantity: 1, unitPrice: 0, hsn: '9993' }],
      discount: 0,
      notes: '',
      insuranceProvider: '',
      insuranceClaimNumber: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchItems = form.watch('items');
  const watchDiscount = form.watch('discount') || 0;
  const watchGstRate = form.watch('gstRate');

  const selectedGstRate = GST_RATES.find(g => g.id === watchGstRate)?.rate || 0.18;

  const itemsWithTotals = watchItems.map((item) => ({
    ...item,
    total: (item.quantity || 0) * (item.unitPrice || 0),
  }));

  const totals = calculateInvoiceTotals(itemsWithTotals, selectedGstRate, watchDiscount);

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      form.reset();
    }
    setOpen(isOpen);
  };

  const onSubmit = (data) => {
    console.log('New invoice data:', data);

    const items = data.items.map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));

    const calculatedTotals = calculateInvoiceTotals(items, selectedGstRate, data.discount || 0);

    const newInvoice = {
      id: generateInvoiceId(existingInvoices),
      patientId: data.patientId,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      appointmentId: null,
      dateIssued: new Date().toISOString().split('T')[0],
      dueDate: data.dueDate,
      status: INVOICE_STATUS.DRAFT,
      items,
      ...calculatedTotals,
      amountPaid: 0,
      balance: calculatedTotals.total,
      payments: [],
      notes: data.notes || '',
      insuranceClaim: data.insuranceProvider ? {
        provider: INSURANCE_PROVIDERS.find(p => p.id === data.insuranceProvider)?.name || data.insuranceProvider,
        claimNumber: data.insuranceClaimNumber || '',
        status: 'pending',
        amount: 0,
      } : null,
      gstNumber: null,
    };

    onAddInvoice(newInvoice);
    setOpen(false);
    form.reset();
  };

  const addServiceItem = (serviceId) => {
    const service = servicesCatalog.find((s) => s.id === serviceId);
    if (service) {
      append({
        description: service.name,
        quantity: 1,
        unitPrice: service.price,
        hsn: service.hsn || '9993',
      });
    }
  };

  return (
    <>
      <Button className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" />
        New Bill
      </Button>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="bg-transparent border-0 p-2 min-w-[700px]">
          <div className="bg-card h-full rounded-lg border flex flex-col">
            <SheetHeader className="space-y-1 p-4 pb-2 border-b">
              <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Create New Bill
                </SheetTitle>
                <Button variant="ghost" size="icon" onClick={() => handleOpenChange(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1 p-4">
              <Form {...form}>
                <form
                  id="new-invoice-form"
                  onSubmit={form.handleSubmit(onSubmit, showValidationErrors)}
                  className="space-y-6"
                >
                  {/* Patient Info */}
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="patientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter patient name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient ID</FormLabel>
                          <FormControl>
                            <Input placeholder="P001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="patientPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="9876543210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gstRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GST Rate</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select GST rate" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {GST_RATES.map((rate) => (
                                <SelectItem key={rate.id} value={rate.id}>
                                  {rate.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Insurance */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="insuranceProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Insurance Provider (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select provider" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INSURANCE_PROVIDERS.map((provider) => (
                                <SelectItem key={provider.id} value={provider.id}>
                                  {provider.name}
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
                      name="insuranceClaimNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Claim Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="CLM-2024-XXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Quick Add Service */}
                  <div className="space-y-2">
                    <FormLabel>Quick Add Service</FormLabel>
                    <Select onValueChange={addServiceItem}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {servicesCatalog.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - {formatCurrency(service.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Line Items */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel>Line Items</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ description: '', quantity: 1, unitPrice: 0, hsn: '9993' })}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Item
                      </Button>
                    </div>

                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-start">
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Description" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.hsn`}
                          render={({ field }) => (
                            <FormItem className="w-20">
                              <FormControl>
                                <Input placeholder="HSN" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem className="w-16">
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="Qty"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem className="w-24">
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="Price"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="w-24 pt-2 text-right font-medium text-sm">
                          {formatCurrency(itemsWithTotals[index]?.total || 0)}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => fields.length > 1 && remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">GST ({GST_RATES.find(g => g.id === watchGstRate)?.label || '18%'})</span>
                      <span>{formatCurrency(totals.gst)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <FormField
                        control={form.control}
                        name="discount"
                        render={({ field }) => (
                          <Input
                            type="number"
                            min="0"
                            className="w-24 h-8 text-right"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        )}
                      />
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                      <span>Total</span>
                      <span>{formatCurrency(totals.total)}</span>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any notes about this invoice..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </ScrollArea>

            <div className="p-4 border-t flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" form="new-invoice-form">
                Create Invoice
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
