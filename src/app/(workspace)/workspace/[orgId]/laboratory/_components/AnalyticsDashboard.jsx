import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { format, differenceInHours, subDays, startOfDay } from 'date-fns';
import { 
  TrendingUp, 
  Clock, 
  PieChart as PieChartIcon, 
  BarChart3,
  Activity
} from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--info))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--destructive))'];

export function AnalyticsDashboard({ orders }) {
  const analytics = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayStart = startOfDay(date);
      const count = orders.filter(o => {
        const orderDate = startOfDay(o.collectedAt);
        return orderDate.getTime() === dayStart.getTime();
      }).length;
      return {
        date: format(date, 'EEE'),
        fullDate: format(date, 'MMM dd'),
        count,
      };
    });

    const categoryMap = new Map();
    orders.forEach(o => {
      o.tests.forEach(test => {
        const count = categoryMap.get(test.category) || 0;
        categoryMap.set(test.category, count + 1);
      });
    });
    const totalTests = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);
    const categoryDistribution = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / totalTests) * 100),
    }));

    const completedOrders = orders.filter(o => o.status === 'completed' && o.completedAt);
    const tatByTest = new Map();
    completedOrders.forEach(o => {
      if (o.completedAt) {
        const tat = differenceInHours(o.completedAt, o.collectedAt);
        o.tests.forEach(test => {
          const existing = tatByTest.get(test.testCode) || [];
          existing.push(tat);
          tatByTest.set(test.testCode, existing);
        });
      }
    });
    const turnaroundTimes = Array.from(tatByTest.entries()).map(([testCode, times]) => ({
      testCode,
      avgTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    }));

    const statusTrend = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayStart = startOfDay(date);
      const dayOrders = orders.filter(o => startOfDay(o.collectedAt).getTime() === dayStart.getTime());
      return {
        date: format(date, 'EEE'),
        pending: dayOrders.filter(o => o.status === 'pending').length,
        processing: dayOrders.filter(o => o.status === 'processing').length,
        completed: dayOrders.filter(o => o.status === 'completed').length,
      };
    });

    const priorityBreakdown = [
      { name: 'Routine', value: orders.filter(o => o.priority === 'routine').length },
      { name: 'Urgent', value: orders.filter(o => o.priority === 'urgent').length },
      { name: 'STAT', value: orders.filter(o => o.priority === 'stat').length },
    ].filter(p => p.value > 0);

    const avgTat = completedOrders.length > 0
      ? completedOrders.reduce((acc, o) => {
          if (o.completedAt) {
            return acc + differenceInHours(o.completedAt, o.collectedAt);
          }
          return acc;
        }, 0) / completedOrders.length
      : 0;

    const completionRate = orders.length > 0 
      ? Math.round((completedOrders.length / orders.length) * 100) 
      : 0;

    return {
      dailyOrders: last7Days,
      categoryDistribution,
      turnaroundTimes,
      statusTrend,
      priorityBreakdown,
      avgTat: Math.round(avgTat),
      completionRate,
      totalTests: orders.length,
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground">Lab performance metrics and trends</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Turnaround</CardTitle>
            <Clock className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgTat}h</div>
            <p className="text-xs text-muted-foreground">Average time to completion</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Of all orders completed</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tests</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTests}</div>
            <p className="text-xs text-muted-foreground">Orders in the system</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Daily Orders (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.dailyOrders}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#colorOrders)"
                    strokeWidth={2}
                    name="Orders"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary" />
              Test Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryDistribution}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ category, percentage }) => `${category} (${percentage}%)`}
                    labelLine={false}
                  >
                    {analytics.categoryDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Status Distribution (7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.statusTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="pending" 
                    stroke="hsl(var(--warning))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--warning))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="processing" 
                    stroke="hsl(var(--info))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--info))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--success))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Avg. Turnaround by Test (hours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.turnaroundTimes} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number"
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                  />
                  <YAxis 
                    type="category"
                    dataKey="testCode" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    width={60}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [`${value} hours`, 'Avg. TAT']}
                  />
                  <Bar 
                    dataKey="avgTime" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {analytics.priorityBreakdown.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Priority Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              {analytics.priorityBreakdown.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.value} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
