import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  History, Search, Filter, Download, TrendingUp, 
  TrendingDown, ArrowRightLeft, RefreshCw, AlertTriangle,
  Calendar, User, Package
} from 'lucide-react';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { MOVEMENT_TYPES } from '../types';
import { formatCurrency } from '../utils';

export function AuditTrail({ movements, inventory }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [dateRange, setDateRange] = React.useState('30');
  const [userFilter, setUserFilter] = React.useState('all');

  // Get unique users
  const users = React.useMemo(() => {
    const userSet = new Set(movements.map(m => m.performedBy));
    return Array.from(userSet);
  }, [movements]);

  // Filter movements
  const filteredMovements = React.useMemo(() => {
    const days = parseInt(dateRange);
    const startDate = subDays(new Date(), days);
    
    return movements
      .filter(movement => {
        const item = inventory.find(i => i.id === movement.itemId);
        const itemName = item?.name || 'Unknown Item';
        
        const matchesSearch = 
          itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movement.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movement.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesType = typeFilter === 'all' || movement.type === typeFilter;
        const matchesUser = userFilter === 'all' || movement.performedBy === userFilter;
        const matchesDate = new Date(movement.date) >= startDate;
        
        return matchesSearch && matchesType && matchesUser && matchesDate;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [movements, inventory, searchQuery, typeFilter, userFilter, dateRange]);

  // Stats
  const stats = React.useMemo(() => {
    const additions = filteredMovements
      .filter(m => ['purchase', 'adjustment_add', 'transfer_in', 'return'].includes(m.type))
      .reduce((sum, m) => sum + m.quantity, 0);
    
    const removals = filteredMovements
      .filter(m => ['sale', 'adjustment_remove', 'transfer_out', 'damage', 'expired'].includes(m.type))
      .reduce((sum, m) => sum + m.quantity, 0);
    
    return {
      total: filteredMovements.length,
      additions,
      removals,
      netChange: additions - removals,
    };
  }, [filteredMovements]);

  const getMovementIcon = (type) => {
    const icons = {
      purchase: TrendingUp,
      sale: TrendingDown,
      adjustment_add: TrendingUp,
      adjustment_remove: TrendingDown,
      transfer_in: ArrowRightLeft,
      transfer_out: ArrowRightLeft,
      return: RefreshCw,
      damage: AlertTriangle,
      expired: AlertTriangle,
    };
    return icons[type] || Package;
  };

  const getMovementType = (typeId) => {
    return MOVEMENT_TYPES.find(t => t.id === typeId) || { name: typeId, color: 'text-muted-foreground' };
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Reference', 'Item', 'Type', 'Quantity', 'Previous', 'New', 'Performed By', 'Notes'].join(','),
      ...filteredMovements.map(m => {
        const item = inventory.find(i => i.id === m.itemId);
        return [
          format(new Date(m.date), 'yyyy-MM-dd HH:mm'),
          m.reference,
          item?.name || 'Unknown',
          getMovementType(m.type).name,
          m.quantity,
          m.previousQty,
          m.newQty,
          m.performedBy,
          m.notes || '',
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_trail_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <History className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Movements</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock Added</p>
                <p className="text-2xl font-bold text-green-600">+{stats.additions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock Removed</p>
                <p className="text-2xl font-bold text-red-600">-{stats.removals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Change</p>
                <p className={`text-2xl font-bold ${
                  stats.netChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats.netChange >= 0 ? '+' : ''}{stats.netChange}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by item, reference, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {MOVEMENT_TYPES.map(type => (
              <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-40">
            <User className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map(user => (
              <SelectItem key={user} value={user}>{user}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-36">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
            <SelectItem value="365">Last Year</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Movements Table */}
      <Card>
        <CardContent className="p-0">
          {filteredMovements.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No movements found for the selected criteria</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map(movement => {
                  const item = inventory.find(i => i.id === movement.itemId);
                  const movementType = getMovementType(movement.type);
                  const Icon = getMovementIcon(movement.type);
                  const isPositive = ['purchase', 'adjustment_add', 'transfer_in', 'return'].includes(movement.type);

                  return (
                    <TableRow key={movement.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {format(new Date(movement.date), 'dd MMM yyyy')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(movement.date), 'HH:mm')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{movement.reference}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item?.name || 'Unknown Item'}</p>
                          <p className="text-xs text-muted-foreground">{item?.sku || '-'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
                            <Icon className={`w-3 h-3 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                          </div>
                          <span className={movementType.color}>{movementType.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : '-'}{movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="text-muted-foreground">{movement.previousQty}</span>
                          <span className="mx-1">→</span>
                          <span className="font-medium">{movement.newQty}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{movement.performedBy}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {movement.notes || '-'}
                        </p>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground text-center">
        Showing {filteredMovements.length} movements
      </p>
    </div>
  );
}
