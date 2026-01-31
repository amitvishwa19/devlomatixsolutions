import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, UserPlus, Calendar, Phone, Mail, MapPin, Droplets, Shield, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { BLOOD_GROUPS, GENDERS, INSURANCE_PROVIDERS, RELATIONSHIPS } from './types';
import { useToast } from '@/hooks/use-toast';
import { useFormValidationToast } from '@/carewell/hooks/useFormValidationToast';

// Zod schema for new patient form
const newPatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20, 'Phone number too long'),
  dateOfBirth: z.date().optional().nullable(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  emergencyContactName: z.string().max(100, 'Name must be less than 100 characters').optional(),
  emergencyContactPhone: z.string().max(20, 'Phone number too long').optional(),
  emergencyContactRelationship: z.string().optional(),
  insuranceProvider: z.string().optional(),
  policyNumber: z.string().max(50, 'Policy number too long').optional(),
});

export function NewPatientDialog({ onAddPatient }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { showValidationErrors } = useFormValidationToast();

  const form = useForm({
    resolver: zodResolver(newPatientSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: null,
      gender: '',
      bloodGroup: '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      insuranceProvider: 'none',
      policyNumber: '',
    },
  });

  const onSubmit = (data) => {
    console.log('New Patient Form Data:', data);

    const now = new Date();
    const age = data.dateOfBirth 
      ? Math.floor((now - new Date(data.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
      : 0;

    const newPatient = {
      id: `p-${Date.now()}`,
      mrn: `MRN-${now.getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      age,
      gender: data.gender,
      bloodGroup: data.bloodGroup,
      status: 'active',
      address: data.address,
      emergencyContact: {
        name: data.emergencyContactName,
        phone: data.emergencyContactPhone,
        relationship: data.emergencyContactRelationship,
      },
      insurance: {
        provider: data.insuranceProvider,
        policyNumber: data.policyNumber,
        validUntil: null,
      },
      allergies: [],
      vitals: [],
      medicalHistory: [],
      prescriptions: [],
      documents: [],
      tags: [],
      categories: [],
      registeredAt: now,
      lastVisit: now,
    };

    onAddPatient?.(newPatient);
    toast({ title: 'Patient registered', description: `${newPatient.fullName} has been registered successfully.` });
    
    form.reset();
    setOpen(false);
  };

  const insuranceProvider = form.watch('insuranceProvider');

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Patient
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[550px] p-0 flex flex-col h-full">
        <SheetHeader className="p-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-lg">Register New Patient</SheetTitle>
              <p className="text-sm text-muted-foreground">Add a new patient to the system</p>
            </div>
          </div>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, showValidationErrors)} className="flex flex-col flex-1 overflow-hidden">
            <ScrollArea className="flex-1 px-6">
              <div className="py-4 space-y-6">
                {/* Personal Information */}
                <section>
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-primary" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="First name" {...field} className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Last name" {...field} className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Date of Birth</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant="outline" className="w-full h-10 justify-start text-left font-normal">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, 'dd MMM yyyy') : 'Select date'}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Gender</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {GENDERS.map((gender) => (
                                <SelectItem key={gender.id} value={gender.id}>{gender.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bloodGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Blood Group</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select blood group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {BLOOD_GROUPS.map((bg) => (
                                <SelectItem key={bg.id} value={bg.id}>{bg.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                {/* Contact Information */}
                <section>
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Phone *</FormLabel>
                          <FormControl>
                            <Input placeholder="+91 98765 43210" {...field} className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@example.com" {...field} className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel className="text-xs text-muted-foreground">Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Full address..." {...field} rows={2} className="resize-none" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                {/* Emergency Contact */}
                <section>
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    Emergency Contact
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="emergencyContactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Contact name" {...field} className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergencyContactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Contact phone" {...field} className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergencyContactRelationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Relationship</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select relationship" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {RELATIONSHIPS.map((rel) => (
                                <SelectItem key={rel.id} value={rel.id}>{rel.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                {/* Insurance */}
                <section>
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Insurance
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="insuranceProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Provider</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select provider" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INSURANCE_PROVIDERS.map((ins) => (
                                <SelectItem key={ins.id} value={ins.id}>{ins.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {insuranceProvider !== 'none' && (
                      <FormField
                        control={form.control}
                        name="policyNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Policy Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Policy number" {...field} className="h-10" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </section>
              </div>
            </ScrollArea>

            <SheetFooter className="p-4 border-t border-border shrink-0">
              <div className="flex justify-end gap-3 w-full">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="gap-2">
                  <Save className="w-4 h-4" />
                  Register Patient
                </Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
