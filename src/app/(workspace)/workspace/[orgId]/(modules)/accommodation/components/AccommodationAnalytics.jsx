import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, Bed, Users, IndianRupee, Activity } from 'lucide-react';
import { calculateStatsByRoomType, calculateStatsByFloor, calculateOccupancyStats, formatCurrency } from '../utils/utils';
import { ROOM_TYPES, BED_STATUSES } from '../utils/types';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6'];

export function AccommodationAnalytics({ rooms }) {
  const overallStats = React.useMemo(() => calculateOccupancyStats(rooms), [rooms]);
  const roomTypeStats = React.useMemo(() => calculateStatsByRoomType(rooms), [rooms]);
  const floorStats = React.useMemo(() => calculateStatsByFloor(rooms), [rooms]);

  // Prepare chart data
  const occupancyByType = roomTypeStats.map((stat, index) => ({
    name: stat.name,
    occupied: stat.occupiedBeds,
    available: stat.availableBeds,
    total: stat.totalBeds,
    rate: stat.totalBeds > 0 ? ((stat.occupiedBeds / stat.totalBeds) * 100).toFixed(1) : 0,
    fill: COLORS[index % COLORS.length],
  }));

  const occupancyByFloor = floorStats.map((stat, index) => ({
    name: stat.shortName,
    fullName: stat.name,
    occupied: stat.occupiedBeds,
    available: stat.availableBeds,
    total: stat.totalBeds,
    rooms: stat.rooms,
    fill: COLORS[index % COLORS.length],
  }));

  const statusDistribution = [
    { name: 'Occupied', value: overallStats.occupiedBeds, color: '#3b82f6' },
    { name: 'Available', value: overallStats.availableBeds, color: '#22c55e' },
    { name: 'Reserved', value: overallStats.reservedBeds, color: '#f59e0b' },
    { name: 'Cleaning', value: overallStats.cleaningBeds, color: '#8b5cf6' },
    { name: 'Maintenance', value: overallStats.maintenanceBeds, color: '#6b7280' },
    { name: 'Discharge Pending', value: overallStats.dischargePendingBeds, color: '#f97316' },
  ].filter(s => s.value > 0);

  // Revenue by room type
  const revenueByType = roomTypeStats.map(stat => {
    const roomType = ROOM_TYPES.find(t => t.id === stat.id);
    const roomsOfType = rooms.filter(r => r.type === stat.id);
    const dailyRate = roomsOfType.length > 0 ? roomsOfType[0].dailyRate : 0;
    return {
      name: stat.name,
      dailyRevenue: stat.occupiedBeds * dailyRate,
      potentialRevenue: stat.totalBeds * dailyRate,
    };
  });

  // Mock trend data (last 7 days)
  const occupancyTrend = [
    { day: 'Mon', occupancy: 72 },
    { day: 'Tue', occupancy: 75 },
    { day: 'Wed', occupancy: 78 },
    { day: 'Thu', occupancy: 74 },
    { day: 'Fri', occupancy: 80 },
    { day: 'Sat', occupancy: 82 },
    { day: 'Sun', occupancy: parseFloat(overallStats.occupancyRate) },
  ];

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="space-y-4 pr-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                  <p className="text-2xl font-bold">{overallStats.occupancyRate}%</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Beds</p>
                  <p className="text-2xl font-bold">{overallStats.totalBeds}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Bed className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Patients</p>
                  <p className="text-2xl font-bold">{overallStats.occupiedBeds + overallStats.dischargePendingBeds}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold">{overallStats.availableBeds}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <Activity className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-2 gap-4">
          {/* Bed Status Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Bed Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} beds`, name]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Occupancy Trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Weekly Occupancy Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={occupancyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip formatter={(value) => [`${value}%`, 'Occupancy']} />
                    <Line 
                      type="monotone" 
                      dataKey="occupancy" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-2 gap-4">
          {/* Occupancy by Room Type */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Occupancy by Room Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={occupancyByType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="occupied" stackId="a" fill="#3b82f6" name="Occupied" />
                    <Bar dataKey="available" stackId="a" fill="#22c55e" name="Available" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Occupancy by Floor */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Beds by Floor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={occupancyByFloor}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="fullName" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="occupied" fill="#3b82f6" name="Occupied" />
                    <Bar dataKey="available" fill="#22c55e" name="Available" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Analysis */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Daily Revenue by Room Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByType}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), '']}
                  />
                  <Legend />
                  <Bar dataKey="dailyRevenue" fill="hsl(var(--primary))" name="Current Revenue" />
                  <Bar dataKey="potentialRevenue" fill="hsl(var(--primary)/0.3)" name="Potential Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
