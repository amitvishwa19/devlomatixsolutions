import React, { useMemo } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShieldCheck } from "lucide-react";

export function GeneralRoleForm({ form }) {

    // Group permissions into categories for easier visualization (filtering out navigation permissions)
    const permissionCategories = useMemo(() => {
        const groups = {};
        form.getValues("permissions")
            ?.filter((p) => p.type !== "NAVIGATION" && !p.value?.startsWith("navigation."))
            .forEach((p) => {
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

    const categories = Object.entries(permissionCategories);

    return (
        <div className="p-2 space-y-8 pb-10">
            {/* Permissions */}
            <FormItem className="space-y-4">


                <Accordion id='permission-accordian' type="single" collapsible defaultValue={categories[0]?.[0]} className="space-y-3">
                    {categories.map(([category, perms]) => {
                        const allActive = perms.every((p) => p.status);
                        const activeCount = perms.filter((p) => p.status).length;

                        return (
                            <AccordionItem
                                key={category}
                                value={category}
                                className={`border border-primary/20 rounded-lg overflow-hidden transition-all duration-300 ${allActive ? "bg-primary/5" : "bg-card/50"} group/cat`}
                            >
                                <div className="flex items-center justify-between w-full pr-4 bg-muted/40 hover:bg-muted/50 transition-colors group-data-[state=open]/cat:border-b border-primary/10">
                                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-transparent flex-1 border-0 cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-md border transition-colors ${allActive ? "bg-primary/20 border-primary/30 text-primary" : "bg-muted/40 border-border/40 text-muted-foreground opacity-60"}`}>
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="text-[13px] font-bold capitalize tracking-tight">
                                                    {category.replace(/_/g, " ")}
                                                </h4>
                                                <p className="text-[9px] font-mono opacity-50">
                                                    {activeCount}/{perms.length} operations active
                                                </p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>

                                    <div className="flex items-center gap-3 z-10" onClick={(e) => e.stopPropagation()}>
                                        <span className={`text-[9px] font-bold uppercase tracking-widest transition-opacity ${allActive ? "text-primary font-black" : "text-muted-foreground opacity-40"}`}>
                                            {allActive ? "Full Access" : "Partial"}
                                        </span>
                                        <Switch
                                            checked={allActive}
                                            onCheckedChange={() => toggleCategory(perms)}
                                            className="scale-75 data-[state=unchecked]:bg-muted-foreground/20 border-primary/10"
                                        />
                                    </div>
                                </div>

                                <AccordionContent className="p-4 bg-background/30 shadow-inner border border-primary/10 overflow-hidden">
                                    <div className="grid grid-cols-2 gap-3">
                                        {perms.map((p) => (
                                            <label
                                                key={p.id}
                                                className="flex items-start gap-3 p-2.5 rounded-md border border-transparent hover:border-primary/10 hover:bg-primary/5 transition-all cursor-pointer group"
                                            >
                                                <Checkbox
                                                    checked={p.status}
                                                    onCheckedChange={() => togglePermission(p.id)}
                                                    className="mt-0.5 transition-transform group-hover:scale-110"
                                                />
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <span className="text-[11px] font-bold leading-tight truncate transition-colors group-hover:text-primary">
                                                        {p.title}
                                                    </span>
                                                    <span className="text-[9px] text-muted-foreground opacity-50 font-mono truncate">
                                                        {p.value}
                                                    </span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
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
