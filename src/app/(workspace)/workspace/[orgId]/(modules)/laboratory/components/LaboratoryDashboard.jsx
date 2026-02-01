import React, { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/carewell/hooks/useLocalStorage';
import { mockTestOrders, mockEquipment } from '../utils/mockData';
import { calculateLabStats, filterTestOrders } from '../utils/utils';
import { LabStatsCards } from './LabStatsCards';
import { LabFilters } from './LabFilters';
import { TestOrderList } from './TestOrderList';
import { TestOrderTableView } from './TestOrderTableView';
import { TestOrderDetailSheet } from './TestOrderDetailSheet';
import { NewTestOrderDialog } from './NewTestOrderDialog';
import { EquipmentSheet, QualityControlSheet, SampleCollectionSheet } from '.';
import { LabAnalytics } from './LabAnalytics';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, CheckSquare, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LaboratoryDashboard() {
  const { toast } = useToast();
  const [orders, setOrders] = useLocalStorage('hms_lab_orders', mockTestOrders);
  const [equipment] = useLocalStorage('hms_lab_equipment', mockEquipment);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState([]);
  const [viewMode, setViewMode] = useState('list');

  // Dialogs/Sheets
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [newOrderDialogOpen, setNewOrderDialogOpen] = useState(false);
  const [equipmentSheetOpen, setEquipmentSheetOpen] = useState(false);
  const [qcSheetOpen, setQcSheetOpen] = useState(false);
  const [sampleCollectionSheetOpen, setSampleCollectionSheetOpen] = useState(false);

  // Computed
  const stats = useMemo(() => calculateLabStats(orders), [orders]);

  const filteredOrders = useMemo(() => {
    let result = filterTestOrders(orders, {
      search: searchQuery,
      status: statusFilter,
      priority: priorityFilter,
      category: categoryFilter,
    });

    if (tagFilter.length > 0) {
      result = result.filter((order) =>
        tagFilter.some((tagId) => order.tags?.includes(tagId))
      );
    }

    return result;
  }, [orders, searchQuery, statusFilter, priorityFilter, categoryFilter, tagFilter]);

  // Handlers
  const handleOrderClick = useCallback((order) => {
    setSelectedOrder(order);
    setDetailSheetOpen(true);
  }, []);

  const handleAddOrder = useCallback((newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  }, [setOrders]);

  const handleStatusChange = useCallback((orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updates = { status: newStatus };
          if (newStatus === 'sample_collected') {
            updates.sampleCollectedAt = new Date();
          } else if (newStatus === 'completed') {
            updates.completedAt = new Date();
          }
          return { ...order, ...updates };
        }
        return order;
      })
    );
    setSelectedOrder((prev) => prev && prev.id === orderId ? { ...prev, status: newStatus } : prev);
    toast({
      title: 'Status updated',
      description: `Order status changed to ${newStatus.replace('_', ' ')}.`,
    });
  }, [setOrders, toast]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Laboratory Management</h1>
          <p className="text-muted-foreground">Manage test orders, samples, results, and equipment</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSampleCollectionSheetOpen(true)}>
            <TestTube className="w-4 h-4 mr-1" />
            Sample Collection
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQcSheetOpen(true)}>
            <CheckSquare className="w-4 h-4 mr-1" />
            QC Records
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEquipmentSheetOpen(true)}>
            <Settings className="w-4 h-4 mr-1" />
            Equipment
          </Button>
          <Button onClick={() => setNewOrderDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            New Order
          </Button>
        </div>
      </div>

      {/* Stats */}
      <LabStatsCards stats={stats} />

      {/* Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Test Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {/* Filters */}
          <LabFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            tagFilter={tagFilter}
            onTagFilterChange={setTagFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Orders List/Table */}
          {viewMode === 'list' ? (
            <TestOrderList orders={filteredOrders} onOrderClick={handleOrderClick} />
          ) : (
            <TestOrderTableView orders={filteredOrders} onOrderClick={handleOrderClick} />
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <LabAnalytics orders={orders} />
        </TabsContent>
      </Tabs>

      {/* Sheets & Dialogs */}
      <TestOrderDetailSheet
        order={selectedOrder}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        onStatusChange={handleStatusChange}
      />

      <NewTestOrderDialog
        open={newOrderDialogOpen}
        onOpenChange={setNewOrderDialogOpen}
        onSubmit={handleAddOrder}
      />

      <EquipmentSheet
        open={equipmentSheetOpen}
        onOpenChange={setEquipmentSheetOpen}
        equipment={equipment}
      />

      <QualityControlSheet
        open={qcSheetOpen}
        onOpenChange={setQcSheetOpen}
      />

      <SampleCollectionSheet
        open={sampleCollectionSheetOpen}
        onOpenChange={setSampleCollectionSheetOpen}
        orders={orders.filter((o) => o.status === 'ordered')}
        onCollect={handleStatusChange}
      />
    </div>
  );
}
