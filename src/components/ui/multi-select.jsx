import * as React from "react";
import { X, Check, ChevronsUpDown, Trash, Cross, ClosedCaption, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";



export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select items...",
    searchPlaceholder = "Search...",
    emptyMessage = "No items found.",
    className,
    badgeClassName,
    maxDisplayedItems = 2,
}) {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (value) => {
        const newSelected = selected?.includes(value)
            ? selected?.filter((item) => item.id !== value.id)
            : [...selected, value];
        onChange(newSelected);
    };

    const handleRemove = (value, e) => {
        e.stopPropagation();
        onChange(selected.filter((item) => item !== value));
    };

    const handleClearAll = (e) => {
        e.stopPropagation();
        onChange([]);
    };


    const remaningItems = options.filter(option => !selected.some(selected => selected.id === option.id))
    const displayedItems = selected?.slice(0, maxDisplayedItems);
    const remainingCount = selected?.length - maxDisplayedItems;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between min-h-10 h-auto py-2  dark:bg-darkSecondaryBackground flex flex-row items-center border rounded-md cursor-pointer"
                        , selected?.length > 0 ? "px-2" : "px-3", className)}
                >
                    <div className="flex flex-wrap gap-1.5 items-center">
                        {selected?.length === 0 ? (
                            <span className="text-muted-foreground text-sm font-normal">
                                {placeholder}
                            </span>
                        ) : (
                            <>
                                {displayedItems?.map((item, index) => (
                                    <Badge key={item.id} className={'dark:bg-darkFocusColor  border dark:border-white/10 dark:text-white py-1 px-2 flex flex-row items-center gap-2'}>
                                        <span className="dark:text-white/80">{item.name}</span>
                                        <CircleX size={14} className="cursor-pointer" onClick={(e) => {
                                            e.stopPropagation()
                                            console.log('remove-cat')
                                        }} />
                                    </Badge>
                                ))}
                                {remainingCount > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="dark:bg-darkFocusColor  border dark:border-white/10 dark:text-white py-1 px-2"
                                    >
                                        +{remainingCount} more
                                    </Badge>
                                )}
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                        {/* {selected?.length > 0 && (
                            <Button className="rounded-full p-1 hover:bg-muted transition-colors">
                                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </Button>
                        )} */}
                        {selected?.length > 0 && (
                            <button
                                className="rounded-full p-1 hover:bg-muted transition-colors"
                                onClick={handleClearAll}
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </button>
                        )}
                        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 dark:bg-darkPrimaryBackground" align="start" >
                <Command className="bg-popover dark:bg-darkSecondaryBackground">
                    <CommandInput placeholder={searchPlaceholder} className="h-9" />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                                const isSelected = selected?.some(item => item.id === option.id);


                                return (
                                    <CommandItem
                                        key={option.id}
                                        value={option.value}
                                        onSelect={() => handleSelect(option)}
                                        className="cursor-pointer"
                                    >
                                        <div
                                            className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary transition-colors",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground"
                                                    : "opacity-50"
                                            )}
                                        >
                                            {isSelected && <Check className="h-3 w-3" />}
                                        </div>
                                        <span>{option?.name}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
