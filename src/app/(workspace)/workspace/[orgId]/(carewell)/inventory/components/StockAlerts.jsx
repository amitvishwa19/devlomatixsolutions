import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, XCircle, Clock, Package, ArrowRight, 
  Bell, BellOff, ShoppingCart, TrendingDown 
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { getCategoryById, getLocationById, formatCurrency } from '../utils';

export function StockAlerts({ inventory, onReorder, onViewItem }) {
  const [activeTab, setActiveTab] = React.useState('all');

  // Categorize alerts
  const alerts = React.useMemo(() => {
    const outOfStock = inventory.filter(i => i.quantity === 0 && i.isActive);
    const lowStock = inventory.filter(i => i.quantity > 0 && i.quantity <= i.reorderLevel && i.isActive);
    const expired = inventory.filter(i => {
      if (!i.expiryDate) return false;
      return differenceInDays(new Date(i.expiryDate), new Date()) <= 0;
    });
    const expiringSoon = inventory.filter(i => {
      if (!i.expiryDate) return false;
      const days = differenceInDays(new Date(i.expiryDate), new Date());
      return days > 0 && days <= 30;
    });
    const criticalValue = inventory.filter(i => {
      const value = i.quantity * i.costPrice;
      return value > 50000 && i.quantity <= i.reorderLevel * 1.5;
    });

    return { outOfStock, lowStock, expired, expiringSoon, criticalValue };
  }, [inventory]);

  const totalAlerts = 
    alerts.outOfStock.length + 
    alerts.lowStock.length + 
    alerts.expired.length + 
    alerts.expiringSoon.length;

  const AlertCard = ({ icon: Icon, title, count, color, items, type }) => (
    <Card className={`cursor-pointer transition-all hover:shadow-md ${activeTab === type ? 'ring-2 ring-primary' : ''}`}
      onClick={() => setActiveTab(type)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">{count} items</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  const renderAlertTable = (items, showExpiry = false) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No alerts in this category</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Item</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Stock</TableHead>
            {showExpiry && <TableHead>Expiry</TableHead>}
            <TableHead>Value at Risk</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => {
            const category = getCategoryById(item.category);
            const location = getLocationById(item.location);
            const daysToExpiry = item.expiryDate 
              ? differenceInDays(new Date(item.expiryDate), new Date())
              : null;
            const valueAtRisk = item.quantity * item.costPrice;

            return (
              <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onViewItem(item)}>
                <TableCell>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.sku}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{category.name}</Badge>
                </TableCell>
                <TableCell className="text-sm">{location.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${
                      item.quantity === 0 ? 'text-red-600' : 'text-amber-600'
                    }`}>
                      {item.quantity}
                    </span>
                    <span className="text-muted-foreground">/ {item.reorderLevel}</span>
                  </div>
                </TableCell>
                {showExpiry && (
                  <TableCell>
                    {item.expiryDate ? (
                      <div className={`${daysToExpiry <= 0 ? 'text-red-600' : 'text-amber-600'}`}>
                        <p className="font-medium">
                          {format(new Date(item.expiryDate), 'dd MMM yyyy')}
                        </p>
                        <p className="text-xs">
                          {daysToExpiry <= 0 ? 'Expired' : `${daysToExpiry} days left`}
                        </p>
                      </div>
                    ) : '-'}
                  </TableCell>
                )}
                <TableCell className="font-medium">{formatCurrency(valueAtRisk)}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); onReorder(item); }}
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Reorder
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card className={totalAlerts > 0 ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {totalAlerts > 0 ? (
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              ) : (
                <Bell className="w-6 h-6 text-green-600" />
              )}
              <div>
                <p className="font-medium">
                  {totalAlerts > 0 
                    ? `${totalAlerts} Stock Alerts Require Attention`
                    : 'All Stock Levels Normal'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {totalAlerts > 0 
                    ? 'Review and take action on items below'
                    : 'No critical stock issues detected'}
                </p>
              </div>
            </div>
            {totalAlerts > 0 && (
              <Badge variant="destructive" className="text-lg px-3 py-1">
                {totalAlerts}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AlertCard
          icon={XCircle}
          title="Out of Stock"
          count={alerts.outOfStock.length}
          color="bg-red-100 text-red-600"
          items={alerts.outOfStock}
          type="outOfStock"
        />
        <AlertCard
          icon={TrendingDown}
          title="Low Stock"
          count={alerts.lowStock.length}
          color="bg-amber-100 text-amber-600"
          items={alerts.lowStock}
          type="lowStock"
        />
        <AlertCard
          icon={Clock}
          title="Expiring Soon"
          count={alerts.expiringSoon.length}
          color="bg-orange-100 text-orange-600"
          items={alerts.expiringSoon}
          type="expiringSoon"
        />
        <AlertCard
          icon={AlertTriangle}
          title="Expired"
          count={alerts.expired.length}
          color="bg-gray-100 text-gray-600"
          items={alerts.expired}
          type="expired"
        />
      </div>

      {/* Alert Details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Alert Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({totalAlerts})</TabsTrigger>
              <TabsTrigger value="outOfStock">Out of Stock ({alerts.outOfStock.length})</TabsTrigger>
              <TabsTrigger value="lowStock">Low Stock ({alerts.lowStock.length})</TabsTrigger>
              <TabsTrigger value="expiringSoon">Expiring ({alerts.expiringSoon.length})</TabsTrigger>
              <TabsTrigger value="expired">Expired ({alerts.expired.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {renderAlertTable([...alerts.outOfStock, ...alerts.lowStock, ...alerts.expiringSoon], true)}
            </TabsContent>
            <TabsContent value="outOfStock" className="mt-0">
              {renderAlertTable(alerts.outOfStock)}
            </TabsContent>
            <TabsContent value="lowStock" className="mt-0">
              {renderAlertTable(alerts.lowStock)}
            </TabsContent>
            <TabsContent value="expiringSoon" className="mt-0">
              {renderAlertTable(alerts.expiringSoon, true)}
            </TabsContent>
            <TabsContent value="expired" className="mt-0">
              {renderAlertTable(alerts.expired, true)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Critical Value Items */}
      {alerts.criticalValue.length > 0 && (
        <Card className="border-purple-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-base">High-Value Items at Risk</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              These items have significant stock value and are approaching reorder levels
            </p>
            {renderAlertTable(alerts.criticalValue)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
