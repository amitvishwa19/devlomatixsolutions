import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, Pill } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function PharmacyAnalytics({ inventory, dispensing, salesData }) {
  // Category performance
  const categoryPerformance = React.useMemo(() => {
    const categories = {};
    dispensing.forEach(d => {
      const medicine = inventory.find(m => m.id === d.medicineId);
      if (medicine) {
        const cat = medicine.category;
        if (!categories[cat]) categories[cat] = { count: 0, revenue: 0 };
        categories[cat].count += d.quantity;
        categories[cat].revenue += d.quantity * medicine.sellingPrice;
      }
    });
    return Object.entries(categories).map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue,
    })).sort((a, b) => b.revenue - a.revenue);
  }, [inventory, dispensing]);

  // Top selling medicines
  const topMedicines = React.useMemo(() => {
    const medicines = {};
    dispensing.forEach(d => {
      if (!medicines[d.medicineName]) medicines[d.medicineName] = 0;
      medicines[d.medicineName] += d.quantity;
    });
    return Object.entries(medicines)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [dispensing]);

  // Stock value by category
  const stockValueByCategory = React.useMemo(() => {
    const categories = {};
    inventory.forEach(item => {
      if (!categories[item.category]) categories[item.category] = 0;
      categories[item.category] += item.quantity * item.costPrice;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [inventory]);

  // Revenue trend
  const revenueTrend = React.useMemo(() => {
    return salesData.map(d => ({
      date: format(d.date, 'EEE'),
      revenue: d.revenue,
      items: d.items,
    }));
  }, [salesData]);

  const totalRevenue = salesData.reduce((sum, d) => sum + d.revenue, 0);
  const totalItems = salesData.reduce((sum, d) => sum + d.items, 0);
  const avgOrderValue = totalRevenue / totalItems;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekly Revenue</p>
                <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span className="text-xs text-emerald-600">+12.5% vs last week</span>
                </div>
              </div>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Items Dispensed</p>
                <p className="text-2xl font-bold">{totalItems.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-blue-600">+8.3% vs last week</span>
                </div>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                <Pill className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                <p className="text-2xl font-bold">₹{avgOrderValue.toFixed(0)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="w-3 h-3 text-amber-600" />
                  <span className="text-xs text-amber-600">-2.1% vs last week</span>
                </div>
              </div>
              <div className="p-2 bg-amber-100 dark:bg-amber-950 rounded-lg">
                <Package className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unique Patients</p>
                <p className="text-2xl font-bold">{new Set(dispensing.map(d => d.patientId)).size}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-purple-600" />
                  <span className="text-xs text-purple-600">+5.7% vs last week</span>
                </div>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Stock Value Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Stock Value by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockValueByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {stockValueByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Selling Medicines */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Selling Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topMedicines} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis type="category" dataKey="name" width={120} className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryPerformance.slice(0, 5).map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[i % COLORS.length] }} 
                    />
                    <span className="font-medium text-sm">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">₹{cat.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{cat.count} units sold</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
