import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    RowSelectionState,
} from "@tanstack/react-table";
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Search, X, RotateCcw, Download, Columns3, Trash2, CheckSquare, CalendarIcon, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";




function DateRangeFilter({ onDateChange, value }) {
    const [selectedPreset, setSelectedPreset] = React.useState(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const [customRange, setCustomRange] = React.useState({ from: undefined, to: undefined });

    const presets = [
        { label: "Today", value: "today" },
        { label: "Yesterday", value: "yesterday" },
        { label: "This Week", value: "week" },
        { label: "This Month", value: "month" },
        { label: "Custom", value: "custom" },
    ];

    const getDateRange = (preset) => {
        const today = new Date();
        switch (preset) {
            case "today":
                return { from: startOfDay(today), to: endOfDay(today) };
            case "yesterday":
                const yesterday = subDays(today, 1);
                return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
            case "week":
                return { from: startOfWeek(today, { weekStartsOn: 1 }), to: endOfWeek(today, { weekStartsOn: 1 }) };
            case "month":
                return { from: startOfMonth(today), to: endOfMonth(today) };
            default:
                return { from: undefined, to: undefined };
        }
    };

    const handlePresetSelect = (preset) => {
        setSelectedPreset(preset);
        if (preset !== "custom") {
            const range = getDateRange(preset);
            onDateChange(range);
            setIsOpen(false);
        }
    };

    const handleCustomRangeSelect = (range) => {
        if (range) {
            setCustomRange(range);
            if (range.from && range.to) {
                onDateChange(range);
            }
        }
    };

    const clearFilter = (e) => {
        e.stopPropagation();
        setSelectedPreset(null);
        setCustomRange({ from: undefined, to: undefined });
        onDateChange(undefined);
    };

    const getDisplayText = () => {
        if (!selectedPreset) return "Created Date";
        if (selectedPreset === "custom" && customRange.from) {
            return customRange.to
                ? `${format(customRange.from, "MMM d")} - ${format(customRange.to, "MMM d")}`
                : format(customRange.from, "MMM d, yyyy");
        }
        return presets.find((p) => p.value === selectedPreset)?.label || "Created Date";
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "h-9 border-filter-border bg-filter-bg hover:bg-secondary justify-between gap-2 min-w-[140px]",
                        selectedPreset && "border-primary/50 bg-badge-bg text-badge-text"
                    )}
                >
                    <span className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">{getDisplayText()}</span>
                    </span>
                    {selectedPreset ? (
                        <X className="h-3.5 w-3.5 opacity-60 hover:opacity-100" onClick={clearFilter} />
                    ) : (
                        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover border-border shadow-lg z-50" align="start">
                <div className="flex">
                    <div className="border-r border-border p-2 space-y-1">
                        {presets.map((preset) => (
                            <button
                                key={preset.value}
                                onClick={() => handlePresetSelect(preset.value)}
                                className={cn(
                                    "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                                    selectedPreset === preset.value
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-accent text-foreground"
                                )}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                    {selectedPreset === "custom" && (
                        <div className="p-2">
                            <Calendar
                                mode="range"
                                selected={customRange}
                                onSelect={handleCustomRangeSelect}
                                numberOfMonths={2}
                                className="pointer-events-auto"
                            />
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

// ============= ColumnFilter Component =============


function ColumnFilter({
    column,
    label,
    options,
    selectedValues,
    onFilterChange,
}) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");

    const filteredOptions = options.filter((option) =>
        option.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleOption = (option) => {
        const newValues = selectedValues.includes(option)
            ? selectedValues.filter((v) => v !== option)
            : [...selectedValues, option];
        onFilterChange(column, newValues);
    };

    const clearFilter = (e) => {
        e.stopPropagation();
        onFilterChange(column, []);
        setSearchQuery("");
    };

    const getDisplayText = () => {
        if (selectedValues.length === 0) return label;
        if (selectedValues.length === 1) return selectedValues[0];
        return `${selectedValues.length} selected`;
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "h-9 border-filter-border bg-filter-bg hover:bg-secondary justify-between gap-2 min-w-[120px]",
                        selectedValues.length > 0 && "border-primary/50 bg-badge-bg text-badge-text"
                    )}
                >
                    <span className="text-sm font-medium truncate max-w-[100px]">{getDisplayText()}</span>
                    {selectedValues.length > 0 ? (
                        <X className="h-3.5 w-3.5 opacity-60 hover:opacity-100 shrink-0" onClick={clearFilter} />
                    ) : (
                        <ChevronDown className="h-3.5 w-3.5 opacity-60 shrink-0" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-0 bg-card border-border shadow-lg z-50" align="start">
                <div className="p-2 border-b border-border">
                    <Input
                        placeholder={`Search ${label.toLowerCase()}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 text-sm"
                    />
                </div>
                <div className="max-h-60 overflow-auto p-1">
                    {filteredOptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No results found</p>
                    ) : (
                        filteredOptions.map((option) => (
                            <button
                                key={option}
                                onClick={() => toggleOption(option)}
                                className={cn(
                                    "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors text-left",
                                    selectedValues.includes(option)
                                        ? "bg-primary/10 text-foreground"
                                        : "hover:bg-accent text-foreground"
                                )}
                            >
                                <div
                                    className={cn(
                                        "h-4 w-4 rounded border flex items-center justify-center shrink-0",
                                        selectedValues.includes(option)
                                            ? "bg-primary border-primary"
                                            : "border-input"
                                    )}
                                >
                                    {selectedValues.includes(option) && (
                                        <Check className="h-3 w-3 text-primary-foreground" />
                                    )}
                                </div>
                                <span className="truncate">{option}</span>
                            </button>
                        ))
                    )}
                </div>
                {selectedValues.length > 0 && (
                    <div className="p-2 border-t border-border">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-muted-foreground hover:text-foreground"
                            onClick={() => onFilterChange(column, [])}
                        >
                            Clear filter
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}

// ============= DataTable Component =============



export function DataTable({
    columns,
    data,
    filter = [],
    searchPlaceholder = "Search...",
    enableRowSelection = true,
    enableColumnVisibility = true,
    enableExport = true,
    onDeleteSelected,
}) {
    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState("");
    const [dateRange, setDateRange] = React.useState(undefined);
    const [columnFilterValues, setColumnFilterValues] = React.useState({});

    // Add selection column if enabled
    const columnsWithSelection = React.useMemo(() => {
        if (!enableRowSelection) return columns;

        const selectionColumn = {
            id: "select",

            enableSorting: false,
            enableHiding: false,
        };

        return [selectionColumn, ...columns];
    }, [columns, enableRowSelection]);

    // Get unique values for each filter column
    const getUniqueValues = (columnKey) => {
        const values = data
            .map((row) => {
                const value = (row)[columnKey];
                return value !== null && value !== undefined ? String(value) : "";
            })
            .filter((value) => value !== "");
        return [...new Set(values)].sort();
    };

    // Handle column filter change
    const handleColumnFilterChange = (column, values) => {
        setColumnFilterValues((prev) => ({
            ...prev,
            [column]: values,
        }));
    };

    // Filter data based on all filters
    const filteredData = React.useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        let result = [...data];

        // Apply date range filter
        if (dateRange?.from) {
            result = result.filter((row) => {
                const createdAt = (row);
                if (!createdAt) return true;
                const rowDate = new Date(createdAt);
                const fromDate = dateRange.from;
                const toDate = dateRange.to || dateRange.from;
                return rowDate >= fromDate && rowDate <= toDate;
            });
        }

        // Apply column filters
        Object.entries(columnFilterValues).forEach(([column, values]) => {
            if (values.length > 0) {
                result = result.filter((row) => {
                    const cellValue = (row);
                    return values.includes(String(cellValue));
                });
            }
        });

        return result;
    }, [data, dateRange, columnFilterValues]);

    const table = useReactTable({
        data: filteredData,
        columns: columnsWithSelection,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesString",
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    });

    const hasActiveFilters =
        globalFilter ||
        dateRange ||
        Object.values(columnFilterValues).some((v) => v.length > 0);

    const clearAllFilters = () => {
        setGlobalFilter("");
        setDateRange(undefined);
        setColumnFilterValues({});
    };

    const formatColumnLabel = (key) => {
        return key
            .replace(/([A-Z])/g, "$1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    };

    // Export to CSV
    const exportToCSV = () => {
        const visibleColumns = table.getVisibleFlatColumns().filter((col) => col.id !== "select" && col.id !== "actions");
        const headers = visibleColumns.map((col) => {
            const header = col.columnDef.header;
            if (typeof header === "string") return header;
            return col.id;
        });

        const rows = table.getFilteredRowModel().rows.map((row) => {
            return visibleColumns.map((col) => {
                const value = row.getValue(col.id);
                if (value instanceof Date) return value.toISOString();
                if (typeof value === "object") return JSON.stringify(value);
                return String(value ?? "");
            });
        });

        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `export-${new Date().toISOString().split("T")[0]}.csv`;
        link.click();

        toast({
            title: "Export successful",
            description: `Exported ${rows.length} rows to CSV`,
        });
    };

    // Handle bulk delete
    const handleDeleteSelected = () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
        if (onDeleteSelected) {
            onDeleteSelected(selectedRows);
        }
        setRowSelection({});
        toast({
            title: "Rows deleted",
            description: `Deleted ${selectedRows.length} rows`,
        });
    };

    const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;

    return (
        <div className="space-y-2">


          

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Active filters:</span>
                    {globalFilter && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-bg text-badge-text text-xs">
                            Search:"{globalFilter}"
                            <X
                                className="h-3 w-3 cursor-pointer hover:opacity-70"
                                onClick={() => setGlobalFilter("")}
                            />
                        </span>
                    )}
                    {dateRange?.from && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-bg text-badge-text text-xs">
                            Date filter active
                            <X
                                className="h-3 w-3 cursor-pointer hover:opacity-70"
                                onClick={() => setDateRange(undefined)}
                            />
                        </span>
                    )}
                    {Object.entries(columnFilterValues).map(([column, values]) =>
                        values.length > 0 ? (
                            <span
                                key={column}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-bg text-badge-text text-xs"
                            >
                                {formatColumnLabel(column)}: {values.length} selected
                                <X
                                    className="h-3 w-3 cursor-pointer hover:opacity-70"
                                    onClick={() => handleColumnFilterChange(column, [])}
                                />
                            </span>
                        ) : null
                    )}
                </div>
            )}

            {/* Table */}
            <div className="rounded-xl border border-border bg-card shadow-soft overflow-hidden animate-fade-in">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-muted/30 hover:bg-transparent border-b border-border">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-muted-foreground font-semibold p-4">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="p-4"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="p-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columnsWithSelection.length} className="h-24 text-center text-muted-foreground p-4">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between rounded-md p-2">
                <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {table.getRowModel().rows.length} of {filteredData.length} results
                        {filteredData.length !== data?.length && ` (${data?.length} total)`}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Rows per page</span>
                        <Select
                            value={String(table.getState().pagination.pageSize)}
                            onValueChange={(value) => table.setPageSize(Number(value))}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                                {[10, 20, 30, 50, 100].map((size) => (
                                    <SelectItem key={size} value={String(size)}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.firstPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="h-8 hidden sm:flex"
                    >
                        First
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="h-8"
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="h-8"
                    >
                        Next
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.lastPage()}
                        disabled={!table.getCanNextPage()}
                        className="h-8 hidden sm:flex"
                    >
                        Last
                    </Button>
                </div>
            </div>
        </div>
    );
}