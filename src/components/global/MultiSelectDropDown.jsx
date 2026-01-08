import * as React from "react";
import { useState, useMemo } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
    placeholder = "Select departments...",
    className,
    columns = 1,
    maxSelection,
}) {
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState([]);

    // Use controlled value if provided, otherwise use internal state
    const selectedItems = value !== undefined ? value : internalValue;

    // Safe onChange handler
    const handleChange = (newValue) => {
        if (value === undefined) {
            setInternalValue(newValue);
        }
        onChange?.(newValue);
    };
    const [searchQuery, setSearchQuery] = useState("");

    // Check if any department has a category
    const hasCategories = useMemo(() => {
        return data.some((dept) => dept.category);
    }, [data]);

    // Group departments by category (or use default if no categories)
    const groupedDepartments = useMemo(() => {
        const groups = {};
        data.forEach((dept) => {
            const category = dept.category || DEFAULT_CATEGORY;
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(dept);
        });
        return groups;
    }, [data]);

    // Filter departments based on search
    const filteredGroups = useMemo(() => {
        if (!searchQuery.trim()) return groupedDepartments;

        const query = searchQuery.toLowerCase();
        const filtered = {};

        Object.entries(groupedDepartments).forEach(([category, depts]) => {
            const matchingDepts = depts.filter(
                (dept) =>
                    dept.name.toLowerCase().includes(query) ||
                    (dept.code && dept.code.toLowerCase().includes(query)) ||
                    (dept.description && dept.description.toLowerCase().includes(query))
            );
            if (matchingDepts.length > 0) {
                filtered[category] = matchingDepts;
            }
        });

        return filtered;
    }, [groupedDepartments, searchQuery]);

    // Get selected department values for checking
    const selectedValues = useMemo(() => {
        return selectedItems.map((dept) => dept.value);
    }, [selectedItems]);

    // Check if max selection reached
    const isMaxReached = maxSelection !== undefined && selectedItems.length >= maxSelection;

    // Toggle individual department
    const toggleDepartment = (dept) => {
        if (selectedValues.includes(dept.value)) {
            handleChange(selectedItems.filter((v) => v.value !== dept.value));
        } else if (!isMaxReached) {
            handleChange([...selectedItems, dept]);
        }
    };

    // Clear all selections
    const clearAll = () => {
        handleChange([]);
    };

    // Remove single selection
    const removeSelection = (deptValue) => {
        handleChange(selectedItems.filter((v) => v.value !== deptValue));
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
            data.map((dept) => dept.category || DEFAULT_CATEGORY)
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
                    <div
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                            "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                            "cursor-pointer hover:bg-accent/50"
                        )}
                    >
                        <div className="flex flex-1 flex-wrap gap-1.5">
                            {selectedItems.length > 0 ? (
                                selectedItems.map((dept) => (
                                    <Badge
                                        key={dept.value}
                                        variant="secondary"
                                        className="gap-1.5 pr-1 text-xs h-6 pl-1.5 rounded-md"
                                        style={dept.color ? {
                                            borderLeftWidth: "3px",
                                            borderLeftColor: dept.color,
                                        } : undefined}
                                    >
                                        {dept.icon && (
                                            <DynamicIcon
                                                name={dept.icon}
                                                size={14}
                                                className="shrink-0"
                                                style={dept.color ? { color: dept.color } : undefined}
                                            />
                                        )}
                                        <span className="max-w-[100px] truncate">{dept.name}</span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeSelection(dept.value);
                                            }}
                                            className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-muted-foreground">{placeholder}</span>
                            )}
                        </div>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Search roles..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />
                        <CommandList>
                            <CommandEmpty>No items found.</CommandEmpty>
                            {categoryOrder
                                .filter((cat) => filteredGroups[cat])
                                .map((category) => {
                                    const depts = filteredGroups[category];

                                    return (
                                        <CommandGroup key={category} heading={hasCategories ? category : undefined}>
                                            <div
                                                className="grid gap-1"
                                                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                                            >
                                                {depts.map((dept) => {
                                                    const isSelected = selectedValues.includes(dept.value);
                                                    const isDisabled = !isSelected && isMaxReached;
                                                    return (
                                                        <CommandItem
                                                            key={dept.value}
                                                            value={dept.name}
                                                            onSelect={() => !isDisabled && toggleDepartment(dept)}
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

                                                                <div className="flex flex-col flex-1 min-w-0">
                                                                    <span className="font-medium">{dept.name}</span>
                                                                    {dept.description && (
                                                                        <span className="text-xs text-muted-foreground truncate">
                                                                            {dept.description}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {dept.icon && (
                                                                <DynamicIcon
                                                                    name={dept.icon}
                                                                    size={16}
                                                                    className="shrink-0 ml-auto"

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
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}