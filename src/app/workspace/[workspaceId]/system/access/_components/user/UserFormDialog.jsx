'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Eye,
    EyeOff,
    Loader2,
    Save,
    UserPlus,
    UserCheck,
    Mail,
    Lock,
    Shield,
    X,
    CheckCircle2
} from 'lucide-react';
import { useAction } from '@/hooks/use-action';
import { upsertUser } from '../../_action/upsert-user';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useAccess } from '@/providers/WorkspaceProvider';
import { RoleSelect } from './RoleSelect';

const userFormSchema = z.object({
    id: z.string(),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().optional(),
    roles: z.array(z.any()),
    status: z.boolean(),
});

export function UserFormDialog({ open, onOpenChange, user, roles, onSubmit }) {
    const { update } = useSession();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isEditing = Boolean(user);

    const form = useForm({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            id: '',
            name: '',
            email: '',
            password: '',
            roles: [],
            status: true,
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({
                id: user.id || '',
                name: user.displayName || user.name || '',
                email: user.email || '',
                password: '',
                roles: user.roles?.map((p) =>
                    typeof p === 'string' ? p : p.id
                ) ?? [],
                status: user.isActive !== undefined ? user.isActive : true,
            });
        } else {
            form.reset({
                id: '',
                name: '',
                email: '',
                password: '',
                roles: [],
                status: true,
            });
        }
        setShowPassword(false);
    }, [user, form, open]);

    const { execute } = useAction(upsertUser, {
        onSuccess: (data) => {
            onSubmit?.(data.user);
            handleOpenClose();
            update();
            toast.success(
                user ? 'User updated successfully' : 'User created successfully',
                { id: 'user-form-action' }
            );
        },
        onError: (error) => {
            console.error('Upsert User Error:', error);
            toast.error(error?.message || 'Failed to save user, please try again', { id: 'user-form-action' });
            setLoading(false);
        }
    });

    const handleSubmit = async (data) => {
        setLoading(true);
        toast.loading(user ? 'Updating user...' : 'Creating user...', { id: 'user-form-action' });
        await execute({ formData: data });
    };

    const handleOpenClose = () => {
        onOpenChange?.(false);
        setLoading(false);
        form.reset();
    };

    const isStatusActive = form.watch('status');

    return (
        <Sheet open={open} onOpenChange={handleOpenClose}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-[560px] p-0 border-l border-border/80 bg-card shadow-2xl flex flex-col h-full overflow-hidden"
            >
                {/* Header */}
                <SheetHeader className="p-6 border-b border-border/60 bg-muted/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                                {isEditing ? (
                                    <UserCheck className="w-5 h-5 text-primary" />
                                ) : (
                                    <UserPlus className="w-5 h-5 text-primary" />
                                )}
                            </div>
                            <div className="space-y-0.5">
                                <SheetTitle className="text-base font-bold text-foreground tracking-tight">
                                    {isEditing ? 'Edit User Profile' : 'Add New User'}
                                </SheetTitle>
                                <SheetDescription className="text-xs text-muted-foreground">
                                    {isEditing
                                        ? 'Update workspace account information and role assignments.'
                                        : 'Create a new user account and assign permissions.'}
                                </SheetDescription>
                            </div>
                        </div>

                        <SheetClose asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                                <span className="sr-only">Close</span>
                            </Button>
                        </SheetClose>
                    </div>
                </SheetHeader>

                {/* Form Content */}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="flex flex-col flex-1 overflow-hidden"
                    >
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-5 pb-6">
                                {/* FULL NAME */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1">
                                                <span>Full Name</span>
                                                <span className="text-rose-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative flex items-center">
                                                    <Input
                                                        placeholder="e.g. John Doe"
                                                        {...field}
                                                        className="h-10 text-xs bg-background border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/30 transition-all"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[11px] text-rose-500" />
                                        </FormItem>
                                    )}
                                />

                                {/* EMAIL ADDRESS */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1">
                                                <span>Email Address</span>
                                                <span className="text-rose-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative flex items-center">
                                                    <Input
                                                        type="email"
                                                        placeholder="john.doe@company.com"
                                                        {...field}
                                                        className="h-10 text-xs bg-background border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/30 transition-all pl-9"
                                                    />
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[11px] text-rose-500" />
                                        </FormItem>
                                    )}
                                />

                                {/* PASSWORD */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs font-semibold text-foreground flex items-center justify-between">
                                                <span className="flex items-center gap-1">
                                                    <span>Password</span>
                                                    {!isEditing && <span className="text-rose-500">*</span>}
                                                </span>
                                                {isEditing && (
                                                    <span className="text-[10px] text-muted-foreground font-normal">
                                                        Leave empty to keep current
                                                    </span>
                                                )}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative flex items-center">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder={isEditing ? "••••••••" : "Create a strong password"}
                                                        {...field}
                                                        className="h-10 text-xs bg-background border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/30 transition-all pl-9 pr-10"
                                                    />
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword((prev) => !prev)}
                                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                                                        title={showPassword ? "Hide password" : "Show password"}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="w-4 h-4" />
                                                        ) : (
                                                            <Eye className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[11px] text-rose-500" />
                                        </FormItem>
                                    )}
                                />

                                {/* ROLES SELECTION */}
                                <FormField
                                    control={form.control}
                                    name="roles"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                                    <Shield className="w-3.5 h-3.5 text-primary" />
                                                    <span>Assigned Roles</span>
                                                </FormLabel>
                                                <span className="text-[10px] text-muted-foreground">
                                                    Multi-role support
                                                </span>
                                            </div>
                                            <FormControl>
                                                <RoleSelect
                                                    roles={roles || []}
                                                    selected={field.value || []}
                                                    onChange={field.onChange}
                                                    placeholder="Select one or more roles..."
                                                />
                                            </FormControl>
                                            <FormDescription className="text-[10px] text-muted-foreground">
                                                Roles grant module permissions and access level across web & mobile suites.
                                            </FormDescription>
                                            <FormMessage className="text-[11px] text-rose-500" />
                                        </FormItem>
                                    )}
                                />

                                {/* STATUS CARD TOGGLE */}
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className={`flex items-start space-x-3.5 p-3.5 rounded-xl border transition-all mt-4 ${
                                            isStatusActive
                                                ? "bg-emerald-500/5 border-emerald-500/25"
                                                : "bg-muted/20 border-border/60"
                                        }`}>
                                            <FormControl className="mt-0.5">
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    id="user-status"
                                                    className="w-4 h-4 rounded data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 border-border/80 cursor-pointer"
                                                />
                                            </FormControl>
                                            <div className="space-y-1 flex-1 leading-none">
                                                <div className="flex items-center justify-between">
                                                    <FormLabel
                                                        htmlFor="user-status"
                                                        className="text-xs font-semibold text-foreground cursor-pointer"
                                                    >
                                                        Account Status
                                                    </FormLabel>
                                                    {isStatusActive ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] border-emerald-500/30 text-emerald-600 bg-emerald-500/10 px-2 py-0 gap-1 font-medium"
                                                        >
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            <span>Active</span>
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] border-border/60 text-muted-foreground bg-muted/40 px-2 py-0 font-medium"
                                                        >
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </div>
                                                <FormDescription className="text-[11px] text-muted-foreground leading-relaxed">
                                                    {isStatusActive
                                                        ? "User account is enabled and can log in to the workspace and mobile app."
                                                        : "User account is suspended and cannot authenticate into any workspace services."}
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </ScrollArea>

                        {/* Footer */}
                        <SheetFooter className="p-4 sm:p-5 border-t border-border/60 bg-muted/20 flex-row items-center justify-end gap-2.5">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleOpenClose}
                                disabled={loading}
                                className="h-9 px-4 text-xs font-medium border-border/60 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={loading}
                                className="h-9 px-5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/25 cursor-pointer rounded-lg gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Save className="w-3.5 h-3.5" />
                                )}
                                <span>{isEditing ? 'Save Changes' : 'Create User'}</span>
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}