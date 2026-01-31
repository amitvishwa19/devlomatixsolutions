import * as React from 'react';
import { InventoryCard } from './InventoryCard';

export function InventoryList({ items, onItemClick, onEdit, onDelete, onAdjustStock, viewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {items.map((item) => (
          <InventoryCard
            key={item.id}
            item={item}
            onClick={onItemClick}
            onEdit={onEdit}
            onDelete={onDelete}
            onAdjustStock={onAdjustStock}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <InventoryCard
          key={item.id}
          item={item}
          onClick={onItemClick}
          onEdit={onEdit}
          onDelete={onDelete}
          onAdjustStock={onAdjustStock}
        />
      ))}
    </div>
  );
}
