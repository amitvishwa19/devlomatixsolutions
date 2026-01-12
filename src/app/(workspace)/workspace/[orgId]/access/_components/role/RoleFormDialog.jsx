import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";

import { Loader, Save, ShieldUser, Check } from "lucide-react";
import { toast } from "sonner";

import { useAccess } from "../../_provider/accessProvider";
import { upsertRole } from "../../_action/upsert-role";
import { useSession } from "next-auth/react";
import { useAction } from "@/hooks/use-action";

/* ------------------ Schema ------------------ */

const roleSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(2).max(50),
    description: z.string().min(10).max(200),
    color: z.string(),
    permissions: z.array(z.any()), // FULL permission objects
});

/* ------------------ Colors ------------------ */

const colorPresets = [
    "#0d9488",
    "#3b82f6",
    "#8b5cf6",
    "#f59e0b",
    "#10b981",
    "#ec4899",
    "#6366f1",
    "#ef4444",
];

/* ================== COMPONENT ================== */

export function RoleFormDialog({ isOpen, mode, onClose, role, onSubmit, }) {
    const { permissions } = useAccess();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);


    const form = useForm({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            id: "",
            title: "",
            description: "",
            color: "#0d9488",
            permissions: [],
        },
    });

    useEffect(() => {
        if (!permissions?.length) return;

        if (role) {
            // EDIT MODE
            const rolePermissionIds = new Set(
                role.permissions.map((p) => (typeof p === "string" ? p : p.id))
            );

            form.reset({
                id: role.id,
                title: role.title,
                description: role.description,
                color: role.color,
                permissions: permissions.map((p) => ({
                    ...p,
                    status: rolePermissionIds.has(p.id),
                })),
            });
        } else {
            // ADD MODE (ALL UNCHECKED)
            form.reset({
                id: "",
                title: "",
                description: "",
                color: "#0d9488",
                permissions: permissions.map((p) => ({
                    ...p,
                    status: false,
                })),
            });
        }
    }, [role, permissions]);


    const permissionCategories = useMemo(() => {
        const groups = {};
        form.getValues("permissions")?.forEach((p) => {
            if (!groups[p.category]) groups[p.category] = [];
            groups[p.category].push(p);
        });
        return groups;
    }, [form.watch("permissions")]);


    const togglePermission = (id) => {
        const current = form.getValues("permissions");
        form.setValue(
            "permissions",
            current.map((p) =>
                p.id === id ? { ...p, status: !p.status } : p
            )
        );
    };

    const toggleCategory = (perms) => {
        const current = form.getValues("permissions");
        const allActive = perms.every(
            (perm) => current.find((p) => p.id === perm.id)?.status
        );

        form.setValue(
            "permissions",
            current.map((p) =>
                perms.some((perm) => perm.id === p.id)
                    ? { ...p, status: !allActive }
                    : p
            )
        );
    };

    const toggleAll = () => {
        const current = form.getValues("permissions");
        const allActive = current.every((p) => p.status);

        form.setValue(
            "permissions",
            current.map((p) => ({ ...p, status: !allActive }))
        );
    };

    const { execute } = useAction(upsertRole, {
        onSuccess: (data) => {
            console.log('Role from server action', data.role)
            toast.success("Role saved", { id: "role-data" });
            onSubmit?.(data?.role);
            handleOpenChange()
        },
        onError: () => {
            toast.error("Failed to save role", { id: "role-data" });
            setLoading(false);
        },
    });


    const handleSubmit = async (values) => {
        console.log('values', values)
        setLoading(true);
        toast.loading(`${role ? "Updating " : "Creating  "} Role, please wait...`, { id: "role-data" });
        await execute({ userId: session?.user?.userId, formData: values });

    };


    const handleOpenChange = () => {
        onClose()
        setLoading(false)
        form.reset()
    }

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetContent className="min-w-[620px] bg-transparent border-0 p-2">
                <div className="bg-card rounded-lg overflow-hidden h-full shadow-lg p-4">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <ShieldUser className="h-5 w-5 text-primary" />
                            {role ? "Edit Role" : "Create Role"}
                        </SheetTitle>
                        <SheetDescription>
                            Define role details and permissions
                        </SheetDescription>
                    </SheetHeader>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className="flex flex-col "
                        >
                            <div className="flex-1 space-y-6 py-4">
                                {/* Role Name */}
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Role Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Color Picker (FIXED) */}
                                <FormField
                                    control={form.control}
                                    name="color"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Color</FormLabel>
                                            <div className="flex gap-2 flex-wrap">
                                                {colorPresets.map((c) => {
                                                    const selected = field.value === c;
                                                    return (
                                                        <button
                                                            key={c}
                                                            type="button"
                                                            onClick={() => field.onChange(c)}
                                                            className={`relative h-8 w-8 rounded-md border transition
                                                                     ${selected
                                                                    ? "ring-1 ring-primary ring-offset-2 scale-105"
                                                                    : "hover:scale-105"
                                                                }
                            `}
                                                            style={{ backgroundColor: c }}
                                                        >
                                                            {selected && (
                                                                <Check className="absolute inset-0 m-auto text-white h-4 w-4" />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {/* Description */}
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea rows={2} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Permissions */}
                                <FormItem>
                                    <div className="flex justify-between items-center">
                                        <FormLabel>Permissions</FormLabel>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={toggleAll}
                                        >
                                            Toggle All
                                        </Button>
                                    </div>

                                    <ScrollArea className="h-[45vh] border rounded p-3">
                                        <div className="grid gap-4 sm:grid-cols-1">
                                            {Object.entries(permissionCategories).map(
                                                ([category, perms]) => (
                                                    <div
                                                        key={category}
                                                        className="border rounded-md p-2"
                                                    >
                                                        <div className="flex justify-between items-center border-b pb-2">
                                                            <div>
                                                                <h3 className="capitalize font-semibold">
                                                                    {category}
                                                                </h3>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {perms.filter((p) => p.status).length}/
                                                                    {perms.length} enabled
                                                                </p>
                                                            </div>

                                                            <Switch
                                                                checked={perms.every((p) => p.status)}
                                                                onCheckedChange={() =>
                                                                    toggleCategory(perms)
                                                                }
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                                            {perms.map((p) => (
                                                                <label
                                                                    key={p.id}
                                                                    className="flex items-center gap-2 text-xs text-muted-foreground"
                                                                >
                                                                    <Checkbox
                                                                        checked={p.status}
                                                                        onCheckedChange={() =>
                                                                            togglePermission(p.id)
                                                                        }
                                                                    />
                                                                    {p.title}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </ScrollArea>
                                </FormItem>
                            </div>

                            <SheetFooter className=" border-t flex flex-row justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
                                        <Loader className="animate-spin" />
                                    ) : (
                                        <Save />
                                    )}
                                    Save Role
                                </Button>
                            </SheetFooter>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
