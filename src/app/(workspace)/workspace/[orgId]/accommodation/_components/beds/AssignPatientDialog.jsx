import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus } from 'lucide-react';

const patientSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    age: z.coerce.number().min(0, 'Age must be positive').max(150, 'Invalid age'),
    gender: z.enum(['male', 'female', 'other']),
    contactNumber: z.string().min(10, 'Enter a valid contact number').max(20),
    diagnosis: z.string().max(500).optional(),
});


export const AssignPatientDialog = ({
    bed,
    open,
    onOpenChange,
    onAssign,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        resolver: zodResolver(patientSchema),
        defaultValues: {
            name: '',
            age: 0,
            gender: 'male',
            contactNumber: '',
            diagnosis: '',
        },
    });

    const handleSubmit = async (data) => {
        if (!bed) return;

        setIsSubmitting(true);

        const patient = {
            id: `patient-${Date.now()}`,
            name: data.name,
            age: data.age,
            gender: data.gender,
            contactNumber: data.contactNumber,
            admissionDate: new Date().toISOString(),
            diagnosis: data.diagnosis,
        };

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        onAssign(bed.id, patient);
        form.reset();
        setIsSubmitting(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        Assign Patient to Bed {bed?.number}
                    </DialogTitle>
                    <DialogDescription>
                        Enter patient details to assign them to this bed.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
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

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="age"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Age</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Age" {...field} />
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
                                        <FormLabel>Gender</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="contactNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1-XXX-XXX-XXXX" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="diagnosis"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Diagnosis (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter diagnosis or reason for admission"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="gradient-primary text-primary-foreground"
                            >
                                {isSubmitting ? 'Assigning...' : 'Assign Patient'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
