import React from 'react';
import { TestOrderCard } from './TestOrderCard';

export function TestOrderList({ orders, onOrderClick }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No test orders found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {orders.map((order) => (
        <TestOrderCard key={order.id} order={order} onClick={onOrderClick} />
      ))}
    </div>
  );
}
