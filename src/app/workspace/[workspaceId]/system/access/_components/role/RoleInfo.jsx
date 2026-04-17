import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield } from "lucide-react";
import { useAccess } from "../../_provider/accessProvider";

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

export function RoleInfo({ form }) {
    const { roles } = useAccess();
    return (
        <div className="p-6 space-y-8">
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
                                    className="bg-secondary/30 border border-primary/20 rounded-md text-lg font-medium focus:ring-primary/20"
                                    placeholder="e.g. System Administrator"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Base Role Inheritance */}
                <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                        <FormItem className="grid gap-2 p-1">
                            <FormLabel className="text-xs opacity-50 ml-1">Inherit From (Optional)</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value || "none"} value={field.value || "none"}>
                                    <SelectTrigger className="bg-secondary/30 border border-primary/20 rounded-md focus:ring-primary/20 text-xs">
                                        <SelectValue placeholder="Select a base role to inherit permissions" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-primary/20">
                                        <SelectItem value="none" className="text-xs focus:bg-primary/10 text-muted-foreground italic">No Inheritance</SelectItem>
                                        {roles?.filter(r => r.id !== form.getValues("id")).map((r) => (
                                            <SelectItem key={r.id} value={r.id} className="text-xs focus:bg-primary/10">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color || "#0d9488" }} />
                                                    <span className="font-medium">{r.title}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                            <p className="text-[10px] text-muted-foreground opacity-60 ml-1">
                                Inheriting will automatically merge this role's permissions with the base role.
                            </p>
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
        </div>
    );
}
