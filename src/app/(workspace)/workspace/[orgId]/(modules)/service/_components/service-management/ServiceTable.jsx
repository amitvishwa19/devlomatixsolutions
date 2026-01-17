'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import ServiceTableRow from './ServiceTableRow';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Copy, Pencil, Search, Trash2 } from 'lucide-react';
import { CustomBadge } from '../../../../(misc)/_components/CustomBadge';
import { Badge } from '@/components/ui/badge';
import TableNoItemFound from '@/app/(workspace)/workspace/_components/general/TableNoItemFound';

const ServiceTable = ({ services, onEdit, onDelete, onDuplicate, onToggleStatus }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [isModalOpen, setIsModalOpen] = useState(false);



    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortedServices = [...services]?.sort((a, b) => {
        const aValue = a?.[sortConfig?.key];
        const bValue = b?.[sortConfig?.key];

        if (sortConfig?.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
    });

    const SortIcon = ({ columnKey }) => {
        if (sortConfig?.key !== columnKey) {
            return <Icon name="ChevronUpDownIcon" size={16} className="text-muted-foreground" />;
        }
        return (
            <Icon
                name={sortConfig?.direction === 'asc' ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                size={16}
                className="text-primary"
            />
        );
    };

    SortIcon.propTypes = {
        columnKey: PropTypes?.string?.isRequired
    };

    const columns = [
        {
            id: "title",
            accessorKey: "title",
            header: "Title",
        },
        {
            id: "description",
            accessorKey: "description",
            header: "Description",
        },
        {
            id: "price",
            accessorKey: "price",
            header: "Price",
            cell: ({ row }) => {
                return (
                    <div>
                        <span>₹ </span> {row.original.price === '' ? '0' : row.original.price}
                    </div>
                )
            }
        },
        {
            id: "category",
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => {

                return (
                    <Badge className='bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-transparent'>
                        {row?.original?.category?.name}
                    </Badge>
                )
            }
        },
        {
            id: "status",
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                return (
                    <div>
                        {row.original.status === true ?
                            <Badge className='bg-green-500/10 text-green-500 border-green-500/20 hover:bg-transparent'>
                                Active
                            </Badge> :
                            <Badge className='bg-red-500/10 text-red-500 border-red-500/20 hover:bg-transparent'>
                                InActive
                            </Badge>
                        }
                    </div>
                )
            }
        },
        {
            id: "actions",
            header: "Actions",
            enableHiding: false,
            cell: ({ row }) => {
                return (
                    <div className='flex flex-row gap-4 text-xs'>
                        <Pencil size={16} className=' cursor-pointer' onClick={() => { onEdit(row.original) }} />
                        <Trash2 size={16} className=' cursor-pointer' onClick={() => { onDelete(row.original) }} />
                    </div>
                )
            },
        },
    ]

    return (
        <div className="p-2">
            <DataTable columns={columns} data={services} />
        </div>
    );
};


function DataTable({ columns, data, }) {
    const [globalFilter, setGlobalFilter] = useState([]);
    const [sorting, setSorting] = useState([])
    const [columnFilters, setColumnFilters] = useState([])
    const [columnVisibility, setColumnVisibility] = useState({})
    const [rowSelection, setRowSelection] = useState({})
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 2 });






    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        //onRowSelectionChange: setRowSelection,
        state: {
            pagination,
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
    })

    return (
        <div className=''>

            <div className="flex flex-row gap-4 items-center mb-4">

                <div className='flex flex-row w-full gap-2'>
                    <Input
                        placeholder="Search content by title..."
                        value={(table.getColumn("title")?.getFilterValue()) ?? ""}
                        onChange={(event) =>
                            table.getColumn("title")?.setFilterValue(event.target.value)

                        }
                        className="w-full"
                    />



                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter(
                                (column) => column.getCanHide()
                            )
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className='rounded-md border  shadow-card overflow-hidden'>
                <Table className='rounded-md '>
                    <TableHeader className='bg-card'>

                        {table?.getHeaderGroups().map((headerGroup) => (

                            <TableRow key={headerGroup.id} className=' rounded-md'>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className='text-md font-semibold p-4'>
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

                    <TableBody>
                        {table?.getRowModel().rows?.length ? (
                            table?.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className=''
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className='text-sm h-10'>
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
            </div>

            <div className='flex flex-row items-center justify-end mt-4'>
                <div className='flex flex-row gap-4'>
                    <Button variant="outline" size="sm" onClick={() => { table.previousPage() }} disabled={!table.getCanPreviousPage()}>Prev</Button>
                    <Button variant="outline" size="sm" onClick={() => { table.nextPage() }} disabled={!table.getCanNextPage()}>Next</Button>
                </div>
            </div>

        </div>
    )
}
export default ServiceTable;