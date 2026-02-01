import * as React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, Edit, ArrowUpDown, MapPin, Calendar, User, 
  Truck, AlertTriangle, TrendingUp, TrendingDown, History
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { getItemStatus, getCategoryById, getLocationById, getSupplierById, getUnitById, formatCurrency, MOVEMENT_TYPES } from '../utils';

export function ItemDetailSheet({ item, open, onOpenChange, onEdit, onAdjustStock, movements = [] }) {
  if (!item) return null;

  const status = getItemStatus(item);
  const category = getCategoryById(item.category);
  const location = getLocationById(item.location);
  const supplier = getSupplierById(item.supplier);
  const unit = getUnitById(item.unit);
  
  const daysToExpiry = item.expiryDate 
    ? differenceInDays(new Date(item.expiryDate), new Date())
    : null;

  const stockPercentage = item.reorderLevel > 0 
    ? Math.min((item.quantity / (item.reorderLevel * 2)) * 100, 100) 
    : 100;

  const itemMovements = movements.filter(m => m.itemId === item.id);

  const getMovementType = (typeId) => {
    return MOVEMENT_TYPES.find(t => t.id === typeId) || { name: typeId, color: 'text-muted-foreground' };
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[720px] p-0 border-0 bg-transparent">
        <div className="h-full flex flex-col bg-card rounded-l-xl border shadow-lg">
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-lg">{item.name}</SheetTitle>
                    <Badge variant="outline" className={status.color}>
                      {status.name}
                    </Badge>
                  </div>
                  <SheetDescription className="flex items-center gap-2">
                    <span>{item.sku}</span>
                    <span>•</span>
                    <span>{category.name}</span>
                  </SheetDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onAdjustStock(item)}>
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Adjust Stock
                </Button>
                <Button size="sm" onClick={() => onEdit(item)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </SheetHeader>

          <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-2 border-b">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="history">Stock History</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                <TabsContent value="overview" className="mt-0 space-y-6">
                  {/* Stock Level Card */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Stock Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-bold">
                            {item.quantity}
                          </span>
                          <span className="text-muted-foreground">{unit.name}</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              stockPercentage > 50 ? 'bg-green-500' :
                              stockPercentage > 25 ? 'bg-amber-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${stockPercentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Reorder Level: {item.reorderLevel}</span>
                          <span>
                            {item.quantity <= item.reorderLevel 
                              ? 'Stock below reorder level'
                              : `${item.quantity - item.reorderLevel} above reorder`}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Expiry Warning */}
                  {daysToExpiry !== null && daysToExpiry <= 60 && (
                    <Card className={`border-2 ${
                      daysToExpiry <= 0 ? 'border-red-500 bg-red-50' :
                      daysToExpiry <= 30 ? 'border-amber-500 bg-amber-50' :
                      'border-orange-300 bg-orange-50'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`w-5 h-5 ${
                            daysToExpiry <= 0 ? 'text-red-600' : 'text-amber-600'
                          }`} />
                          <div>
                            <p className="font-medium">
                              {daysToExpiry <= 0 ? 'Item has expired!' : `Expires in ${daysToExpiry} days`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Expiry Date: {format(new Date(item.expiryDate), 'dd MMM yyyy')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Location
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-medium">{location.name}</p>
                        {item.batchNumber && (
                          <p className="text-sm text-muted-foreground">
                            Batch: {item.batchNumber}
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          Supplier
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-medium">{supplier.name}</p>
                        {supplier.contact && (
                          <p className="text-sm text-muted-foreground">{supplier.contact}</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Pricing */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Pricing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Cost Price</p>
                          <p className="text-lg font-medium">{formatCurrency(item.costPrice)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Selling Price</p>
                          <p className="text-lg font-medium text-green-600">{formatCurrency(item.sellingPrice)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Margin</p>
                          <p className="text-lg font-medium">
                            {((item.sellingPrice - item.costPrice) / item.costPrice * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Stock Value</p>
                          <p className="text-lg font-bold">{formatCurrency(item.quantity * item.costPrice)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Potential Revenue</p>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(item.quantity * item.sellingPrice)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional Info */}
                  {item.description && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  )}

                  {item.notes && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{item.notes}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Timestamps */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {item.lastRestocked && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Last Restocked: {format(new Date(item.lastRestocked), 'dd MMM yyyy')}</span>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Stock Movement History
                    </h3>
                  </div>

                  {itemMovements.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">No stock movements recorded</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {itemMovements.map((movement) => {
                        const movementType = getMovementType(movement.type);
                        const isPositive = ['purchase', 'adjustment_add', 'transfer_in', 'return'].includes(movement.type);
                        
                        return (
                          <Card key={movement.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {isPositive 
                                      ? <TrendingUp className="w-4 h-4 text-green-600" />
                                      : <TrendingDown className="w-4 h-4 text-red-600" />
                                    }
                                  </div>
                                  <div>
                                    <p className={`font-medium ${movementType.color}`}>
                                      {movementType.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {movement.notes}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Ref: {movement.reference} • By: {movement.performedBy}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                    {isPositive ? '+' : '-'}{movement.quantity}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {movement.previousQty} → {movement.newQty}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(movement.date), 'dd MMM yyyy')}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
