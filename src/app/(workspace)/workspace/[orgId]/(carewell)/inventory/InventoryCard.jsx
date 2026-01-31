import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Eye, Package, MapPin, ArrowUpDown, AlertTriangle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { getItemStatus, getCategoryById, getLocationById, formatCurrency } from './utils';

export function InventoryCard({ item, onClick, onEdit, onDelete, onAdjustStock }) {
  const status = getItemStatus(item);
  const category = getCategoryById(item.category);
  const location = getLocationById(item.location);
  
  const daysToExpiry = item.expiryDate 
    ? differenceInDays(new Date(item.expiryDate), new Date()) 
    : null;

  const stockPercentage = item.reorderLevel > 0 
    ? Math.min((item.quantity / (item.reorderLevel * 2)) * 100, 100) 
    : 100;

  return (
    <Card 
      className="group hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
      onClick={() => onClick(item)}
    >
      {/* Status indicator */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        status.id === 'in_stock' ? 'bg-green-500' :
        status.id === 'low_stock' ? 'bg-amber-500' :
        status.id === 'out_of_stock' ? 'bg-red-500' :
        status.id === 'expired' ? 'bg-gray-500' :
        'bg-slate-400'
      }`} />
      
      <CardContent className="p-4 pt-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {item.sku}
              </Badge>
              <Badge variant="outline" className={status.color}>
                {status.name}
              </Badge>
            </div>
            <h3 className="font-semibold text-base truncate">{item.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{category.name}</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(item); }}>
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
        </div>

        {/* Stock Level */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Stock Level</span>
            <span className="font-medium">{item.quantity} {item.unit}(s)</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                stockPercentage > 50 ? 'bg-green-500' :
                stockPercentage > 25 ? 'bg-amber-500' :
                'bg-red-500'
              }`}
              style={{ width: `${stockPercentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Reorder at: {item.reorderLevel} {item.unit}(s)
          </p>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <MapPin className="w-3 h-3" />
          <span>{location.name}</span>
        </div>

        {/* Expiry Warning */}
        {daysToExpiry !== null && daysToExpiry <= 30 && (
          <div className={`flex items-center gap-1 text-sm ${
            daysToExpiry <= 0 ? 'text-red-600' : 'text-amber-600'
          }`}>
            <AlertTriangle className="w-3 h-3" />
            <span>
              {daysToExpiry <= 0 
                ? 'Expired' 
                : `Expires in ${daysToExpiry} days`}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Cost</p>
            <p className="font-medium">{formatCurrency(item.costPrice)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Selling</p>
            <p className="font-medium text-green-600">{formatCurrency(item.sellingPrice)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
