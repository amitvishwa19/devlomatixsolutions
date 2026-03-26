import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAccess } from '../../_provider/accessProvider';
import { Loader, Save } from 'lucide-react';
import { upsertPermission } from '../../_action/upsert-permission';
import { useSession } from 'next-auth/react';
import { useAction } from '@/hooks/use-action';
import { toast } from 'sonner';


const permissionSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(2, 'Role name must be at least 2 characters').max(50),
    description: z.string().min(10, 'Description must be at least 10 characters').max(200),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
});




const colorPresets = [
    '#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#6366f1', '#ef4444'
];

export function PermissionFormDialog({ open, onOpenChange, permission, onSubmit }) {
    const { roles, permissions } = useAccess()
    const [loading, setLoading] = useState()
    const { data: session } = useSession()

    const form = useForm({
        resolver: zodResolver(permissionSchema),
        defaultValues: {
            id: '',
            title: '',
            description: '',
            color: '#0d9488',

        },
    });

    useEffect(() => {
        if (permission) {
            form.reset({
                id: permission.id,
                title: permission.title,
                description: permission.description,
                color: permission.color,

            });
        } else {
            form.reset({
                id: '',
                title: '',
                description: '',
                color: '#0d9488',

            });
        }
    }, [permission, form]);

    const { execute } = useAction(upsertPermission, {
        onSuccess: (data) => {
            console.log('Server action permission')
            onSubmit(data?.permission)
            setLoading(false);
            handleClose()
            toast.success('Permission created successfully', { id: 'new-permission' })
        },
        onError: (error) => {
            console.log(error)
            toast.error('Oops somethig went wrong ! try again later', { id: 'new-invoice' })
            setLoading(false);
        }
    })

    const handleSubmit = async (data) => {
        setLoading(true);
        toast.loading('Creating permission, please wait....', { id: 'new-permission' })
        await execute({ userId: session.user?.userId, formData: data })
    };


    const handleClose = () => {
        form.reset()
        onOpenChange()
    }


    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl  overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>{permission ? `Edit ${permission?.title}` : 'Create New Permission'}</DialogTitle>
                    <DialogDescription>
                        {permission ? 'Update role details and permissions.' : 'Define a new role with specific permissions.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex-1 pr-4 h-[70vh]">
                            <div className="space-y-6 pb-4">

                                <div className="grid gap-4 md:grid-cols-2 p-2">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Permission Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Senior Doctor" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="color"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Color</FormLabel>
                                                <FormControl>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="h-10 w-10 rounded-lg border border-input"
                                                            style={{ backgroundColor: field.value }}
                                                        />
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {colorPresets.map((color) => (
                                                                <button
                                                                    key={color}
                                                                    type="button"
                                                                    className="h-6 w-6 rounded-md border border-input transition-transform hover:scale-110"
                                                                    style={{ backgroundColor: color }}
                                                                    onClick={() => field.onChange(color)}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    rows='2'
                                                    placeholder="Describe what this permission is responsible for..."
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                A brief description of this permission's responsibilities.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />


                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-border flex flex-row justify-end gap-2">
                            <Button type="button" variant="outline" size='sm' disabled={loading} onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant='save' size='sm' disabled={loading}>
                                {loading ? <Loader className=' animate-spin' /> : <Save />}
                                {permission ? 'Save Changes' : 'Create Permission'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
