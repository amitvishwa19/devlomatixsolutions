import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { getItemStatus, getCategoryById, getLocationById, formatCurrency } from '../utils';

export function InventoryTableView({ 
  items, 
  onItemClick, 
  onEdit, 
  onDelete, 
  onAdjustStock,
  sortField,
  sortDirection,
  onSort 
}) {
  const handleSort = (field) => {
    if (sortField === field) {
      onSort(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field, 'asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1" />
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead 
                  className="cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Item <SortIcon field="name" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category <SortIcon field="category" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort('quantity')}
                >
                  <div className="flex items-center">
                    Stock <SortIcon field="quantity" />
                  </div>
                </TableHead>
                <TableHead>Location</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort('expiryDate')}
                >
                  <div className="flex items-center">
                    Expiry <SortIcon field="expiryDate" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort('sellingPrice')}
                >
                  <div className="flex items-center">
                    Price <SortIcon field="sellingPrice" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const status = getItemStatus(item);
                const category = getCategoryById(item.category);
                const location = getLocationById(item.location);
                const daysToExpiry = item.expiryDate 
                  ? differenceInDays(new Date(item.expiryDate), new Date())
                  : null;

                return (
                  <TableRow 
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onItemClick(item)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{category.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className={`font-medium ${
                          item.quantity === 0 ? 'text-red-600' :
                          item.quantity <= item.reorderLevel ? 'text-amber-600' :
                          ''
                        }`}>
                          {item.quantity} {item.unit}(s)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Reorder: {item.reorderLevel}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{location.name}</span>
                    </TableCell>
                    <TableCell>
                      {item.expiryDate ? (
                        <div>
                          <p className={`text-sm ${
                            daysToExpiry <= 0 ? 'text-red-600 font-medium' :
                            daysToExpiry <= 30 ? 'text-amber-600' :
                            ''
                          }`}>
                            {format(new Date(item.expiryDate), 'dd MMM yyyy')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {daysToExpiry <= 0 ? 'Expired' : `${daysToExpiry} days`}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatCurrency(item.sellingPrice)}</p>
                        <p className="text-xs text-muted-foreground">
                          Cost: {formatCurrency(item.costPrice)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={status.color}>
                        {status.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onItemClick(item); }}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAdjustStock(item); }}>
                            <ArrowUpDown className="w-4 h-4 mr-2" />
                            Adjust Stock
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <p className="text-sm text-muted-foreground p-4">
          Showing {items.length} items
        </p>
      </CardContent>
    </Card>
  );
}
