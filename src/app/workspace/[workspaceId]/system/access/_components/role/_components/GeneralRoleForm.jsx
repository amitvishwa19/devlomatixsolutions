import React, { useMemo } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export function GeneralRoleForm({ form }) {
    
    // Group permissions into categories for easier visualization
    const permissionCategories = useMemo(() => {
        const groups = {};
        form.getValues("permissions")?.forEach((p) => {
            if (!groups[p.category]) groups[p.category] = [];
            groups[p.category].push(p);
        });
        return groups;
    }, [form.watch("permissions")]);

    // Handle individual permission toggle
    const togglePermission = (id) => {
        const current = form.getValues("permissions");
        form.setValue(
            "permissions",
            current.map((p) =>
                p.id === id ? { ...p, status: !p.status } : p
            )
        );
    };

    // Handle category-level toggle (select/deselect all in category)
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

    // Handle global toggle
    const toggleAll = () => {
        const current = form.getValues("permissions");
        const allActive = current.every((p) => p.status);

        form.setValue(
            "permissions",
            current.map((p) => ({ ...p, status: !allActive }))
        );
    };

    return (
        <div className="p-6 space-y-8 pb-10">
            {/* Permissions */}
            <FormItem className="space-y-4">
                <div className="flex items-center justify-between mx-1">
                    <FormLabel className="text-xs opacity-50 font-bold">Operation Scopes</FormLabel>
                    <Button type="button" variant="ghost" size="sm" onClick={toggleAll} className="h-7 text-[10px] font-bold tracking-tighter uppercase">
                        {form.getValues("permissions")?.every(p => p.status) ? "Clear All" : "Select Global"}
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-1">
                    {Object.entries(permissionCategories).map(
                        ([category, perms]) => {
                            const allActive = perms.every((p) => p.status);
                            return (
                                <div
                                    key={category}
                                    className={`border rounded-md p-4 transition-all duration-500 ${allActive ? "border-primary/50 bg-primary/5 shadow-md shadow-primary/5" : "border-border/40 bg-muted/5 hover:border-primary/30 hover:bg-muted/30"}`}
                                >
                                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-border/40">
                                        <div>
                                            <h3 className="text-sm font-bold capitalize">
                                                {category.replace(/_/g, " ")}
                                            </h3>
                                            <p className="text-[10px] font-mono text-primary/70 mt-0.5">
                                                {perms.filter((p) => p.status).length}/
                                                {perms.length} enabled
                                            </p>
                                        </div>

                                        <Switch
                                            checked={allActive}
                                            onCheckedChange={() =>
                                                toggleCategory(perms)
                                            }
                                            className='data-[state=unchecked]:bg-muted-foreground/30 scale-75'
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        {perms.map((p) => (
                                            <label
                                                key={p.id}
                                                className="flex items-start gap-3 p-2 rounded-md hover:bg-background/80 transition-colors cursor-pointer group"
                                            >
                                                <Checkbox
                                                    checked={p.status}
                                                    onCheckedChange={() =>
                                                        togglePermission(p.id)
                                                    }
                                                    className="mt-0.5 transition-transform group-hover:scale-110"
                                                />
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <span className="text-xs font-bold leading-tight truncate">
                                                        {p.title}
                                                    </span>
                                                    <span className="text-[9px] text-muted-foreground opacity-60 font-mono truncate">
                                                        {p.value}
                                                    </span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )
                        }
                    )}
                </div>
            </FormItem>

            {/* Description */}
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel className="text-xs opacity-50 ml-1">Role Context</FormLabel>
                        <FormControl>
                            <Textarea
                                rows={4}
                                {...field}
                                className="bg-secondary/30 border border-primary/20 rounded-md resize-none min-h-[100px] p-4 text-xs"
                                placeholder="High-level overview of the role scope..."
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
