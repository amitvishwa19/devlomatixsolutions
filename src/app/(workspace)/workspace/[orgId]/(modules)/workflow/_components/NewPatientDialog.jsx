import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, UserPlus } from 'lucide-react';
import { generateMRN } from '../_misc/utils';
import { useFormValidationToast } from '../../hooks/useFormValidationToast';

// Zod schema for workflow patient form
const workflowPatientSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    age: z.string().min(1, 'Age is required').refine(val => {
        const num = parseInt(val);
        return !isNaN(num) && num >= 0 && num <= 150;
    }, 'Age must be between 0 and 150'),
    gender: z.string().min(1, 'Gender is required'),
    phone: z.string().max(20, 'Phone number too long').optional(),
    address: z.string().max(200, 'Address too long').optional(),
    symptoms: z.string().max(500, 'Symptoms too long').optional(),
    priority: z.string().default('normal'),
});

export function NewPatientDialog({ onAddPatient, workflowType }) {
    const [open, setOpen] = useState(false);
    const { showValidationErrors } = useFormValidationToast();

    const form = useForm({
        resolver: zodResolver(workflowPatientSchema),
        defaultValues: {
            name: '',
            age: '',
            gender: 'Male',
            phone: '',
            address: '',
            symptoms: '',
            priority: 'normal',
        },
    });

    const onSubmit = (data) => {
        console.log('Workflow Patient Form Data:', data);

        const newPatient = {
            id: `p-${Date.now()}`,
            name: data.name,
            mrn: generateMRN(),
            age: parseInt(data.age),
            gender: data.gender,
            phone: data.phone || '',
            address: data.address || '',
            symptoms: data.symptoms || '',
            priority: data.priority,
            stageEnteredAt: new Date(),
            status: data.priority === 'critical' ? 'critical' : 'pending',
            workflowType,
        };

        const firstStage = workflowType === 'opd' ? 'registration' : 'admission';
        onAddPatient(newPatient, firstStage);

        form.reset();
        setOpen(false);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create New Flow
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[620px] overflow-y-auto bg-transparent border-0 p-2">
                <div className='bg-card h-full border rounded-lg p-2'>
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-primary" />
                            Register New {workflowType === 'opd' ? 'OPD' : 'IPD'} Patient
                        </SheetTitle>
                    </SheetHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit, showValidationErrors)} className="space-y-4 mt-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter patient name" {...field} className="mt-1.5" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="age"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Age *</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Age" min="0" max="150" {...field} className="mt-1.5" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="mt-1.5">
                                                        <SelectValue placeholder="Select gender" />
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
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input type="tel" placeholder="Phone number" {...field} className="mt-1.5" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Priority</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="mt-1.5">
                                                        <SelectValue placeholder="Select priority" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="normal">Normal</SelectItem>
                                                    <SelectItem value="urgent">Urgent</SelectItem>
                                                    <SelectItem value="critical">Critical</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Patient address" {...field} className="mt-1.5" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="symptoms"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Symptoms / Reason for Visit</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe symptoms or reason for visit" {...field} rows={4} className="mt-1.5" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1">
                                    Register Patient
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
