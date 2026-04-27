import React, { useMemo } from "react";
import { FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Map, ShieldCheck, ChevronRight } from "lucide-react";
import { getSidebarItems } from "@/app/workspace/_lib/sidebar-nav-item";
import { useParams } from "next/navigation";

export function NavigationAccessForm({ form }) {
    const params = useParams();
    const workspaceId = params?.workspaceId || "testid";
    
    // Get sidebar items with their explicit permissions
    const sidebarItems = useMemo(() => getSidebarItems(workspaceId), [workspaceId]);

    // Group items by category for the accordion
    const navigationCategories = useMemo(() => {
        const groups = {};
        sidebarItems.forEach((item) => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });
        return groups;
    }, [sidebarItems]);

    const activePermissions = form.watch("permissions") || [];

    // Helper to check if a permission is active
    const isPermissionActive = (permValue) => {
        return activePermissions.some((p) => p.value === permValue && p.status);
    };

    // Toggle specific navigation permission
    const toggleNavPermission = (permission, title, category) => {
        const current = form.getValues("permissions") || [];
        const exists = current.find((p) => p.value === permission);

        if (exists) {
            form.setValue(
                "permissions",
                current.map((p) =>
                    p.value === permission ? { ...p, status: !p.status } : p
                )
            );
        } else {
            form.setValue("permissions", [
                ...current,
                {
                    id: `nav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    value: permission,
                    title: `Navigation: ${title}`,
                    category: category,
                    status: true,
                },
            ]);
        }
    };

    // Toggle all in category
    const toggleCategory = (perms) => {
        const current = form.getValues("permissions") || [];
        const allActive = perms.every((p) => isPermissionActive(p.permission));

        let updated = [...current];
        
        perms.forEach(p => {
            const existsIdx = updated.findIndex(up => up.value === p.permission);
            if (existsIdx > -1) {
                updated[existsIdx] = { ...updated[existsIdx], status: !allActive };
            } else if (!allActive) {
                updated.push({
                    id: `nav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    value: p.permission,
                    title: `Navigation: ${p.title}`,
                    category: p.category,
                    status: true
                });
            }
        });

        form.setValue("permissions", updated);
    };

    const categories = Object.entries(navigationCategories);

    return (
        <div className="p-2 space-y-6 pb-10">
            <FormItem className="space-y-4">
                <Accordion type="single" collapsible defaultValue={categories[0]?.[0]} className="space-y-3">
                    {categories.map(([category, items]) => {
                        const allActive = items.every((i) => isPermissionActive(i.permission));
                        const activeCount = items.filter((i) => isPermissionActive(i.permission)).length;

                        return (
                            <AccordionItem
                                key={category}
                                value={category}
                                className={`border border-primary/20 rounded-lg overflow-hidden transition-all duration-300 ${allActive ? "bg-primary/5 shadow-sm shadow-primary/5" : "bg-card/50"} group/cat`}
                            >
                                <div className="flex items-center justify-between w-full pr-4 bg-muted/40 hover:bg-muted/50 transition-colors group-data-[state=open]/cat:border-b border-primary/10">
                                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-transparent flex-1 border-0 cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-md border transition-colors ${allActive ? "bg-primary/20 border-primary/30 text-primary" : "bg-muted/40 border-border/40 text-muted-foreground opacity-60"}`}>
                                                <Map className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="text-[13px] font-bold capitalize tracking-tight">
                                                    {category.replace(/_/g, " ")}
                                                </h4>
                                                <p className="text-[9px] font-mono opacity-50">
                                                    {activeCount}/{items.length} routes visible
                                                </p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>

                                    <div className="flex items-center gap-3 z-10" onClick={(e) => e.stopPropagation()}>
                                        <span className={`text-[9px] font-bold uppercase tracking-widest transition-opacity ${allActive ? "text-primary font-black" : "text-muted-foreground opacity-40"}`}>
                                            {allActive ? "Exposed" : "Hidden"}
                                        </span>
                                        <Switch
                                            checked={allActive}
                                            onCheckedChange={() => toggleCategory(items)}
                                            className="scale-75 data-[state=unchecked]:bg-muted-foreground/20 border-primary/10"
                                        />
                                    </div>
                                </div>

                                <AccordionContent className="p-4 bg-background/30 shadow-inner border-t border-primary/10">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {items.map((item) => (
                                            <label
                                                key={item.permission}
                                                className="flex items-center gap-3 p-3 rounded-md border border-primary/5 bg-background/40 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer group"
                                            >
                                                <Checkbox
                                                    checked={isPermissionActive(item.permission)}
                                                    onCheckedChange={() =>
                                                        toggleNavPermission(item.permission, item.title, item.category)
                                                    }
                                                    className="transition-transform group-hover:scale-110"
                                                />
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-bold leading-tight truncate group-hover:text-primary transition-colors">
                                                            {item.title}
                                                        </span>
                                                        {item.type === 'parent' && (
                                                            <div className="px-1 rounded bg-primary/10 text-[7px] font-black text-primary uppercase">Main</div>
                                                        )}
                                                    </div>
                                                    <span className="text-[9px] text-muted-foreground opacity-50 font-mono truncate">
                                                        {item.url}
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
        </div>
    );
}
