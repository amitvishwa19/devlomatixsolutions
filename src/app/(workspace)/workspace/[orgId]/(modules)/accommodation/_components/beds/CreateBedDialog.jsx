import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { BedDouble, Loader, Save } from 'lucide-react';

const bedSchema = z.object({
    number: z.string().min(1, 'Bed number is required').max(20),
    roomId: z.string().min(1, 'Room is required'),
    status: z.enum(['available', 'maintenance', 'reserved']),
});




export const CreateBedDialog = ({
    open,
    onOpenChange,
    onCreateBed,
    rooms,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        resolver: zodResolver(bedSchema),
        defaultValues: {
            number: '',
            roomId: '',
            status: 'available',
        },
    });

    const selectedRoomId = form.watch('roomId');
    const selectedRoom = rooms.find(r => r.id === selectedRoomId);

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        onCreateBed(data);
        form.reset();
        setIsSubmitting(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BedDouble className="h-5 w-5 text-primary" />
                        Add New Bed
                    </DialogTitle>
                    <DialogDescription>
                        Add a new bed to an existing room.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="roomId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Room</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a room" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {rooms.map((room) => (
                                                <SelectItem key={room.id} value={room.id}>
                                                    Room {room.number} - {room.department} ({room.beds.length}/{room.capacity} beds)
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
                            name="number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bed Number</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={selectedRoom ? `e.g., ${selectedRoom.number}-B${selectedRoom.beds.length + 1}` : "e.g., 101-B1"}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Initial Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="reserved">Reserved</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" size='sm' onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant='save' size='sm' disabled={isSubmitting} className="">
                                {isSubmitting ? <Loader className=' animate-spin' /> : <Save />}
                                {isSubmitting ? 'Adding...' : 'Add Bed'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
