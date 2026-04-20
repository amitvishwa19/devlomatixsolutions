'use client'
import React, { useCallback, useMemo, useState } from 'react'
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { mockEquipment, mockTestOrders } from './utils/mockData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { calculateLabStats, filterTestOrders } from './utils/utils';
import { useToast } from '@/hooks/use-toast';
import { CheckSquare, Plus, Settings, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EquipmentSheet, QualityControlSheet, SampleCollectionSheet } from './components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { getLabOrders } from './_action/get-lab-orders';
import { upsertLabOrder } from './_action/upsert-lab-order';
import { useAction } from '@/hooks/use-action';
import { Loader } from 'lucide-react';

export default function LabPage() {
    const { orgId } = useParams();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: ordersData, isLoading } = useQuery({
        queryKey: ['lab-orders', orgId],
        queryFn: async () => {
            const response = await getLabOrders({ serverId: orgId });
            return response.data?.orders || [];
        }
    });

    const orders = ordersData || [];
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
    const { execute: executeUpsert } = useAction(upsertLabOrder, {
        onSuccess: () => queryClient.invalidateQueries(['lab-orders', orgId])
    });

    const handleOrderClick = useCallback((order) => {
        setSelectedOrder(order);
        setDetailSheetOpen(true);
    }, []);

    const handleAddOrder = useCallback((newOrder) => {
        // executeUpsert(newOrder); // TODO: implement in dialog
        queryClient.invalidateQueries(['lab-orders', orgId]);
    }, [queryClient, orgId]);

    const handleStatusChange = useCallback((orderId, newStatus) => {
        executeUpsert({
            id: orderId,
            serverId: orgId,
            status: newStatus.toUpperCase(),
        });
        
        setSelectedOrder((prev) => prev && prev.id === orderId ? { ...prev, status: newStatus } : prev);
        toast({
            title: 'Status updated',
            description: `Order status changed to ${newStatus.replace('_', ' ')}.`,
        });
    }, [executeUpsert, orgId, toast]);


    return (
        <div className='absolute inset-0 flex flex-col gap-2'>

            <ContentTopbar
                title='Laboratory Management'
                description='Manage test orders, samples, results, and equipment'
                icon='flask-conical'
                actionComp={<div className="flex items-center gap-2">
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
                </div>}
            />

            <div className='px-2'>
                {/* Stats */}
                <LabStatsCards stats={stats} />
            </div>

            <div className='p-2'>
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
            </div>

            <ScrollArea className='h-[60vh] flex flex-grow p-2  rounded-md'>
                {isLoading ? (
                    <div className='flex items-center justify-center h-[200px]'>
                        <Loader className='animate-spin text-muted-foreground' />
                    </div>
                ) : (
                    <>
                        {viewMode === 'list' ? (
                            <TestOrderList orders={filteredOrders} onOrderClick={handleOrderClick} />
                        ) : (
                            <TestOrderTableView orders={filteredOrders} onOrderClick={handleOrderClick} />
                        )}
                    </>
                )}
            </ScrollArea>

            <div>
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
        </div >
    )
}
