import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DynamicIcon } from "lucide-react/dynamic";
import { getSidebarItems } from "@/constants/sidebar-items";

export function NavigationPermissionForm({ form, selectedNavItems: legacyItems, setSelectedNavItems: setLegacyItems }) {
    // Determine state source: either from RHF form or legacy props
    const rawPermissions = form ? form.watch("permissions") || [] : legacyItems || [];

    const handleUpdateActivePermissions = (updatedList) => {
        if (form) {
            form.setValue("permissions", updatedList, { shouldDirty: true, shouldValidate: true });
        } else {
            setLegacyItems?.(updatedList);
        }
    };

    // Helper to check if an item is selected (handles both object arrays and string arrays)
    const isItemSelected = (id) => {
        return rawPermissions.some(p => {
            const pValue = typeof p === 'object' ? p.value : p;
            
            // Match exactly or handle legacy navbar: prefix
            if (pValue === id) return (typeof p === 'object' ? p.status : true);
            
            // Legacy check
            if (typeof pValue === 'string' && pValue.startsWith('navbar:')) {
                const slug = id.split('.').pop();
                return pValue.endsWith(`:${slug}`);
            }
            return false;
        });
    };

    // Get the shared navigation structure
    const navigation = getSidebarItems("testid");

    const normalizePath = (url) => {
        if (!url) return null;
        // Strip /workspace/[id] - handle cases like /workspace/cmn... or just /workspace/id
        return url.replace(/^\/workspace\/[^/]+/, '') || '/';
    };

    // Group items by category for the UI
    const groupedNavigation = navigation.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = {
                category: item.category,
                icon: item.icon || "layout-dashboard",
                children: []
            };
        }
        if (item.type === 'parent') {
            acc[item.category].icon = item.icon;
            acc[item.category].parentTitle = item.title;
        } else {
            acc[item.category].children.push(item);
        }
        return acc;
    }, {});

    const navigationGroups = Object.values(groupedNavigation);

    const handleToggleItem = (child) => {
        const relativeUrl = normalizePath(child.url);
        const slug = relativeUrl === '/' ? 'home' : relativeUrl.replace(/^\//, '').replace(/\//g, '.');
        const id = `navigation.${slug}`;
        
        const currentPerms = [...rawPermissions];
        const existingIndex = currentPerms.findIndex(p => (typeof p === 'object' ? p.value : p) === id);

        if (existingIndex > -1) {
            let updated;
            if (typeof currentPerms[existingIndex] === 'object') {
                updated = currentPerms.map(p => p.value === id ? { ...p, status: !p.status } : p);
            } else {
                updated = currentPerms.filter(p => p !== id);
            }
            handleUpdateActivePermissions(updated);
        } else {
            // Adding new
            if (form) {
                handleUpdateActivePermissions([...currentPerms, {
                    id: `nav-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    value: id,
                    title: `Navigation ${child.title}`,
                    url: relativeUrl,
                    type: 'navigation',
                    category: child.category,
                    status: true
                }]);
            } else {
                handleUpdateActivePermissions([...currentPerms, id]);
            }
        }
    };

    const handleToggleCategory = (group) => {
        const childInfos = group.children.map(child => {
            const relativeUrl = normalizePath(child.url);
            const slug = relativeUrl === '/' ? 'home' : relativeUrl.replace(/^\//, '').replace(/\//g, '.');
            return {
                id: `navigation.${slug}`,
                title: `Navigation ${child.title}`,
                url: relativeUrl,
                category: child.category
            };
        });
        
        const allSelected = childInfos.every(ci => isItemSelected(ci.id));

        let updated = [...rawPermissions];

        if (allSelected) {
            // Deselect all
            if (form) {
                updated = updated.map(p => childInfos.some(ci => ci.id === p.value) ? { ...p, status: false } : p);
            } else {
                const idsToRemove = childInfos.map(ci => ci.id);
                updated = updated.filter(id => !idsToRemove.includes(id));
            }
        } else {
            // Select all
            childInfos.forEach((ci, index) => {
                if (!isItemSelected(ci.id)) {
                    if (form) {
                        const existingIndex = updated.findIndex(p => p.value === ci.id);
                        if (existingIndex > -1) {
                            updated[existingIndex] = { ...updated[existingIndex], status: true };
                        } else {
                            updated.push({
                                id: `nav-${Date.now()}-${Math.random().toString(36).substr(2, index)}`,
                                value: ci.id,
                                title: ci.title,
                                url: ci.url,
                                type: 'navigation',
                                category: ci.category,
                                status: true
                            });
                        }
                    } else {
                        updated.push(ci.id);
                    }
                }
            });
        }
        handleUpdateActivePermissions(updated);
    };

    return (
        <div className="p-6 space-y-6 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                {navigationGroups.map((group) => {
                    const itemIds = group.children.map(child => {
                        const relativeUrl = normalizePath(child.url);
                        const slug = relativeUrl === '/' ? 'home' : relativeUrl.replace(/^\//, '').replace(/\//g, '.');
                        return `navigation.${slug}`;
                    });
                    const allSelected = itemIds.length > 0 && itemIds.every(id => isItemSelected(id));

                    return (
                        <div key={group.category} className="p-4 rounded-xl border bg-card/50 hover:bg-card/80 transition-all space-y-3 group/nav">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover/nav:bg-primary/20 transition-colors">
                                        <DynamicIcon name={group.icon} size={18} className="text-primary" />
                                    </div>
                                    <h3 className="font-bold text-sm tracking-tight">{group.category}</h3>
                                </div>
                                <div className="flex items-center gap-2 pr-2">
                                    <Label htmlFor={`select-all-${group.category}`} className="text-sm opacity-40">Select All</Label>
                                    <Switch
                                        id={`select-all-${group.category}`}
                                        checked={allSelected}
                                        onCheckedChange={() => handleToggleCategory(group)}
                                        className="scale-75"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pl-2 border-l-2 border-primary/10 group-hover/nav:border-primary/30 transition-colors ml-4">
                                {group.children.length > 0 ? (
                                    group.children.map((child) => {
                                        const relativeUrl = normalizePath(child.url);
                                        const slug = relativeUrl === '/' ? 'home' : relativeUrl.replace(/^\//, '').replace(/\//g, '.');
                                        const id = `navigation.${slug}`;
                                        const isSelected = isItemSelected(id);
                                        
                                        return (
                                            <div key={child.title} className="flex items-center gap-3 group/item p-1">
                                                <Checkbox
                                                    id={id}
                                                    className="rounded-sm"
                                                    checked={isSelected}
                                                    onCheckedChange={() => handleToggleItem(child)}
                                                />
                                                <Label
                                                    htmlFor={id}
                                                    className="text-xs font-medium text-muted-foreground group-hover/item:text-foreground cursor-pointer transition-colors"
                                                >
                                                    {child.title}
                                                </Label>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="flex items-center gap-3 p-1">
                                        <Checkbox
                                            id={`${group.category}:root`}
                                            className="rounded-sm"
                                            checked={false} // Placeholder for root category selection if needed
                                        />
                                        <Label
                                            htmlFor={`${group.category}:root`}
                                            className="text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                                        >
                                            {group.parentTitle || 'View Menu'}
                                        </Label>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
