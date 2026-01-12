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
import { DynamicIcon } from "lucide-react/dynamic";


const DEFAULT_CATEGORY = "General";

/* ---------------- Highlight helper ---------------- */

const HighlightText = ({ text = "", query = "" }) => {
    if (!query.trim()) return <>{text}</>;

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");

    return (
        <>
            {text.split(regex).map((part, i) =>
                regex.test(part) ? (
                    <mark
                        key={i}
                        className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5"
                    >
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};

/* ================= COMPONENT ================= */

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
    const [searchQuery, setSearchQuery] = useState("");

    /* ---------- NORMALIZED INTERNAL STATE ---------- */

    const normalizeValue = (val) => {
        if (Array.isArray(val)) return val;
        if (val) return [val];
        return [];
    };

    const [internalValue, setInternalValue] = useState(
        normalizeValue(value)
    );

    React.useEffect(() => {
        setInternalValue(normalizeValue(value));
    }, [value]);

    const selectedItems = Array.isArray(internalValue)
        ? internalValue
        : [];

    /* ---------- Helpers ---------- */

    const getItemId = (item) => {
        if (!item) return undefined;
        if (typeof item === "string") return item;
        return item.id ?? item.value;
    };

    const selectedValues = useMemo(() => {
        return selectedItems.map(getItemId).filter(Boolean);
    }, [selectedItems]);

    const handleChange = (next) => {
        const normalized = normalizeValue(next);
        setInternalValue(normalized);
        onChange?.(normalized);
    };

    const isMaxReached =
        maxSelection !== undefined &&
        selectedItems.length >= maxSelection;

    /* ---------- Grouping ---------- */

    const hasCategories = useMemo(
        () => data.some((item) => item.category),
        [data]
    );

    const groupedItems = useMemo(() => {
        const groups = {};
        data.forEach((item) => {
            const cat = item.category || DEFAULT_CATEGORY;
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });
        return groups;
    }, [data]);

    const filteredGroups = useMemo(() => {
        if (!searchQuery.trim()) return groupedItems;

        const q = searchQuery.toLowerCase();
        const out = {};

        Object.entries(groupedItems).forEach(([cat, items]) => {
            const matches = items.filter(
                (i) =>
                    i.name?.toLowerCase().includes(q) ||
                    i.title?.toLowerCase().includes(q) ||
                    i.code?.toLowerCase().includes(q) ||
                    i.description?.toLowerCase().includes(q)
            );
            if (matches.length) out[cat] = matches;
        });

        return out;
    }, [groupedItems, searchQuery]);

    /* ---------- Actions ---------- */

    const toggleItem = (item) => {
        const id = getItemId(item);
        if (!id) return;

        if (selectedValues.includes(id)) {
            handleChange(
                selectedItems.filter((v) => getItemId(v) !== id)
            );
        } else if (!isMaxReached) {
            handleChange([...selectedItems, item]);
        }
    };

    const removeSelection = (id) => {
        handleChange(
            selectedItems.filter((v) => getItemId(v) !== id)
        );
    };

    const clearAll = () => handleChange([]);

    /* ================= UI ================= */

    return (
        <div className={cn("w-full", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                            "w-full justify-between min-h-10 h-auto",
                            selectedItems.length ? "px-2 py-2" : "px-3"
                        )}
                    >
                        {selectedItems.length ? (
                            <div className="flex flex-wrap gap-1">
                                {selectedItems.map((item) => {
                                    const id = getItemId(item);
                                    return (
                                        <Badge
                                            key={id}
                                            variant="secondary"
                                            className="flex items-center gap-1 pr-1"
                                        >
                                            <span className="truncate max-w-[150px]">
                                                {item.name || item.title}
                                            </span>
                                            <span
                                                className="p-0.5 hover:bg-muted rounded-full"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeSelection(id);
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </span>
                                        </Badge>
                                    );
                                })}
                            </div>
                        ) : (
                            <span className="text-muted-foreground">
                                {placeholder}
                            </span>
                        )}
                        <ChevronsUpDown className="h-4 w-4 opacity-50 ml-2" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    align="start"
                >
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />

                        <ScrollArea className="h-[300px]">
                            <CommandList>
                                <CommandEmpty>No items found.</CommandEmpty>

                                {Object.entries(filteredGroups).map(
                                    ([category, items]) => (
                                        <CommandGroup
                                            key={category}
                                            heading={
                                                hasCategories
                                                    ? category
                                                    : undefined
                                            }
                                        >
                                            <div
                                                className="grid gap-1"
                                                style={{
                                                    gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`,
                                                }}
                                            >
                                                {items.map((item) => {
                                                    const id = getItemId(item);
                                                    const selected =
                                                        selectedValues.includes(
                                                            id
                                                        );
                                                    const disabled =
                                                        !selected &&
                                                        isMaxReached;

                                                    return (
                                                        <CommandItem
                                                            key={id}
                                                            value={
                                                                item.name ||
                                                                item.title
                                                            }
                                                            onSelect={() =>
                                                                !disabled &&
                                                                toggleItem(item)
                                                            }
                                                            className={cn(
                                                                disabled &&
                                                                "opacity-50 cursor-not-allowed"
                                                            )}
                                                        >
                                                            <div
                                                                className={cn(
                                                                    "mr-2 h-4 w-4 flex items-center justify-center rounded-md border border-muted-foreground",
                                                                    selected
                                                                        ? "bg-primary text-primary-foreground"
                                                                        : "opacity-50 [&_svg]:invisible"
                                                                )}
                                                            >
                                                                <Check className="h-3 w-3" />
                                                            </div>

                                                            <div className="flex flex-col flex-1 min-w-0">
                                                                <span className="font-medium">
                                                                    <HighlightText
                                                                        text={
                                                                            item.name ||
                                                                            item.title
                                                                        }
                                                                        query={
                                                                            searchQuery
                                                                        }
                                                                    />
                                                                </span>
                                                                {item.description && (
                                                                    <span className="text-xs text-muted-foreground truncate">
                                                                        {
                                                                            item.description
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* {item.icon && (
                                                                <DynamicIcon
                                                                    name={
                                                                        item.icon
                                                                    }
                                                                    size={16}
                                                                    className="ml-auto"
                                                                    style={{
                                                                        color:
                                                                            item.color,
                                                                    }}
                                                                />
                                                            )} */}
                                                        </CommandItem>
                                                    );
                                                })}
                                            </div>
                                        </CommandGroup>
                                    )
                                )}
                            </CommandList>
                        </ScrollArea>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
