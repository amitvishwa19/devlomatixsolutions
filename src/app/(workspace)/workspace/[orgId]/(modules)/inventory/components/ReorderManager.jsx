import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ShoppingCart, RefreshCw, Calculator, Truck,
  Package, AlertTriangle, Check, Filter
} from 'lucide-react';
import { getCategoryById, getSupplierById, formatCurrency } from '../utils';
import { SUPPLIERS } from '../utils/types';

export function ReorderManager({ inventory, onCreatePO }) {
  const [selectedItems, setSelectedItems] = React.useState([]);
  const [reorderQuantities, setReorderQuantities] = React.useState({});
  const [supplierFilter, setSupplierFilter] = React.useState('all');

  // Calculate items needing reorder
  const reorderItems = React.useMemo(() => {
    return inventory
      .filter(item => item.isActive && item.quantity <= item.reorderLevel)
      .map(item => ({
        ...item,
        deficit: item.reorderLevel - item.quantity,
        suggestedQty: Math.max(item.reorderLevel * 2 - item.quantity, item.reorderLevel),
        supplier: getSupplierById(item.supplier),
      }))
      .filter(item => supplierFilter === 'all' || item.supplier.id === supplierFilter);
  }, [inventory, supplierFilter]);

  // Group by supplier
  const itemsBySupplier = React.useMemo(() => {
    const groups = {};
    reorderItems.forEach(item => {
      const supplierId = item.supplier.id;
      if (!groups[supplierId]) {
        groups[supplierId] = {
          supplier: item.supplier,
          items: [],
          totalValue: 0,
        };
      }
      const qty = reorderQuantities[item.id] || item.suggestedQty;
      groups[supplierId].items.push(item);
      groups[supplierId].totalValue += qty * item.costPrice;
    });
    return Object.values(groups);
  }, [reorderItems, reorderQuantities]);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(reorderItems.map(i => i.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleQuantityChange = (itemId, quantity) => {
    setReorderQuantities(prev => ({
      ...prev,
      [itemId]: parseInt(quantity) || 0,
    }));
  };

  const handleCreatePOs = () => {
    // Group selected items by supplier
    const posBySupplier = {};
    selectedItems.forEach(itemId => {
      const item = reorderItems.find(i => i.id === itemId);
      if (!item) return;

      const supplierId = item.supplier.id;
      if (!posBySupplier[supplierId]) {
        posBySupplier[supplierId] = {
          supplierId,
          items: [],
        };
      }
      posBySupplier[supplierId].items.push({
        itemId: item.id,
        name: item.name,
        sku: item.sku,
        quantity: reorderQuantities[item.id] || item.suggestedQty,
        unitPrice: item.costPrice,
      });
    });

    // Create POs
    Object.values(posBySupplier).forEach(po => {
      onCreatePO(po);
    });

    setSelectedItems([]);
  };

  const totalSelectedValue = selectedItems.reduce((sum, itemId) => {
    const item = reorderItems.find(i => i.id === itemId);
    if (!item) return sum;
    const qty = reorderQuantities[item.id] || item.suggestedQty;
    return sum + (qty * item.costPrice);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Items to Reorder</p>
                <p className="text-2xl font-bold">{reorderItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Suppliers Involved</p>
                <p className="text-2xl font-bold">{itemsBySupplier.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Selected Items</p>
                <p className="text-2xl font-bold">{selectedItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calculator className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Cost</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSelectedValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Select value={supplierFilter} onValueChange={setSupplierFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by supplier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Suppliers</SelectItem>
            {SUPPLIERS.map(sup => (
              <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSelectAll(selectedItems.length !== reorderItems.length)}>
            {selectedItems.length === reorderItems.length ? 'Deselect All' : 'Select All'}
          </Button>
          <Button
            disabled={selectedItems.length === 0}
            onClick={handleCreatePOs}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Create Purchase Orders ({selectedItems.length})
          </Button>
        </div>
      </div>

      {/* Reorder Items Table */}
      {reorderItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">No Items Need Reordering</p>
            <p className="text-muted-foreground">All inventory levels are above reorder thresholds</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === reorderItems.length && reorderItems.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Reorder Level</TableHead>
                  <TableHead>Deficit</TableHead>
                  <TableHead>Order Qty</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Est. Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reorderItems.map(item => {
                  const category = getCategoryById(item.category);
                  const orderQty = reorderQuantities[item.id] || item.suggestedQty;
                  const estCost = orderQty * item.costPrice;
                  const isSelected = selectedItems.includes(item.id);

                  return (
                    <TableRow
                      key={item.id}
                      className={isSelected ? 'bg-primary/5' : ''}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectItem(item.id, checked)}
                        />
                      </TableCell>
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
                        <span className={`font-medium ${item.quantity === 0 ? 'text-red-600' : 'text-amber-600'
                          }`}>
                          {item.quantity} {item.unit}(s)
                        </span>
                      </TableCell>
                      <TableCell>{item.reorderLevel} {item.unit}(s)</TableCell>
                      <TableCell>
                        <Badge variant="destructive">-{item.deficit}</Badge>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={orderQty}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell className="text-sm">{item.supplier.name}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(estCost)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Supplier Summary */}
      {itemsBySupplier.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {itemsBySupplier.map(group => (
            <Card key={group.supplier.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{group.supplier.name}</CardTitle>
                  <Badge variant="secondary">{group.items.length} items</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Contact</span>
                    <span>{group.supplier.contact || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span>{group.supplier.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Estimated Total</span>
                    <span className="text-green-600">{formatCurrency(group.totalValue)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
