import React, { useMemo } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        <ScrollArea className="flex-1 h-[68vh] p-6">
            <div className="space-y-8 pb-10">
                <div className="space-y-4">
                    {/* Role Name */}
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="grid gap-2 p-1">
                                <FormLabel className="text-xs opacity-50 ml-1">Role Identity</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        className="bg-secondary/30 border-border/40 h-12 rounded-md text-lg font-medium focus:ring-primary/20"
                                        placeholder="e.g. System Administrator"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Color Picker */}
                    <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                            <FormItem className="grid gap-3">
                                <FormLabel className="text-xs opacity-50 ml-1">Visual Signature</FormLabel>
                                <div className="flex flex-wrap gap-2.5 p-3 rounded-md bg-secondary/20 border border-border/30">
                                    {colorPresets.map((c) => {
                                        const selected = field.value === c;
                                        return (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => field.onChange(c)}
                                                className={`w-6 h-6 rounded-md transition-all duration-300 relative group ${selected
                                                    ? "ring-2 ring-primary ring-offset-4 ring-offset-background scale-110 shadow-lg"
                                                    : "hover:scale-110 opacity-60 hover:opacity-100"
                                                    }`}
                                                style={{ backgroundColor: c }}
                                                title={c}
                                            >
                                                {selected && <div className="absolute inset-0 rounded-md bg-white/20 animate-pulse" />}
                                            </button>
                                        );
                                    })}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Permissions */}
                <FormItem className="space-y-4">
                    <div className="flex items-center justify-between mx-1">
                        <FormLabel className="text-xs opacity-50">Operation Scopes</FormLabel>
                        <Button type="button" variant="ghost" size="sm" onClick={toggleAll} className="h-7 text-[10px] font-bold tracking-tighter">
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
                                                    {category.replace(/_/g, "")}
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
                                                className='data-[state=unchecked]:bg-muted-foreground/30'
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mt-4">
                                            {perms.map((p) => (
                                                <label
                                                    key={p.id}
                                                    className="flex items-start gap-3 p-2 rounded-md hover:bg-background/80 transition-colors cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={p.status}
                                                        onCheckedChange={() =>
                                                            togglePermission(p.id)
                                                        }
                                                        className="mt-0.5 transition-transform hover:scale-110"
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
                                    className="bg-secondary/30 border-border/40 rounded-md resize-none min-h-[100px] p-4 text-xs"
                                    placeholder="High-level overview of the role scope..."
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </ScrollArea>
    );
}
