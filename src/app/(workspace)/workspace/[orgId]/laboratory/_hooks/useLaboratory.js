import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { initialLabOrders } from '../_data/mockLabData';


export function useLaboratory() {
    const [orders, setOrders] = useState(initialLabOrders);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Create order
    const createOrder = useCallback((orderData) => {
        try {
            const orderId = `LAB-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
            const specimenId = orderData.specimenId || `SPEC-${String(Date.now()).slice(-6)}`;

            const newOrder = {
                id: String(Date.now()),
                orderId,
                patient: orderData.patient || { name: 'Unknown Patient' },
                tests: orderData.tests || [],
                specimenId,
                specimenTypes: orderData.specimenTypes || [],
                specimenTracking: {
                    specimenId,
                    barcode: `BC-${specimenId}`,
                    type: orderData.specimenTypes?.[0] || 'Blood',
                    collectedAt: new Date(),
                    collectedBy: orderData.collectedBy || 'Unknown',
                    status: 'collected',
                    chainOfCustody: [
                        {
                            id: '1',
                            timestamp: new Date(),
                            action: 'Specimen collected',
                            performedBy: orderData.collectedBy || 'Unknown',
                        },
                    ],
                },
                collectedAt: new Date(),
                status: orderData.status || 'pending',
                priority: orderData.priority || 'routine',
                orderedBy: orderData.orderedBy || 'Unknown',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            setOrders((prev) => [newOrder, ...prev]);
            toast.success('Lab order created successfully');
            return newOrder;
        } catch (err) {
            console.error('Error creating order:', err);
            toast.error('Failed to create order');
            throw err;
        }
    }, []);

    // Update order
    const updateOrder = useCallback((id, updates) => {
        try {
            setOrders((prev) =>
                prev.map((order) =>
                    order.id === id
                        ? { ...order, ...updates, updatedAt: new Date() }
                        : order
                )
            );
            toast.success('Order updated successfully');
        } catch (err) {
            console.error('Error updating order:', err);
            toast.error('Failed to update order');
            throw err;
        }
    }, []);

    // Delete order
    const deleteOrder = useCallback((id) => {
        try {
            setOrders((prev) => prev.filter((order) => order.id !== id));
            toast.success('Order deleted successfully');
        } catch (err) {
            console.error('Error deleting order:', err);
            toast.error('Failed to delete order');
            throw err;
        }
    }, []);

    // Update order status
    const updateStatus = useCallback((id, status) => {
        return updateOrder(id, { status });
    }, [updateOrder]);

    // Refetch (no-op for mock data, but kept for API compatibility)
    const refetch = useCallback(() => {
        setOrders([...initialLabOrders]);
    }, []);

    return {
        orders,
        loading,
        error,
        createOrder,
        updateOrder,
        deleteOrder,
        updateStatus,
        refetch,
    };
}
