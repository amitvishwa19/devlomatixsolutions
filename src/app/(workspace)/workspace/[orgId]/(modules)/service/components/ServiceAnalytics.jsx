import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart
} from 'recharts';
import { formatCurrency, getCategoryConfig } from '../utils/utils';
import { SERVICE_CATEGORIES } from '../utils/types';

const COLORS = [
  'hsl(168, 80%, 42%)', // Primary teal
  'hsl(199, 89%, 48%)', // Blue
  'hsl(262, 83%, 58%)', // Purple
  'hsl(38, 92%, 50%)',  // Amber
  'hsl(142, 76%, 36%)', // Green
  'hsl(0, 84%, 60%)',   // Red
  'hsl(340, 82%, 52%)', // Pink
  'hsl(25, 95%, 53%)',  // Orange
];

export function ServiceAnalytics({ services }) {
  // Category distribution
  const categoryData = useMemo(() => {
    const counts = {};
    services.forEach(s => {
      const cat = getCategoryConfig(s.category);
      counts[cat.name] = (counts[cat.name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [services]);

  // Revenue by category (estimated based on usage)
  const revenueData = useMemo(() => {
    const revenue = {};
    services.forEach(s => {
      const cat = getCategoryConfig(s.category);
      revenue[cat.name] = (revenue[cat.name] || 0) + (s.basePrice * (s.usageCount || 0));
    });
    return Object.entries(revenue)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [services]);

  // Top services by usage
  const topServicesData = useMemo(() => {
    return [...services]
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 10)
      .map(s => ({
        name: s.name.length > 20 ? s.name.substring(0, 20) + '...' : s.name,
        usage: s.usageCount || 0,
        revenue: s.basePrice * (s.usageCount || 0),
      }));
  }, [services]);

  // Price distribution
  const priceDistribution = useMemo(() => {
    const ranges = [
      { name: '₹0-500', min: 0, max: 500, count: 0 },
      { name: '₹500-1K', min: 500, max: 1000, count: 0 },
      { name: '₹1K-2K', min: 1000, max: 2000, count: 0 },
      { name: '₹2K-5K', min: 2000, max: 5000, count: 0 },
      { name: '₹5K-10K', min: 5000, max: 10000, count: 0 },
      { name: '₹10K+', min: 10000, max: Infinity, count: 0 },
    ];

    services.forEach(s => {
      const range = ranges.find(r => s.basePrice >= r.min && s.basePrice < r.max);
      if (range) range.count++;
    });

    return ranges;
  }, [services]);

  // Service type distribution
  const serviceTypeData = useMemo(() => {
    const types = { opd: 0, ipd: 0, both: 0 };
    services.forEach(s => {
      if (types[s.serviceType] !== undefined) {
        types[s.serviceType]++;
      }
    });
    return [
      { name: 'OPD Only', value: types.opd },
      { name: 'IPD Only', value: types.ipd },
      { name: 'Both', value: types.both },
    ];
  }, [services]);

  // Department usage
  const departmentData = useMemo(() => {
    const depts = {};
    services.forEach(s => {
      depts[s.department] = (depts[s.department] || 0) + (s.usageCount || 0);
    });
    return Object.entries(depts)
      .map(([name, usage]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), usage }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 8);
  }, [services]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.dataKey === 'revenue'
                ? formatCurrency(entry.value)
                : entry.value.toLocaleString('en-IN')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Row - Overview Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Services by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Service Type Distribution */}
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">OPD vs IPD Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    <Cell fill="hsl(199, 89%, 48%)" />
                    <Cell fill="hsl(262, 83%, 58%)" />
                    <Cell fill="hsl(168, 80%, 42%)" />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Category */}
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Estimated Revenue by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <YAxis type="category" dataKey="category" width={120} />
                <Tooltip
                  content={<CustomTooltip />}
                  formatter={(value) => formatCurrency(value)}
                />
                <Bar dataKey="revenue" fill="hsl(168, 80%, 42%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services by Usage */}
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top 10 Services by Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topServicesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="usage" fill="hsl(199, 89%, 48%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Price Distribution */}
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Price Range Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Usage */}
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Service Usage by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="usage"
                  stroke="hsl(168, 80%, 42%)"
                  fill="hsl(168, 80%, 42%)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
