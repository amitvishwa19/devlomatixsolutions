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
import { Eye, EyeOff, icons, Loader, Save, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useAction } from '@/hooks/use-action';
import { upsertUser } from '../../_action/upsert-user';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useAccess } from '@/providers/WorkspaceProvider';
import { DepartmentMultiSelect } from './DepartmentMultiSelect';
import { RoleSelect } from './RoleSelect';
import { MultiSelectDropDown } from '@/components/global/MultiSelectDropDown';

const userFormSchema = z.object({
    id: z.string(),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().optional(),
    roles: z.array(z.any()),
    status: z.boolean(),
});

export function UserFormDialog({ open, onOpenChange, user, roles, onSubmit }) {
    const { data: session, update } = useSession()
    const [loading, setloading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const isEditing = !!user;
    const { departments } = useAccess()

    // console.log('user', user)


    const form = useForm({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            id: '',
            name: '',
            email: '',
            password: '',
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
                password: '',
                roles: user.roles?.map((p) =>
                    typeof p === 'string' ? p : p.id
                ) ?? [],
                status: user.isActive || false,
            });
        } else {
            form.reset({
                id: '',
                name: '',
                email: '',
                password: '',
                roles: [],
                status: false,
            });
        }
        setShowPassword(false);
    }, [user, form, open]);

    useEffect(() => {
        console.log("Departments value:", form.watch("departments"));
    }, [form.watch("departments")]);


    const { execute } = useAction(upsertUser, {
        onSuccess: (data) => {
            onSubmit(data.user)
            handleOpenClose()
            update(); // PRODUCTION GRADE: Refresh session data immediately
            toast.success(`${user ? 'User updated successfully' : 'User created successfully'}`, { id: 'new-user' })
        },
        onError: (error) => {
            console.log(error)
            toast.error(error?.message || 'Failed to save user, please try again', { id: 'new-user' })
            setloading(false);
        }
    })

    const handleSubmit = async (data) => {
        console.log('User data', data)
        setloading(true);
        toast.loading(user ? 'Updating user...' : 'Creating user...', { id: 'new-user' })
        await execute({ formData: data })
    };

    const handleOpenClose = () => {
        onOpenChange()
        setloading(false)
        form.reset()
    }

    return (
        <Sheet open={open} onOpenChange={handleOpenClose}>
            <SheetContent className="min-w-[620px] bg-transparent border-0 shadow-none p-2">
                <div className="bg-card rounded-md flex flex-col h-full border overflow-hidden shadow-2xl">
                    <SheetHeader className="border-b p-6 bg-muted/5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-md bg-primary/10 border border-primary/20 shadow-inner">
                                <User className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold tracking-tight">
                                    {isEditing ? 'Edit User' : 'Add New User'}
                                </SheetTitle>
                                <SheetDescription className="text-sm opacity-70">
                                    {isEditing
                                        ? 'Update user information and role assignment.'
                                        : 'Add a new user to the system.'}
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
                            <ScrollArea className="flex-1 h-[80vh] p-6">
                                <div className="space-y-8 pb-10">
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem className="grid gap-2 p-1">
                                                    <FormLabel className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">Full Name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter full name"
                                                            {...field}
                                                            className="bg-secondary/30 border-border/40 h-12 rounded-md text-lg font-medium focus:ring-primary/20"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="grid gap-2 p-1">
                                                    <FormLabel className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">Email Address</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="email"
                                                            placeholder="user@domain.com"
                                                            {...field}
                                                            className="bg-secondary/30 border-border/40 rounded-md focus:ring-primary/20"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem className="grid gap-2 p-1">
                                                    <FormLabel className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">
                                                        Password {isEditing ? "(Leave blank to keep unchanged)" : "(Set User Password)"}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative flex items-center">
                                                            <Input
                                                                type={showPassword ? "text" : "password"}
                                                                placeholder={isEditing ? "••••••••" : "Enter password"}
                                                                {...field}
                                                                className="bg-secondary/30 border-border/40 rounded-md focus:ring-primary/20 pr-10"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setShowPassword((prev) => !prev);
                                                                }}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10 cursor-pointer p-1"
                                                            >
                                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                            </button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* <FormField
                                            control={form.control}
                                            name="departments"
                                            render={({ field }) => (
                                                <FormItem className="grid gap-2 p-1">
                                                    <FormLabel className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">Departments</FormLabel>
                                                    <FormControl>
                                                        <MultiSelectDropDown
                                                            data={departments}
                                                            columns={2}
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            placeholder="Select departments..."
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        /> */}

                                        <FormField
                                            control={form.control}
                                            name="roles"
                                            render={({ field }) => (
                                                <FormItem className="grid gap-2 p-1">
                                                    <FormLabel className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">Roles</FormLabel>
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

                                        {/* STATUS TOGGLE */}
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center space-x-3 space-y-0 p-4 rounded-md bg-secondary/20 border border-border/30 mt-4 mx-1 transition-colors hover:bg-secondary/30">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            id="status"
                                                            className="w-5 h-5 rounded-md data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none flex-1 mt-0.5">
                                                        <FormLabel
                                                            htmlFor="status"
                                                            className="text-sm font-bold cursor-pointer block"
                                                        >
                                                            Active Status
                                                        </FormLabel>
                                                        <FormDescription className="text-[10px] opacity-70">
                                                            Enable to activate user account and grant full workspace access.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </ScrollArea>

                            <SheetFooter className="p-6 border-t bg-muted/5 flex-row justify-end items-center gap-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => onOpenChange(false)}
                                    disabled={loading}
                                    className="rounded-md font-bold text-xs uppercase tracking-widest px-8"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-md  px-8 shadow-xl shadow-primary/20"
                                >
                                    {loading ? <Loader className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    {isEditing ? 'Save Changes' : 'Add User'}
                                </Button>
                            </SheetFooter>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
}