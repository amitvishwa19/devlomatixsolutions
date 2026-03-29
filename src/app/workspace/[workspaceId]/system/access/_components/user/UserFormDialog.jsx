import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { icons, Loader, Save, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useAction } from '@/hooks/use-action';
import { upsertUser } from '../../_action/upsert-user';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useAccess } from '../../_provider/accessProvider';
import { DepartmentMultiSelect } from './DepartmentMultiSelect';
import { RoleSelect } from './RoleSelect';
import { MultiSelectDropDown } from '@/components/global/MultiSelectDropDown';

const userFormSchema = z.object({
    id: z.string(),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
    email: z.string().email('Please enter a valid email address'),
    departments: z.array(z.any()).min(1, "Select at least one department"),
    roles: z.array(z.any()),
    status: z.boolean(['active', 'inactive']),
});

export function UserFormDialog({ open, onOpenChange, user, roles, onSubmit }) {
    const { data: session } = useSession()
    const [loading, setloading] = useState(false)
    const isEditing = !!user;
    const { departments } = useAccess()

    // console.log('user', user)


    const form = useForm({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            id: '',
            name: '',
            email: '',
            departments: [],
            roles: [],
            status: false,
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({
                id: user.id || '',
                name: user.displayName || '',
                email: user.email || '',
                departments: user.departments || [],
                roles: user.roles?.map((p) =>
                    p === 'string' ? p : p.id
                ) ?? [],
                status: user.status || false,
            });
        } else {
            form.reset({
                id: '',
                name: '',
                email: '',
                departments: [],
                roles: [],
                status: false,
            });
        }
    }, [user, form, open]);

    useEffect(() => {
        console.log("Departments value:", form.watch("departments"));
    }, [form.watch("departments")]);


    const { execute } = useAction(upsertUser, {
        onSuccess: (data) => {
            onSubmit(data.user)
            handleOpenClose()
            toast.success(`${user ? 'User updated successfully' : 'User created successfully'}`, { id: 'new-user' })
        },
        onError: (error) => {
            console.log(error)
            toast.error('Role already exists,please try again', { id: 'new-user' })
            setloading(false);
        }
    })

    const handleSubmit = async (data) => {
        //console.log('User data', data)
        setloading(true);
        toast.loading(user ? 'Updating user...' : 'Creating user...', { id: 'new-user' })
        await execute({ userId: session?.user?.userId, formData: data })
    };

    const handleOpenClose = () => {
        onOpenChange()
        setloading(false)
        form.reset()
    }

    return (
        <Sheet open={open} onOpenChange={handleOpenClose}>
            <SheetContent className="min-w-[620px] bg-transparent border-l-0 p-2">
                <div className='bg-card h-full border rounded-lg p-4'>
                    <SheetHeader>
                        <SheetTitle className='flex flex-row gap-2 items-center'>
                            <User className='h-5 w-5 text-sky-500' />
                            {isEditing ? 'Edit User' : 'Add New User'}
                        </SheetTitle>
                        <SheetDescription>
                            {isEditing
                                ? 'Update user information and role assignment.'
                                : 'Add a new user to the hospital management system.'}
                        </SheetDescription>
                    </SheetHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

                            <div className='flex flex-col flex-1 gap-4'>

                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter full name" {...field} />
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
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="user@hospital.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="departments"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Departments</FormLabel>
                                            <FormControl>
                                                <MultiSelectDropDown
                                                    data={departments}
                                                    columns={2}
                                                    value={field.value}              // ← RHF value
                                                    onChange={field.onChange}        // ← RHF setter
                                                    placeholder="Select departments..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />



                                {/* Multi-Select Roles using the new component */}
                                <FormField
                                    control={form.control}
                                    name="roles"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Roles</FormLabel>
                                            <FormControl>
                                                <RoleSelect
                                                    roles={roles}
                                                    selected={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Select roles..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />



                                {/* ✅ BOOLEAN STATUS TOGGLE */}
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                            <div className="space-y-1 leading-none">
                                                <FormLabel
                                                    htmlFor="status"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Active Status
                                                </FormLabel>
                                                <FormDescription>
                                                    Enable to activate user account.
                                                </FormDescription>
                                                <FormMessage />
                                            </div>
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    id="status"
                                                />
                                            </FormControl>

                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size='sm'
                                    disabled={loading}
                                    onClick={() => onOpenChange(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" variant='save' size='sm' disabled={loading}>
                                    {loading ? <Loader className=' animate-spin' /> : <Save />}
                                    {isEditing ? 'Save Changes' : 'Add User'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
