import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Download, Package, BarChart3, ShoppingCart, 
  Bell, RefreshCw, History, AlertTriangle 
} from 'lucide-react';
import { useLocalStorage } from '@/carewell/hooks/useLocalStorage';
import { mockInventoryItems, mockStockMovements } from './mockData';
import { InventoryStatsCards } from './InventoryStatsCards';
import { InventoryFilters } from './InventoryFilters';
import { InventoryList } from './InventoryList';
import { InventoryTableView } from './InventoryTableView';
import { NewItemDialog } from './NewItemDialog';
import { ItemDetailSheet } from './ItemDetailSheet';
import { StockAdjustmentSheet } from './StockAdjustmentSheet';
import { 
  InventoryAnalytics, 
  PurchaseOrderManager, 
  StockAlerts, 
  ReorderManager,
  AuditTrail 
} from './components';
import { 
  calculateInventoryValue, 
  calculatePotentialRevenue, 
  getExpiringItems, 
  getLowStockItems, 
  getOutOfStockItems 
} from './utils';
import { format } from 'date-fns';

export function InventoryDashboard() {
  const [inventory, setInventory] = useLocalStorage('hms_inventory', mockInventoryItems);
  const [movements, setMovements] = useLocalStorage('hms_inventory_movements', mockStockMovements);
  const [purchaseOrders, setPurchaseOrders] = useLocalStorage('hms_purchase_orders', []);
  
  // UI State
  const [activeTab, setActiveTab] = React.useState('inventory');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [locationFilter, setLocationFilter] = React.useState('all');
  const [viewMode, setViewMode] = React.useState('table');
  const [sortField, setSortField] = React.useState('name');
  const [sortDirection, setSortDirection] = React.useState('asc');
  
  // Dialog/Sheet State
  const [isNewItemOpen, setIsNewItemOpen] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [editItem, setEditItem] = React.useState(null);

  // Calculate stats
  const stats = React.useMemo(() => ({
    totalItems: inventory.length,
    activeItems: inventory.filter(i => i.isActive).length,
    lowStock: getLowStockItems(inventory).length,
    outOfStock: getOutOfStockItems(inventory).length,
    expiringSoon: getExpiringItems(inventory, 30).length,
    totalValue: calculateInventoryValue(inventory),
    potentialRevenue: calculatePotentialRevenue(inventory),
  }), [inventory]);

  // Filter and sort inventory
  const filteredInventory = React.useMemo(() => {
    let filtered = inventory.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesLocation = locationFilter === 'all' || item.location === locationFilter;
      
      let matchesStatus = statusFilter === 'all';
      if (!matchesStatus) {
        if (statusFilter === 'in_stock') matchesStatus = item.quantity > item.reorderLevel;
        else if (statusFilter === 'low_stock') matchesStatus = item.quantity > 0 && item.quantity <= item.reorderLevel;
        else if (statusFilter === 'out_of_stock') matchesStatus = item.quantity === 0;
        else if (statusFilter === 'expired') {
          matchesStatus = item.expiryDate && new Date(item.expiryDate) <= new Date();
        }
        else if (statusFilter === 'discontinued') matchesStatus = !item.isActive;
      }

      return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'expiryDate') {
        aVal = aVal ? new Date(aVal).getTime() : Infinity;
        bVal = bVal ? new Date(bVal).getTime() : Infinity;
      }
      
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [inventory, searchQuery, categoryFilter, statusFilter, locationFilter, sortField, sortDirection]);

  // Handlers
  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setIsNewItemOpen(true);
  };

  const handleDelete = (itemId) => {
    setInventory(prev => prev.filter(i => i.id !== itemId));
  };

  const handleSaveItem = (itemData) => {
    if (editItem) {
      setInventory(prev => prev.map(i => 
        i.id === editItem.id ? { ...i, ...itemData } : i
      ));
    } else {
      setInventory(prev => [...prev, itemData]);
    }
    setEditItem(null);
  };

  const handleAdjustStock = (item) => {
    setSelectedItem(item);
    setIsAdjustOpen(true);
  };

  const handleStockAdjustment = (itemId, newQuantity, movement) => {
    setInventory(prev => prev.map(i => 
      i.id === itemId ? { ...i, quantity: newQuantity, lastRestocked: new Date() } : i
    ));
    setMovements(prev => [movement, ...prev]);
  };

  const handleReceiveStock = (itemId, quantity, details) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + quantity;
    const movement = {
      id: `mov_${Date.now()}`,
      itemId,
      type: details.type,
      quantity,
      previousQty: item.quantity,
      newQty: newQuantity,
      reference: details.reference,
      notes: details.notes,
      performedBy: 'Current User',
      date: new Date(),
    };

    setInventory(prev => prev.map(i => 
      i.id === itemId ? { ...i, quantity: newQuantity, lastRestocked: new Date() } : i
    ));
    setMovements(prev => [movement, ...prev]);
  };

  const handleCreatePO = (poData) => {
    const totalAmount = poData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const newPO = {
      id: `po_${Date.now()}`,
      poNumber: `PO-${format(new Date(), 'yyyyMMdd')}-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      supplierId: poData.supplierId,
      items: poData.items,
      totalAmount,
      status: 'pending',
      expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      createdBy: 'Current User',
    };
    setPurchaseOrders(prev => [newPO, ...prev]);
  };

  const handleSort = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(inventory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const alertCount = stats.lowStock + stats.outOfStock + stats.expiringSoon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track and manage your hospital inventory
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => { setEditItem(null); setIsNewItemOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      <InventoryStatsCards stats={stats} />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Alerts
            {alertCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-destructive text-destructive-foreground rounded-full">
                {alertCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="reorder" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Reorder
          </TabsTrigger>
          <TabsTrigger value="purchase-orders" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Purchase Orders
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-6 space-y-6">
          {/* Filters */}
          <InventoryFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {/* Content */}
          {filteredInventory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No items found matching your criteria</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => { setEditItem(null); setIsNewItemOpen(true); }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Item
              </Button>
            </div>
          ) : viewMode === 'table' ? (
            <InventoryTableView
              items={filteredInventory}
              onItemClick={handleItemClick}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdjustStock={handleAdjustStock}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          ) : (
            <InventoryList
              items={filteredInventory}
              viewMode={viewMode}
              onItemClick={handleItemClick}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdjustStock={handleAdjustStock}
            />
          )}
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <StockAlerts 
            inventory={inventory}
            onReorder={(item) => {
              setActiveTab('reorder');
            }}
            onViewItem={handleItemClick}
          />
        </TabsContent>

        <TabsContent value="reorder" className="mt-6">
          <ReorderManager
            inventory={inventory}
            onCreatePO={handleCreatePO}
          />
        </TabsContent>

        <TabsContent value="purchase-orders" className="mt-6">
          <PurchaseOrderManager
            inventory={inventory}
            purchaseOrders={purchaseOrders}
            setPurchaseOrders={setPurchaseOrders}
            onReceiveStock={handleReceiveStock}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <InventoryAnalytics 
            inventory={inventory}
            movements={movements}
          />
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <AuditTrail
            movements={movements}
            inventory={inventory}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs/Sheets */}
      <NewItemDialog
        open={isNewItemOpen}
        onOpenChange={setIsNewItemOpen}
        onSave={handleSaveItem}
        editItem={editItem}
        existingItems={inventory}
      />

      <ItemDetailSheet
        item={selectedItem}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEdit={handleEdit}
        onAdjustStock={handleAdjustStock}
        movements={movements}
      />

      <StockAdjustmentSheet
        item={selectedItem}
        open={isAdjustOpen}
        onOpenChange={setIsAdjustOpen}
        onAdjust={handleStockAdjustment}
      />
    </div>
  );
}
