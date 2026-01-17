import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DoorOpen, Loader } from 'lucide-react';

const roomSchema = z.object({
    number: z.string().min(1, 'Room number is required').max(10),
    floor: z.coerce.number().min(1, 'Floor must be at least 1').max(20),
    type: z.enum(['general', 'icu', 'private', 'semi-private', 'emergency', 'pediatric', 'maternity']),
    capacity: z.coerce.number().min(1, 'Capacity must be at least 1').max(10),
    department: z.string().min(2, 'Department is required').max(50),
    features: z.array(z.string()),
});


const availableFeatures = [
    'Oxygen Supply',
    'Monitor',
    'AC',
    'Attached Bathroom',
    'TV',
    'WiFi',
    'Ventilator',
    'Nurse Call System',
];

const roomTypes = [
    { value: 'general', label: 'General' },
    { value: 'icu', label: 'ICU' },
    { value: 'private', label: 'Private' },
    { value: 'semi-private', label: 'Semi-Private' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'pediatric', label: 'Pediatric' },
    { value: 'maternity', label: 'Maternity' },
];

const departments = [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'General Medicine',
    'Pediatrics',
    'Oncology',
    'Emergency',
    'Surgery',
    'Gynecology',
];

export const CreateRoomDialog = ({ open, onOpenChange, onCreateRoom, }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        resolver: zodResolver(roomSchema),
        defaultValues: {
            number: '',
            floor: 1,
            type: 'general',
            capacity: 2,
            department: '',
            features: [],
        },
    });

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        //onCreateRoom(data);
        form.reset();
        setIsSubmitting(false);
        //onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DoorOpen className="h-5 w-5 text-primary" />
                        Create New Room
                    </DialogTitle>
                    <DialogDescription>
                        Add a new room to the hospital. Beds will be created automatically based on capacity.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">


                        <div className="grid grid-cols-2 gap-4">

                            <FormField
                                control={form.control}
                                name="number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Room Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 101" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="floor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Floor</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={1} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Room Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {roomTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
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
                                name="capacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bed Capacity</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={1} max={10} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept} value={dept}>
                                                    {dept}
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
                            name="features"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Room Features</FormLabel>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {availableFeatures.map((feature) => (
                                            <FormField
                                                key={feature}
                                                control={form.control}
                                                name="features"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(feature)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...field.value, feature])
                                                                        : field.onChange(field.value?.filter((v) => v !== feature));
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="text-sm font-normal cursor-pointer">
                                                            {feature}
                                                        </FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant='save' disabled={isSubmitting} className="gradient-primary ">
                                {isSubmitting ? <Loader className=' animate-spin' /> : <DoorOpen />}
                                {isSubmitting ? 'Creating...' : 'Create Room'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
