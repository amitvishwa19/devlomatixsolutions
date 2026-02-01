import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pill, X, Save, User, Stethoscope } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DOSAGE_FREQUENCIES, DURATION_OPTIONS, MEDICINE_ROUTES, COMMON_MEDICINES } from '../utils/types';
import { mockDoctors, mockPatientsList } from '../utils/mockPrescriptions';
import { generatePrescriptionId } from '../utils/utils';
import { useToast } from '@/hooks/use-toast';
import { useFormValidationToast } from '../../hooks/useFormValidationToast';


// Zod schema for medicine
const medicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required').max(100, 'Name too long'),
  dosage: z.string().min(1, 'Dosage is required').max(50, 'Dosage too long'),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  route: z.string().default('oral'),
  instructions: z.string().max(200, 'Instructions too long').optional(),
  quantity: z.string().optional(),
});

// Zod schema for prescription form
const prescriptionSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctor: z.string().min(1, 'Doctor is required'),
  diagnosis: z.string().max(200, 'Diagnosis too long').optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
  refillsRemaining: z.string().optional(),
  medicines: z.array(medicineSchema).min(1, 'At least one medicine is required'),
});

export function NewPrescriptionDialog({ open, onOpenChange, onSave }) {
  const { toast } = useToast();
  const { showValidationErrors } = useFormValidationToast();

  const form = useForm({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId: '',
      doctor: '',
      diagnosis: '',
      notes: '',
      refillsRemaining: '0',
      medicines: [{ name: '', dosage: '', frequency: '', duration: '', route: 'oral', instructions: '', quantity: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'medicines',
  });

  const onSubmit = (data) => {
    console.log('New Prescription Form Data:', data);

    const selectedPatient = mockPatientsList.find(p => p.id === data.patientId);

    const prescription = {
      id: generatePrescriptionId(),
      patientId: data.patientId,
      patientName: selectedPatient?.name || '',
      patientMrn: selectedPatient?.mrn || '',
      doctor: data.doctor,
      diagnosis: data.diagnosis || '',
      prescribedDate: new Date(),
      status: 'active',
      refillsRemaining: parseInt(data.refillsRemaining) || 0,
      notes: data.notes || '',
      tags: [],
      categories: [],
      medicines: data.medicines.map(m => ({
        ...m,
        quantity: parseInt(m.quantity) || 0,
      })),
    };

    onSave?.(prescription);
    toast({ title: 'Prescription created', description: `Prescription with ${data.medicines.length} medicine(s) created successfully.` });

    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary" />
            New Prescription
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, showValidationErrors)} className="space-y-6 py-4">
            {/* Patient & Doctor Selection */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Patient *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockPatientsList.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} ({patient.mrn})
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
                name="doctor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs flex items-center gap-1">
                      <Stethoscope className="w-3 h-3" />
                      Prescribing Doctor *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockDoctors.map((doc) => (
                          <SelectItem key={doc.id} value={doc.name}>
                            {doc.name} - {doc.specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Diagnosis & Refills */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-xs">Diagnosis</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Upper Respiratory Infection" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="refillsRemaining"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Refills Allowed</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Medicines Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-sm font-semibold">Medicines</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: '', dosage: '', frequency: '', duration: '', route: 'oral', instructions: '', quantity: '' })}
                  className="gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Medicine
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border border-border rounded-lg space-y-4 bg-secondary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Medicine {index + 1}</span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => remove(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`medicines.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Medicine Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Amoxicillin" {...field} list={`medicines-${index}`} />
                          </FormControl>
                          <datalist id={`medicines-${index}`}>
                            {COMMON_MEDICINES.map(m => <option key={m} value={m} />)}
                          </datalist>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`medicines.${index}.dosage`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Dosage *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 500mg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`medicines.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 30" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`medicines.${index}.frequency`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Frequency</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DOSAGE_FREQUENCIES.map((freq) => (
                                <SelectItem key={freq.id} value={freq.id}>{freq.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`medicines.${index}.duration`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Duration</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DURATION_OPTIONS.map((dur) => (
                                <SelectItem key={dur.id} value={dur.id}>{dur.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`medicines.${index}.route`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Route</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MEDICINE_ROUTES.map((route) => (
                                <SelectItem key={route.id} value={route.id}>{route.label}</SelectItem>
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
                    name={`medicines.${index}.instructions`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Special Instructions</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Take with food, avoid alcohol" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <Separator />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional instructions or notes..." {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" className="gap-2">
                <Save className="w-4 h-4" />
                Save Prescription
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
