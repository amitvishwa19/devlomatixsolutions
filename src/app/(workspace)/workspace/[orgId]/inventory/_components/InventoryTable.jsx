import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Filter, Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';



export function InventoryTable({ items, onAddItem }) {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredItems = items.filter(
        (item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    function getStockStatus(quantity, minStock) {
        if (quantity === 0) return 'out-of-stock';
        if (quantity <= minStock) return 'low-stock';
        return 'in-stock';
    };

    const getStatusBadge = (item) => {
        const status = getStockStatus(item.quantity, item.minStock);
        switch (status) {
            case 'in-stock':
                return <Badge variant="success">In Stock</Badge>;
            case 'low-stock':
                return <Badge variant="warning">Low Stock</Badge>;
            case 'out-of-stock':
                return <Badge variant="destructive">Out of Stock</Badge>;
        }
    };

    return (
        <Card variant="glass" className="animate-slide-up rounded-md">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-border">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, SKU, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-secondary border-border"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                    <Button size="sm" onClick={onAddItem} className="glow-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-muted-foreground font-medium">Item</TableHead>
                            <TableHead className="text-muted-foreground font-medium">SKU</TableHead>
                            <TableHead className="text-muted-foreground font-medium">Category</TableHead>
                            <TableHead className="text-muted-foreground font-medium">Quantity</TableHead>
                            <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                            <TableHead className="text-muted-foreground font-medium w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.map((item, index) => (
                            <TableRow
                                key={item.id}
                                className={cn(
                                    'border-border transition-colors hover:bg-secondary/50',
                                    'animate-fade-in'
                                )}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                                <TableCell className="text-muted-foreground font-mono text-sm">{item.sku}</TableCell>
                                <TableCell>
                                    <Badge variant="muted">{item.category}</Badge>
                                </TableCell>
                                <TableCell>
                                    <span className={cn(
                                        'font-medium',
                                        item.quantity === 0 && 'text-destructive',
                                        item.quantity <= item.minStock && item.quantity > 0 && 'text-warning'
                                    )}>
                                        {item.quantity.toLocaleString()} {item.unit}
                                    </span>
                                </TableCell>
                                <TableCell>{getStatusBadge(item)}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-popover border-border">
                                            <DropdownMenuItem className="cursor-pointer">
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Empty State */}
            {filteredItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                        <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium text-foreground">No items found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Try adjusting your search or filters
                    </p>
                </div>
            )}
        </Card>
    );
}
