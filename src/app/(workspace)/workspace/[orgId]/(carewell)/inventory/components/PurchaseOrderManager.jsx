import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, ShoppingCart, Truck, Check, X, Eye, Clock, 
  Package, Search, Filter, Trash2, AlertTriangle 
} from 'lucide-react';
import { format } from 'date-fns';
import { useFormValidationToast } from '@/carewell/hooks/useFormValidationToast';
import { SUPPLIERS } from '../types';
import { formatCurrency, getSupplierById } from '../utils';

const orderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  expectedDelivery: z.string().min(1, 'Expected delivery date is required'),
  notes: z.string().optional(),
});

const PO_STATUSES = [
  { id: 'draft', name: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { id: 'pending', name: 'Pending Approval', color: 'bg-amber-100 text-amber-800' },
  { id: 'approved', name: 'Approved', color: 'bg-blue-100 text-blue-800' },
  { id: 'ordered', name: 'Ordered', color: 'bg-purple-100 text-purple-800' },
  { id: 'partial', name: 'Partially Received', color: 'bg-orange-100 text-orange-800' },
  { id: 'received', name: 'Received', color: 'bg-green-100 text-green-800' },
  { id: 'cancelled', name: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

export function PurchaseOrderManager({ inventory, purchaseOrders, setPurchaseOrders, onReceiveStock }) {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [selectedPO, setSelectedPO] = React.useState(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [orderItems, setOrderItems] = React.useState([]);
  const [selectedItem, setSelectedItem] = React.useState('');
  const [itemQuantity, setItemQuantity] = React.useState(1);
  const [itemPrice, setItemPrice] = React.useState(0);

  const showValidationToast = useFormValidationToast();

  const form = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      supplierId: '',
      expectedDelivery: '',
      notes: '',
    },
  });

  // Stats
  const stats = React.useMemo(() => ({
    total: purchaseOrders.length,
    pending: purchaseOrders.filter(po => po.status === 'pending').length,
    ordered: purchaseOrders.filter(po => po.status === 'ordered').length,
    totalValue: purchaseOrders
      .filter(po => !['cancelled', 'received'].includes(po.status))
      .reduce((sum, po) => sum + po.totalAmount, 0),
  }), [purchaseOrders]);

  // Filter POs
  const filteredPOs = React.useMemo(() => {
    return purchaseOrders.filter(po => {
      const supplier = getSupplierById(po.supplierId);
      const matchesSearch = 
        po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, searchQuery, statusFilter]);

  const getStatusBadge = (statusId) => {
    const status = PO_STATUSES.find(s => s.id === statusId) || PO_STATUSES[0];
    return <Badge className={status.color}>{status.name}</Badge>;
  };

  const handleAddItem = () => {
    if (!selectedItem || itemQuantity <= 0) return;
    
    const item = inventory.find(i => i.id === selectedItem);
    if (!item) return;

    const existingIndex = orderItems.findIndex(oi => oi.itemId === selectedItem);
    if (existingIndex >= 0) {
      setOrderItems(prev => prev.map((oi, idx) => 
        idx === existingIndex 
          ? { ...oi, quantity: oi.quantity + itemQuantity }
          : oi
      ));
    } else {
      setOrderItems(prev => [...prev, {
        itemId: item.id,
        name: item.name,
        sku: item.sku,
        quantity: itemQuantity,
        unitPrice: itemPrice || item.costPrice,
      }]);
    }

    setSelectedItem('');
    setItemQuantity(1);
    setItemPrice(0);
  };

  const handleRemoveItem = (itemId) => {
    setOrderItems(prev => prev.filter(oi => oi.itemId !== itemId));
  };

  const orderTotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const handleCreatePO = (data) => {
    if (orderItems.length === 0) {
      showValidationToast({ items: { message: 'Add at least one item to the order' } });
      return;
    }

    console.log('Purchase Order Data:', data, orderItems);

    const newPO = {
      id: `po_${Date.now()}`,
      poNumber: `PO-${format(new Date(), 'yyyyMMdd')}-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      supplierId: data.supplierId,
      items: orderItems,
      totalAmount: orderTotal,
      status: 'pending',
      expectedDelivery: new Date(data.expectedDelivery),
      notes: data.notes,
      createdAt: new Date(),
      createdBy: 'Current User',
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    setOrderItems([]);
    form.reset();
    setIsCreateOpen(false);
  };

  const handleUpdateStatus = (poId, newStatus) => {
    setPurchaseOrders(prev => prev.map(po => 
      po.id === poId ? { ...po, status: newStatus } : po
    ));
  };

  const handleReceive = (po) => {
    // Add stock for each item
    po.items.forEach(item => {
      onReceiveStock(item.itemId, item.quantity, {
        type: 'purchase',
        reference: po.poNumber,
        notes: `Received from PO ${po.poNumber}`,
      });
    });
    handleUpdateStatus(po.id, 'received');
    setIsDetailOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending Approval</p>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">In Transit</p>
            <p className="text-2xl font-bold text-blue-600">{stats.ordered}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Outstanding Value</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by PO number or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {PO_STATUSES.map(status => (
              <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Purchase Order
        </Button>
      </div>

      {/* PO Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>PO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPOs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No purchase orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPOs.map(po => {
                  const supplier = getSupplierById(po.supplierId);
                  return (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">{po.poNumber}</TableCell>
                      <TableCell>{supplier.name}</TableCell>
                      <TableCell>{po.items?.length || 0} items</TableCell>
                      <TableCell className="font-medium">{formatCurrency(po.totalAmount)}</TableCell>
                      <TableCell>
                        {po.expectedDelivery 
                          ? format(new Date(po.expectedDelivery), 'dd MMM yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(po.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => { setSelectedPO(po); setIsDetailOpen(true); }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {po.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600"
                                onClick={() => handleUpdateStatus(po.id, 'approved')}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600"
                                onClick={() => handleUpdateStatus(po.id, 'cancelled')}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {po.status === 'approved' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-blue-600"
                              onClick={() => handleUpdateStatus(po.id, 'ordered')}
                            >
                              <Truck className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create PO Sheet */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent className="sm:max-w-[800px] p-0 border-0 bg-transparent">
          <div className="h-full flex flex-col bg-card rounded-l-xl border shadow-lg">
            <SheetHeader className="px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <SheetTitle>New Purchase Order</SheetTitle>
                  <SheetDescription>Create a new purchase order for inventory items</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreatePO)} className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1">
                  <div className="p-6 space-y-6">
                    {/* Supplier & Date */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="supplierId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supplier *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select supplier" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SUPPLIERS.map(sup => (
                                  <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="expectedDelivery"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expected Delivery *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Add Items */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Order Items</h4>
                      <div className="flex gap-2">
                        <Select value={selectedItem} onValueChange={setSelectedItem}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select item to add" />
                          </SelectTrigger>
                          <SelectContent>
                            {inventory.map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.sku})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min="1"
                          value={itemQuantity}
                          onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                          className="w-24"
                          placeholder="Qty"
                        />
                        <Input
                          type="number"
                          min="0"
                          value={itemPrice}
                          onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                          className="w-32"
                          placeholder="Unit Price"
                        />
                        <Button type="button" onClick={handleAddItem}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Items List */}
                      {orderItems.length > 0 && (
                        <Card>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {orderItems.map(item => (
                                <TableRow key={item.itemId}>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                                  <TableCell className="font-medium">
                                    {formatCurrency(item.quantity * item.unitPrice)}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveItem(item.itemId)}
                                    >
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                              <TableRow className="bg-muted/50">
                                <TableCell colSpan={4} className="text-right font-medium">
                                  Total
                                </TableCell>
                                <TableCell className="font-bold text-lg">
                                  {formatCurrency(orderTotal)}
                                </TableCell>
                                <TableCell></TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Card>
                      )}
                    </div>

                    {/* Notes */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Additional notes..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </ScrollArea>

                <div className="px-6 py-4 border-t flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={orderItems.length === 0}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Create Purchase Order
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>

      {/* PO Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="sm:max-w-[700px] p-0 border-0 bg-transparent">
          <div className="h-full flex flex-col bg-card rounded-l-xl border shadow-lg">
            {selectedPO && (
              <>
                <SheetHeader className="px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <SheetTitle>{selectedPO.poNumber}</SheetTitle>
                        <SheetDescription>
                          {getSupplierById(selectedPO.supplierId).name}
                        </SheetDescription>
                      </div>
                    </div>
                    {getStatusBadge(selectedPO.status)}
                  </div>
                </SheetHeader>

                <ScrollArea className="flex-1">
                  <div className="p-6 space-y-6">
                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="font-medium">
                          {format(new Date(selectedPO.createdAt), 'dd MMM yyyy')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Expected Delivery</p>
                        <p className="font-medium">
                          {selectedPO.expectedDelivery 
                            ? format(new Date(selectedPO.expectedDelivery), 'dd MMM yyyy')
                            : '-'}
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Order Items</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead>Qty</TableHead>
                              <TableHead>Unit Price</TableHead>
                              <TableHead>Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedPO.items?.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">{item.sku}</p>
                                </TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                                <TableCell className="font-medium">
                                  {formatCurrency(item.quantity * item.unitPrice)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <Separator />

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">Total Amount</span>
                      <span className="text-2xl font-bold">{formatCurrency(selectedPO.totalAmount)}</span>
                    </div>

                    {selectedPO.notes && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{selectedPO.notes}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>

                {selectedPO.status === 'ordered' && (
                  <div className="px-6 py-4 border-t">
                    <Button className="w-full" onClick={() => handleReceive(selectedPO)}>
                      <Check className="w-4 h-4 mr-2" />
                      Mark as Received & Update Stock
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
