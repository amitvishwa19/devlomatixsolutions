import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, Package, AlertTriangle, Clock, RefreshCcw, 
  ArrowUpDown, Filter, Download, Bell, CheckCircle, XCircle,
  RotateCcw, TrendingUp, Layers
} from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';

export function BatchExpiryTracker({ inventory, onUpdateInventory }) {
  const [activeTab, setActiveTab] = React.useState('batches');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expiryFilter, setExpiryFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('expiry');

  // Group inventory by batch
  const batchData = React.useMemo(() => {
    return inventory.map(item => ({
      ...item,
      daysToExpiry: differenceInDays(new Date(item.expiryDate), new Date()),
      stockPercentage: (item.quantity / (item.reorderLevel * 3)) * 100,
    })).sort((a, b) => {
      if (sortBy === 'expiry') return a.daysToExpiry - b.daysToExpiry;
      if (sortBy === 'quantity') return a.quantity - b.quantity;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [inventory, sortBy]);

  // Expiry categories
  const expiryStats = React.useMemo(() => {
    const expired = batchData.filter(i => i.daysToExpiry <= 0);
    const critical = batchData.filter(i => i.daysToExpiry > 0 && i.daysToExpiry <= 7);
    const warning = batchData.filter(i => i.daysToExpiry > 7 && i.daysToExpiry <= 30);
    const nearExpiry = batchData.filter(i => i.daysToExpiry > 30 && i.daysToExpiry <= 90);
    const safe = batchData.filter(i => i.daysToExpiry > 90);

    return { expired, critical, warning, nearExpiry, safe };
  }, [batchData]);

  // FIFO recommendations
  const fifoRecommendations = React.useMemo(() => {
    const grouped = {};
    batchData.forEach(item => {
      const key = item.genericName || item.name;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    return Object.entries(grouped)
      .filter(([, items]) => items.length > 1)
      .map(([name, items]) => ({
        name,
        batches: items.sort((a, b) => a.daysToExpiry - b.daysToExpiry),
        recommendedBatch: items.sort((a, b) => a.daysToExpiry - b.daysToExpiry)[0],
      }));
  }, [batchData]);

  // Filter batches
  const filteredBatches = React.useMemo(() => {
    let filtered = batchData;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(i => 
        i.name.toLowerCase().includes(query) ||
        i.batchNumber?.toLowerCase().includes(query) ||
        i.genericName?.toLowerCase().includes(query)
      );
    }

    if (expiryFilter !== 'all') {
      filtered = filtered.filter(i => {
        if (expiryFilter === 'expired') return i.daysToExpiry <= 0;
        if (expiryFilter === 'critical') return i.daysToExpiry > 0 && i.daysToExpiry <= 7;
        if (expiryFilter === 'warning') return i.daysToExpiry > 7 && i.daysToExpiry <= 30;
        if (expiryFilter === 'nearExpiry') return i.daysToExpiry > 30 && i.daysToExpiry <= 90;
        if (expiryFilter === 'safe') return i.daysToExpiry > 90;
        return true;
      });
    }

    return filtered;
  }, [batchData, searchQuery, expiryFilter]);

  const getExpiryBadge = (days) => {
    if (days <= 0) return <Badge variant="destructive">Expired</Badge>;
    if (days <= 7) return <Badge className="bg-red-500 hover:bg-red-600">{days}d left</Badge>;
    if (days <= 30) return <Badge className="bg-amber-500 hover:bg-amber-600">{days}d left</Badge>;
    if (days <= 90) return <Badge className="bg-yellow-500 hover:bg-yellow-600">{days}d left</Badge>;
    return <Badge variant="secondary">{days}d left</Badge>;
  };

  const handleRotateStock = (itemId) => {
    console.log('Rotate stock for item:', itemId);
    // In real implementation, this would trigger FIFO rotation
  };

  const handleMarkExpired = (itemId) => {
    console.log('Mark as expired:', itemId);
    if (onUpdateInventory) {
      onUpdateInventory(prev => prev.map(i => 
        i.id === itemId ? { ...i, quantity: 0, status: 'expired' } : i
      ));
    }
  };

  return (
    <div className="space-y-6">
      {/* Expiry Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{expiryStats.expired.length}</p>
                <p className="text-xs text-muted-foreground">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{expiryStats.critical.length}</p>
                <p className="text-xs text-muted-foreground">Critical (≤7d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{expiryStats.warning.length}</p>
                <p className="text-xs text-muted-foreground">Warning (≤30d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{expiryStats.nearExpiry.length}</p>
                <p className="text-xs text-muted-foreground">Near Expiry (≤90d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{expiryStats.safe.length}</p>
                <p className="text-xs text-muted-foreground">Safe (&gt;90d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Batch & Expiry Management
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Set Alerts
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="batches">All Batches</TabsTrigger>
              <TabsTrigger value="fifo">FIFO Recommendations</TabsTrigger>
              <TabsTrigger value="rotation">Stock Rotation</TabsTrigger>
            </TabsList>

            <TabsContent value="batches" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search by name, batch number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9"
                  />
                </div>
                <Select value={expiryFilter} onValueChange={setExpiryFilter}>
                  <SelectTrigger className="w-[150px] h-9">
                    <SelectValue placeholder="Expiry Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="critical">Critical (≤7d)</SelectItem>
                    <SelectItem value="warning">Warning (≤30d)</SelectItem>
                    <SelectItem value="nearExpiry">Near Expiry (≤90d)</SelectItem>
                    <SelectItem value="safe">Safe (&gt;90d)</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[130px] h-9">
                    <ArrowUpDown className="w-3 h-3 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expiry">By Expiry</SelectItem>
                    <SelectItem value="quantity">By Quantity</SelectItem>
                    <SelectItem value="name">By Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Batch Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Medicine</TableHead>
                      <TableHead>Batch #</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBatches.map((item) => (
                      <TableRow key={item.id} className={item.daysToExpiry <= 0 ? 'bg-red-50/50 dark:bg-red-950/20' : ''}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.genericName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{item.batchNumber}</code>
                        </TableCell>
                        <TableCell className="text-sm">{item.location || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.quantity}</span>
                            <span className="text-xs text-muted-foreground">{item.unit}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(item.expiryDate), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>{getExpiryBadge(item.daysToExpiry)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRotateStock(item.id)}
                              title="Rotate Stock"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                            {item.daysToExpiry <= 0 && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleMarkExpired(item.id)}
                                title="Write Off"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground">
                Showing {filteredBatches.length} of {batchData.length} batches
              </p>
            </TabsContent>

            <TabsContent value="fifo" className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <RefreshCcw className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">FIFO Dispensing Recommendations</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Always dispense from the batch with the earliest expiry date first to minimize waste.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {fifoRecommendations.map((rec) => (
                  <Card key={rec.name} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{rec.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {rec.batches.length} batches available
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-primary/10">
                          Use: {rec.recommendedBatch.batchNumber}
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {rec.batches.map((batch, idx) => (
                          <div 
                            key={batch.id} 
                            className={`text-xs px-2 py-1 rounded border ${
                              idx === 0 
                                ? 'bg-primary/10 border-primary text-primary font-medium' 
                                : 'bg-muted border-border'
                            }`}
                          >
                            {batch.batchNumber} • {batch.quantity} units • {batch.daysToExpiry}d
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {fifoRecommendations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p>No multiple batches found for the same medicine.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="rotation" className="space-y-4">
              <div className="grid gap-4">
                {expiryStats.critical.concat(expiryStats.warning).slice(0, 10).map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${
                            item.daysToExpiry <= 7 
                              ? 'bg-red-100 dark:bg-red-900/50' 
                              : 'bg-amber-100 dark:bg-amber-900/50'
                          }`}>
                            <AlertTriangle className={`w-5 h-5 ${
                              item.daysToExpiry <= 7 ? 'text-red-600' : 'text-amber-600'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Batch: {item.batchNumber} • {item.quantity} {item.unit}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">Expires: {format(new Date(item.expiryDate), 'dd MMM yyyy')}</p>
                            {getExpiryBadge(item.daysToExpiry)}
                          </div>
                          <Button size="sm" variant="outline">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            Prioritize
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Stock Level</span>
                          <span>{Math.min(100, Math.round(item.stockPercentage))}%</span>
                        </div>
                        <Progress value={Math.min(100, item.stockPercentage)} className="h-1.5" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
