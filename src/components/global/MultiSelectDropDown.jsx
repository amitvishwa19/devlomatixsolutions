import * as React from "react";
import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import DynamicIcon from "@/components/global/DynamicIcon";

const DEFAULT_CATEGORY = "General";

// Helper to highlight matching text
const HighlightText = ({ text, query }) => {
    if (!query.trim()) return <>{text}</>;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 text-inherit rounded-sm px-0.5">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};

export function MultiSelectDropDown({
    data = [],
    value,
    onChange,
    placeholder = "Select items...",
    searchPlaceholder = "Search...",
    className,
    columns = 1,
    maxSelection,
}) {
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(value || []);

    // Sync internal state when external value changes
    React.useEffect(() => {
        if (value !== undefined) {
            setInternalValue(value);
        }
    }, [value]);

    // Always use internal state for selections
    const selectedItems = internalValue;

    // Safe onChange handler
    const handleChange = (newValue) => {
        setInternalValue(newValue);
        onChange?.(newValue);
    };
    const [searchQuery, setSearchQuery] = useState("");

    // Check if any item has a category
    const hasCategories = useMemo(() => {
        return data.some((item) => item.category);
    }, [data]);

    // Group items by category (or use default if no categories)
    const groupedItems = useMemo(() => {
        const groups = {};
        data.forEach((item) => {
            const category = item.category || DEFAULT_CATEGORY;
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
        });
        return groups;
    }, [data]);

    // Filter items based on search
    const filteredGroups = useMemo(() => {
        if (!searchQuery.trim()) return groupedItems;

        const query = searchQuery.toLowerCase();
        const filtered = {};

        Object.entries(groupedItems).forEach(([category, items]) => {
            const matchingItems = items.filter(
                (item) =>
                    item.name.toLowerCase().includes(query) ||
                    (item.code && item.code.toLowerCase().includes(query)) ||
                    (item.description && item.description.toLowerCase().includes(query))
            );
            if (matchingItems.length > 0) {
                filtered[category] = matchingItems;
            }
        });

        return filtered;
    }, [groupedItems, searchQuery]);

    // Helper to get unique identifier from item (supports both id and value)
    const getItemId = (item) => item.id ?? item.value;

    // Get selected item IDs for checking
    const selectedValues = useMemo(() => {
        return selectedItems.map((item) => getItemId(item));
    }, [selectedItems]);

    // Check if max selection reached
    const isMaxReached = maxSelection !== undefined && selectedItems.length >= maxSelection;

    // Toggle individual item
    const toggleItem = (item) => {
        const itemId = getItemId(item);
        if (selectedValues.includes(itemId)) {
            handleChange(selectedItems.filter((v) => getItemId(v) !== itemId));
        } else if (!isMaxReached) {
            handleChange([...selectedItems, item]);
        }
    };

    // Clear all selections
    const clearAll = () => {
        handleChange([]);
    };

    // Remove single selection
    const removeSelection = (itemId) => {
        handleChange(selectedItems.filter((v) => getItemId(v) !== itemId));
    };

    // Handle remove from badge
    const handleRemove = (itemId, e) => {
        e.stopPropagation();
        removeSelection(itemId);
    };

    // Get unique categories from data, or use default order if categories exist
    const categoryOrder = useMemo(() => {
        if (!hasCategories) return [DEFAULT_CATEGORY];

        const defaultOrder = [
            "Clinical",
            "Surgical",
            "Critical Care",
            "Diagnostic",
            "Support",
            "Administrative",
        ];

        // Get all unique categories from data
        const dataCategories = new Set(
            data.map((item) => item.category || DEFAULT_CATEGORY)
        );

        // Return categories in default order first, then any additional ones
        const orderedCategories = defaultOrder.filter((cat) => dataCategories.has(cat));
        const additionalCategories = Array.from(dataCategories).filter(
            (cat) => !defaultOrder.includes(cat)
        );

        return [...orderedCategories, ...additionalCategories];
    }, [data, hasCategories]);

    return (
        <div className={cn("w-full", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between min-h-10 h-auto",
                            selectedItems.length > 0 ? "px-2 py-2" : "px-3"
                        )}
                    >
                        {selectedItems.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {selectedItems.map((item) => (
                                    <Badge
                                        key={getItemId(item)}
                                        variant="secondary"
                                        className="flex items-center gap-1 pr-1"
                                    >
                                        <span className="truncate max-w-[150px]">{item.name || item.title}</span>
                                        <div
                                            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-muted-foreground/20 p-0.5"
                                            onClick={(e) => handleRemove(getItemId(item), e)}
                                        >
                                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                        </div>
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <span className="text-muted-foreground font-normal">{placeholder}</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />
                        <ScrollArea className="h-[300px]">
                            <CommandList>
                                <CommandEmpty>No items found.</CommandEmpty>
                                {categoryOrder
                                    .filter((cat) => filteredGroups[cat])
                                    .map((category) => {
                                        const items = filteredGroups[category];

                                        return (
                                            <CommandGroup key={category} heading={hasCategories ? category : undefined}>
                                                <div
                                                    className="grid gap-1"
                                                    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                                                >
                                                    {items.map((item) => {
                                                        const itemId = getItemId(item);
                                                        const isSelected = selectedValues.includes(itemId);
                                                        const isDisabled = !isSelected && isMaxReached;
                                                        return (
                                                            <CommandItem
                                                                key={itemId}
                                                                value={item.name}
                                                                onSelect={() => !isDisabled && toggleItem(item)}
                                                                className={cn(
                                                                    "cursor-pointer",
                                                                    isDisabled && "opacity-50 cursor-not-allowed"
                                                                )}
                                                            >
                                                                <div
                                                                    className={cn(
                                                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                                        isSelected
                                                                            ? "bg-primary text-primary-foreground"
                                                                            : "opacity-50 [&_svg]:invisible"
                                                                    )}
                                                                >
                                                                    <Check className="h-3 w-3" />
                                                                </div>
                                                                <div className="flex items-center gap-2 flex-1">
                                                                    {item.color && (
                                                                        <span
                                                                            className="h-3 w-3 rounded-full shrink-0"
                                                                            style={{ backgroundColor: item.color }}
                                                                        />
                                                                    )}
                                                                    <div className="flex flex-col flex-1 min-w-0">
                                                                        <span className="font-medium">{item.name}</span>
                                                                        {item.description && (
                                                                            <span className="text-xs text-muted-foreground truncate">
                                                                                {item.description}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {item.icon && (
                                                                    <DynamicIcon
                                                                        name={item.icon}
                                                                        size={16}
                                                                        className="shrink-0 ml-auto"
                                                                        style={{ color: item.color }}
                                                                    />
                                                                )}
                                                            </CommandItem>
                                                        );
                                                    })}
                                                </div>
                                            </CommandGroup>
                                        );
                                    })}
                            </CommandList>
                        </ScrollArea>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}