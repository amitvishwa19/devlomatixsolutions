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
import { useAction } from '@/hooks/use-action';
import { upsertRole } from '../../_action/upsert-role';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';


const roleSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(2, 'Role name must be at least 2 characters').max(50),
    description: z.string().min(10, 'Description must be at least 10 characters').max(200),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
    permissions: z.array(z.string()).optional(),
});


const colorPresets = [
    '#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#6366f1', '#ef4444'
];

export function RoleFormDialog({ open, onOpenChange, role, onSubmit }) {
    const { roles, permissions } = useAccess()
    const [loading, setLoading] = useState()
    const { data: session } = useSession()



    const form = useForm({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            title: '',
            description: '',
            color: '#0d9488',
            permissions: [],
        },
    });

    useEffect(() => {
        if (role) {
            form.reset({
                id: role.id,
                title: role.title,
                description: role.description,
                color: role.color,
                permissions: role.permissions?.map((p) =>
                    p === 'string' ? p : p.id
                ) ?? [],
            });
        } else {
            form.reset({
                id: '',
                title: '',
                description: '',
                color: '#0d9488',
                permissions: [],
            });
        }
    }, [role, form]);

    const selectedPermissions = form.watch('permissions');
    const allSelected = selectedPermissions.length === permissions?.length;

    const handleSelectAll = () => {
        if (allSelected) {
            form.setValue('permissions', []);
        } else {
            form.setValue('permissions', permissions?.map(p => p.id));
        }
    };

    const { execute } = useAction(upsertRole, {
        onSuccess: (data) => {
            onSubmit(data?.role)
            setLoading(false);
            handleOpenChange()
            toast.success('Role created successfully', { id: 'new-role' })
        },
        onError: (error) => {
            console.log(error)
            toast.error('ROle already exists,please try again', { id: 'new-role' })
            setLoading(false);
        }
    })

    const handleSubmit = async (data) => {
        setLoading(true)
        toast.loading('Creating role, please wait....', { id: 'new-role' })
        await execute({ userId: session?.user?.userId, formData: data })
    };

    const handleOpenChange = () => {
        setLoading(false);
        onOpenChange()
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>{role ? 'Edit Role' : 'Create New Role'}</DialogTitle>
                    <DialogDescription>
                        {role ? 'Update role details and permissions.' : 'Define a new role with specific permissions.'}
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
                                                <FormLabel>Role Name</FormLabel>
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
                                                    placeholder="Describe what this role is responsible for..."
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                A brief description of this role's responsibilities.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="permissions"
                                    render={() => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Permissions</FormLabel>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleSelectAll}
                                                    className="text-xs"
                                                >
                                                    {allSelected ? 'Deselect All' : 'Select All'}
                                                </Button>
                                            </div>
                                            <FormDescription>
                                                Select the permissions for this role.
                                            </FormDescription>
                                            <ScrollArea className="rounded-lg border border-border p-2 mt-2 h-[40vh]">
                                                <div className="grid gap-3 sm:grid-cols-2 m-2">
                                                    {permissions?.map((permission) => (
                                                        <FormField
                                                            key={permission.id}
                                                            control={form.control}
                                                            name="permissions"
                                                            render={({ field }) => (
                                                                <FormItem className="flex items-start space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(permission.id)}
                                                                            onCheckedChange={(checked) => {
                                                                                const updated = checked
                                                                                    ? [...field.value, permission.id]
                                                                                    : field.value?.filter((id) => id !== permission.id);
                                                                                field.onChange(updated);
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <div className="space-y-1 leading-none">
                                                                        <FormLabel className="text-sm font-normal cursor-pointer">
                                                                            {permission.name}
                                                                        </FormLabel>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {permission.description}
                                                                        </p>
                                                                    </div>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-border">
                            <Button type="button" variant="outline" size='sm' disabled={loading} onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant='save' size='sm' disabled={loading}>
                                {loading ? <Loader className=' animate-spin' /> : <Save />}
                                {role ? 'Save Changes' : 'Create Role'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
