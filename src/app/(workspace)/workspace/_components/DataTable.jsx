'use client'
import React, { useState, useEffect, useMemo } from "react"
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter, Search } from "lucide-react";
import TableNoItemFound from "./TableNoItemFound";
import { Button } from "@/components/ui/button";

export default function DataTable({ columns, data, statusFIlter, dateFilter, filterTitle, onFiltersChange, children }) {
    const [globalFilter, setGlobalFilter] = useState([]);
    const [sorting, setSorting] = useState([])
    const [columnFilters, setColumnFilters] = useState([])
    const [columnVisibility, setColumnVisibility] = useState({})
    const [rowSelection, setRowSelection] = useState({})
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 2 });
    const [tableData, setTableData] = useState([])
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        dateRange: 'all',
    });

    useEffect(() => {
        setTableData(data || [])
    }, [data])



    const filterData = useMemo(() => {
        return tableData?.filter((item) => {

            // Date filter
            let matchesDate = true
            if (filters.dateRange !== 'all') {
                const itemDate = new Date(item.createdAt)
                const today = new Date()
                today.setHours(0, 0, 0, 0)

                if (filters.dateRange === 'today') {
                    matchesDate = itemDate.toDateString() === today.toDateString()
                } else if (filters.dateRange === 'yesterday') {
                    const yesterday = new Date(today)
                    yesterday.setDate(yesterday.getDate() - 1)
                    matchesDate = itemDate.toDateString() === yesterday.toDateString()
                } else if (filters.dateRange === 'week') {
                    const weekAgo = new Date(today)
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    matchesDate = itemDate >= weekAgo
                } else if (filters.dateRange === 'month') {
                    const monthAgo = new Date(today)
                    monthAgo.setMonth(monthAgo.getMonth() - 1)
                    matchesDate = itemDate >= monthAgo
                }
            }
            return matchesDate;
        });
    }, [tableData, filters]);

    const table = useReactTable({
        data: filterData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,

        state: {
            pageSize: 15,
        },
        state: {
            sorting,
            globalFilter,
            columnFilters,
            columnVisibility,
        },
    })






    return (
        <div className="flex flex-col gap-2">

            <div className="flex flex-row items-center gap-2">


                <div className="relative flex-1 ">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={filterTitle}
                        value={globalFilter ?? ''}
                        //onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        onChange={(event) => table.setGlobalFilter(String(event.target.value))}
                        className="pl-10 bg-card border"
                    />
                </div>


                {/* <div className="flex flex-row items-center gap-2">
                    {children}
                </div> */}

                {/* <div className="flex flex-row items-center gap-2">

                    <Select
                        value={filters?.status}
                        onValueChange={(value) =>
                            onFiltersChange({ ...filters, status })
                        }
                    >
                        <SelectTrigger className="w-[140px] bg-card border">
                            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                    </Select>


                    <Select
                        value={filters?.dateRange}
                        onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
                    >
                        <SelectTrigger className="w-[140px] bg-card border ">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Date" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                        </SelectContent>
                    </Select>


                </div> */}
            </div>

            <div className='border rounded-md overflow-hidden'>
                <Table>
                    <TableHeader className=" h-14 dark:bg-darkPrimaryBackground hover:bg-transparent">

                        {table?.getHeaderGroups().map((headerGroup) => (

                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className='text-md font-semibold'>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>

                        ))}

                    </TableHeader>

                    <TableBody className="h-14">
                        {table?.getRowModel().rows?.length ? (
                            table?.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="h-12"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className='text-sm'>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <TableNoItemFound />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <div className="flex flex-row items-center justify-between  dark:bg-darkPrimaryBackground p-2 rounded-md">
                    <div className="text-muted-foreground flex-1 text-xs">
                        {table.getPaginationRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} item(s).
                    </div>

                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>


        </div>
    )
}
