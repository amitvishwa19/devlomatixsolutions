import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Package, AlertTriangle, Clock, IndianRupee } from 'lucide-react';
import { format, subDays, differenceInDays } from 'date-fns';
import { INVENTORY_CATEGORIES, STORAGE_LOCATIONS } from '../utils/types';
import { formatCurrency, getCategoryById, getLocationById } from '../utils';

export function InventoryAnalytics({ inventory, movements }) {
  const [timeRange, setTimeRange] = React.useState('30');

  // Category distribution
  const categoryData = React.useMemo(() => {
    const counts = {};
    inventory.forEach(item => {
      const cat = getCategoryById(item.category);
      counts[cat.name] = (counts[cat.name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [inventory]);

  // Stock value by category
  const valueByCategory = React.useMemo(() => {
    const values = {};
    inventory.forEach(item => {
      const cat = getCategoryById(item.category);
      values[cat.name] = (values[cat.name] || 0) + (item.quantity * item.costPrice);
    });
    return Object.entries(values)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [inventory]);

  // Location distribution
  const locationData = React.useMemo(() => {
    const counts = {};
    inventory.forEach(item => {
      const loc = getLocationById(item.location);
      counts[loc.name] = (counts[loc.name] || 0) + item.quantity;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [inventory]);

  // Movement trends
  const movementTrends = React.useMemo(() => {
    const days = parseInt(timeRange);
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayMovements = movements.filter(m =>
        format(new Date(m.date), 'yyyy-MM-dd') === dateStr
      );

      const additions = dayMovements
        .filter(m => ['purchase', 'adjustment_add', 'transfer_in', 'return'].includes(m.type))
        .reduce((sum, m) => sum + m.quantity, 0);

      const removals = dayMovements
        .filter(m => ['sale', 'adjustment_remove', 'transfer_out', 'damage', 'expired'].includes(m.type))
        .reduce((sum, m) => sum + m.quantity, 0);

      data.push({
        date: format(date, 'dd MMM'),
        additions,
        removals,
        net: additions - removals,
      });
    }
    return data;
  }, [movements, timeRange]);

  // Expiry analysis
  const expiryAnalysis = React.useMemo(() => {
    const expired = inventory.filter(i => i.expiryDate && differenceInDays(new Date(i.expiryDate), new Date()) <= 0);
    const within30 = inventory.filter(i => {
      if (!i.expiryDate) return false;
      const days = differenceInDays(new Date(i.expiryDate), new Date());
      return days > 0 && days <= 30;
    });
    const within90 = inventory.filter(i => {
      if (!i.expiryDate) return false;
      const days = differenceInDays(new Date(i.expiryDate), new Date());
      return days > 30 && days <= 90;
    });
    const safe = inventory.filter(i => {
      if (!i.expiryDate) return true;
      return differenceInDays(new Date(i.expiryDate), new Date()) > 90;
    });

    return [
      { name: 'Expired', value: expired.length, color: '#ef4444' },
      { name: '0-30 Days', value: within30.length, color: '#f59e0b' },
      { name: '31-90 Days', value: within90.length, color: '#3b82f6' },
      { name: 'Safe (90+ Days)', value: safe.length, color: '#22c55e' },
    ];
  }, [inventory]);

  // Stock status
  const stockStatus = React.useMemo(() => {
    const outOfStock = inventory.filter(i => i.quantity === 0 && i.isActive).length;
    const lowStock = inventory.filter(i => i.quantity > 0 && i.quantity <= i.reorderLevel).length;
    const adequate = inventory.filter(i => i.quantity > i.reorderLevel).length;

    return [
      { name: 'Out of Stock', value: outOfStock, color: '#ef4444' },
      { name: 'Low Stock', value: lowStock, color: '#f59e0b' },
      { name: 'Adequate', value: adequate, color: '#22c55e' },
    ];
  }, [inventory]);

  // Top items by value
  const topItemsByValue = React.useMemo(() => {
    return [...inventory]
      .map(item => ({
        name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
        value: item.quantity * item.costPrice,
        quantity: item.quantity,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [inventory]);

  // Summary stats
  const summary = React.useMemo(() => {
    const totalValue = inventory.reduce((sum, i) => sum + (i.quantity * i.costPrice), 0);
    const potentialRevenue = inventory.reduce((sum, i) => sum + (i.quantity * i.sellingPrice), 0);
    const totalItems = inventory.reduce((sum, i) => sum + i.quantity, 0);
    const avgMargin = inventory.length > 0
      ? inventory.reduce((sum, i) => sum + ((i.sellingPrice - i.costPrice) / i.costPrice * 100), 0) / inventory.length
      : 0;

    return { totalValue, potentialRevenue, totalItems, avgMargin };
  }, [inventory]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c43'];

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Stock Value</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</p>
              </div>
              <IndianRupee className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Potential Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.potentialRevenue)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Units</p>
                <p className="text-2xl font-bold">{summary.totalItems.toLocaleString()}</p>
              </div>
              <Package className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Margin</p>
                <p className="text-2xl font-bold">{summary.avgMargin.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Movement Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock Movement Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={movementTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="additions" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Additions" />
                  <Area type="monotone" dataKey="removals" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Removals" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Value by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock Value by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={valueByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stock Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stockStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {stockStatus.map((item) => (
                <div key={item.name} className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expiry Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expiry Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expiryAnalysis}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expiryAnalysis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {expiryAnalysis.map((item) => (
                <div key={item.name} className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Items by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Items by Value */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 10 Items by Stock Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItemsByValue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#0088FE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Location Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stock by Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#00C49F" radius={[4, 4, 0, 0]} name="Units" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
