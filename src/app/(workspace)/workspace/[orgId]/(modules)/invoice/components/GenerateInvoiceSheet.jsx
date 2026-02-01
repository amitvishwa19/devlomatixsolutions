import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileText, X, Plus, Trash2 } from 'lucide-react';
import { INVOICE_TYPE, INVOICE_TYPE_LABELS, INVOICE_STATUS } from '../utils/types';
import { generateInvoiceNumber, formatCurrency } from '../utils/utils';
import { useFormValidationToast } from '../../hooks/useFormValidationToast';

const invoiceSchema = z.object({
  billId: z.string().min(1, 'Bill reference is required'),
  patientName: z.string().min(1, 'Patient name is required'),
  patientUhid: z.string().min(1, 'UHID is required'),
  patientPhone: z.string().min(10, 'Valid phone required'),
  patientEmail: z.string().email().optional().or(z.literal('')),
  patientAddress: z.string().min(1, 'Address is required'),
  patientAge: z.string().min(1, 'Age is required'),
  patientGender: z.string().min(1, 'Gender is required'),
  invoiceType: z.string().min(1, 'Invoice type is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  remarks: z.string().optional(),
});

export function GenerateInvoiceSheet({ open, onOpenChange, onGenerate, existingInvoices, prefillData }) {
  const { showValidationErrors } = useFormValidationToast();
  const [items, setItems] = useState([
    { slNo: 1, description: '', hsn: '9993', quantity: 1, rate: 0, amount: 0, department: '' }
  ]);

  const form = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      billId: '',
      patientName: '',
      patientUhid: '',
      patientPhone: '',
      patientEmail: '',
      patientAddress: '',
      patientAge: '',
      patientGender: '',
      invoiceType: INVOICE_TYPE.OPD,
      dueDate: '',
      remarks: '',
    },
  });

  // Handle prefill data from billing module
  React.useEffect(() => {
    if (prefillData && open) {
      form.setValue('billId', prefillData.billId || '');
      form.setValue('patientName', prefillData.patientName || '');
      form.setValue('patientUhid', prefillData.patientId || '');
      form.setValue('patientPhone', prefillData.patientPhone || '');

      // Set due date to 30 days from now
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      form.setValue('dueDate', dueDate.toISOString().split('T')[0]);

      // Convert bill items to invoice items
      if (prefillData.items && prefillData.items.length > 0) {
        const invoiceItems = prefillData.items.map((item, index) => ({
          slNo: index + 1,
          description: item.description,
          hsn: item.hsn || '9993',
          quantity: item.quantity,
          rate: item.unitPrice || item.rate || 0,
          amount: item.total || item.amount || 0,
          department: item.department || '',
        }));
        setItems(invoiceItems);
      }
    }
  }, [prefillData, open, form]);

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      form.reset();
      setItems([{ slNo: 1, description: '', hsn: '9993', quantity: 1, rate: 0, amount: 0, department: '' }]);
    }
    onOpenChange(isOpen);
  };

  const addItem = () => {
    setItems([...items, {
      slNo: items.length + 1,
      description: '',
      hsn: '9993',
      quantity: 1,
      rate: 0,
      amount: 0,
      department: ''
    }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index).map((item, i) => ({ ...item, slNo: i + 1 }));
      setItems(newItems);
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const cgst = subtotal * 0.09;
  const sgst = subtotal * 0.09;
  const totalGst = cgst + sgst;
  const grandTotal = Math.round(subtotal + totalGst);

  const onSubmit = (data) => {
    console.log('Generate invoice data:', data, items);

    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(existingInvoices),
      billId: data.billId,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: data.dueDate,
      status: INVOICE_STATUS.ISSUED,
      invoiceType: data.invoiceType,
      isLocked: true,

      patient: {
        id: `P-${Date.now()}`,
        name: data.patientName,
        uhid: data.patientUhid,
        phone: data.patientPhone,
        email: data.patientEmail,
        address: data.patientAddress,
        age: parseInt(data.patientAge),
        gender: data.patientGender,
      },

      items: items.filter(item => item.description && item.amount > 0),

      subtotal,
      cgst,
      sgst,
      igst: 0,
      totalGst,
      discount: 0,
      roundOff: grandTotal - (subtotal + totalGst),
      grandTotal,
      amountPaid: 0,
      balanceDue: grandTotal,

      payments: [],

      remarks: data.remarks || '',
      generatedBy: 'Current User',
      authorizedBy: 'Pending Authorization',
      printCount: 0,
      createdAt: new Date().toISOString(),
      lastPrintedAt: null,
    };

    onGenerate(newInvoice);
    handleOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="bg-transparent border-0 p-2 min-w-[800px]">
        <div className="bg-card h-full rounded-lg border flex flex-col">
          <SheetHeader className="space-y-1 p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Generate Invoice from Bill
              </SheetTitle>
              <Button variant="ghost" size="icon" onClick={() => handleOpenChange(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Create an official, immutable invoice from a finalized bill
            </p>
          </SheetHeader>

          <ScrollArea className="flex-1 p-4">
            <Form {...form}>
              <form
                id="generate-invoice-form"
                onSubmit={form.handleSubmit(onSubmit, showValidationErrors)}
                className="space-y-6"
              >
                {/* Bill Reference */}
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="billId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bill Reference *</FormLabel>
                        <FormControl>
                          <Input placeholder="BILL-2024-XXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="invoiceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(INVOICE_TYPE).map(([key, value]) => (
                              <SelectItem key={value} value={value}>
                                {INVOICE_TYPE_LABELS[value]}
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
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Patient Info */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Patient Information</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="patientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Patient name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="patientUhid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UHID *</FormLabel>
                          <FormControl>
                            <Input placeholder="UHID-2024-XXXX" {...field} />
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
                          <FormLabel>Phone *</FormLabel>
                          <FormControl>
                            <Input placeholder="9876543210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="patientAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Age" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="patientGender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="patientEmail"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="patientAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="Full address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Line Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-muted-foreground">Service Items</h4>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Item
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <Input
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="HSN"
                          value={item.hsn}
                          onChange={(e) => updateItem(index, 'hsn', e.target.value)}
                          className="w-20"
                        />
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-16"
                        />
                        <Input
                          type="number"
                          placeholder="Rate"
                          value={item.rate}
                          onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                        <div className="w-24 pt-2 text-right font-medium text-sm">
                          {formatCurrency(item.amount)}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">CGST (9%)</span>
                      <span>{formatCurrency(cgst)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">SGST (9%)</span>
                      <span>{formatCurrency(sgst)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>Grand Total</span>
                      <span>{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </ScrollArea>

          <div className="p-4 border-t flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" form="generate-invoice-form">
              <FileText className="w-4 h-4 mr-1" />
              Generate Invoice
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
