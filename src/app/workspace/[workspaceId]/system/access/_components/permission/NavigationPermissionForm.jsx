import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DynamicIcon } from "lucide-react/dynamic";
import { getSidebarItems } from "@/constants/sidebar-items";

export function NavigationPermissionForm({ selectedNavItems, setSelectedNavItems }) {
    // Get the shared navigation structure
    const navigation = getSidebarItems("testid");

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
            acc[item.category].children.push(item.title);
        }
        return acc;
    }, {});

    const navigationGroups = Object.values(groupedNavigation);

    const handleToggleItem = (id) => {
        setSelectedNavItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleToggleCategory = (group) => {
        const itemIds = group.children.length > 0
            ? group.children.map(child => `${group.category}:${child}`)
            : [`${group.category}:root`];

        const allSelected = itemIds.every(id => selectedNavItems.includes(id));

        if (allSelected) {
            setSelectedNavItems(prev => prev.filter(id => !itemIds.includes(id)));
        } else {
            setSelectedNavItems(prev => [...new Set([...prev, ...itemIds])]);
        }
    };

    return (
        <div className="p-6 space-y-6 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                    {navigationGroups.map((group) => {
                        const itemIds = group.children.length > 0
                            ? group.children.map(child => `${group.category}:${child}`)
                            : [`${group.category}:root`];
                        const allSelected = itemIds.every(id => selectedNavItems.includes(id));

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
                                        group.children.map((childTitle) => {
                                            const id = `${group.category}:${childTitle}`;
                                            return (
                                                <div key={childTitle} className="flex items-center gap-3 group/item p-1">
                                                    <Checkbox
                                                        id={id}
                                                        className="rounded-sm"
                                                        checked={selectedNavItems.includes(id)}
                                                        onCheckedChange={() => handleToggleItem(id)}
                                                    />
                                                    <Label
                                                        htmlFor={id}
                                                        className="text-xs font-medium text-muted-foreground group-hover/item:text-foreground cursor-pointer transition-colors"
                                                    >
                                                        {childTitle}
                                                    </Label>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className="flex items-center gap-3 p-1">
                                            <Checkbox
                                                id={`${group.category}:root`}
                                                className="rounded-sm"
                                                checked={selectedNavItems.includes(`${group.category}:root`)}
                                                onCheckedChange={() => handleToggleItem(`${group.category}:root`)}
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
