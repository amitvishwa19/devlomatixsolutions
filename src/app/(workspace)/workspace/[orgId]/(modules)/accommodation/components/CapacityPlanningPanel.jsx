import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, TrendingDown, AlertTriangle, Calendar, 
  Bed, Users, BarChart3, Target, ArrowRight, RefreshCw 
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { format, addDays, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import { ROOM_TYPES, FLOORS } from '../utils/types';

export function CapacityPlanningPanel({ rooms, reservations = [] }) {
  const [forecastPeriod, setForecastPeriod] = React.useState('7');
  const [selectedRoomType, setSelectedRoomType] = React.useState('all');

  // Calculate current capacity stats
  const capacityStats = React.useMemo(() => {
    let totalBeds = 0;
    let occupiedBeds = 0;
    let reservedBeds = 0;
    let availableBeds = 0;
    let maintenanceBeds = 0;
    const byType = {};
    const byFloor = {};

    rooms.forEach(room => {
      if (selectedRoomType !== 'all' && room.type !== selectedRoomType) return;
      
      if (!byType[room.type]) {
        byType[room.type] = { total: 0, occupied: 0, reserved: 0, available: 0 };
      }
      if (!byFloor[room.floor]) {
        byFloor[room.floor] = { total: 0, occupied: 0, reserved: 0, available: 0 };
      }

      room.beds.forEach(bed => {
        totalBeds++;
        byType[room.type].total++;
        byFloor[room.floor].total++;

        switch (bed.status) {
          case 'occupied':
            occupiedBeds++;
            byType[room.type].occupied++;
            byFloor[room.floor].occupied++;
            break;
          case 'reserved':
            reservedBeds++;
            byType[room.type].reserved++;
            byFloor[room.floor].reserved++;
            break;
          case 'available':
          case 'cleaning':
            availableBeds++;
            byType[room.type].available++;
            byFloor[room.floor].available++;
            break;
          case 'maintenance':
            maintenanceBeds++;
            break;
        }
      });
    });

    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    const utilizationRate = totalBeds > 0 ? Math.round(((occupiedBeds + reservedBeds) / totalBeds) * 100) : 0;

    return { 
      totalBeds, occupiedBeds, reservedBeds, availableBeds, maintenanceBeds,
      occupancyRate, utilizationRate, byType, byFloor 
    };
  }, [rooms, selectedRoomType]);

  // Generate forecast data with realistic patterns
  const forecastData = React.useMemo(() => {
    const days = parseInt(forecastPeriod);
    const data = [];
    const today = new Date();
    
    // Base values from current state
    const baseOccupancy = capacityStats.occupancyRate;
    const totalBeds = capacityStats.totalBeds;
    
    // Get upcoming reservations by date
    const reservationsByDate = {};
    reservations.forEach(res => {
      if (res.status === 'confirmed') {
        const dateKey = format(new Date(res.expectedArrival), 'yyyy-MM-dd');
        reservationsByDate[dateKey] = (reservationsByDate[dateKey] || 0) + 1;
      }
    });

    for (let i = 0; i < days; i++) {
      const date = addDays(today, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayOfWeek = date.getDay();
      
      // Add weekly patterns (higher on weekdays)
      const weekdayFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.85 : 1.05;
      
      // Random variation
      const randomVariation = (Math.random() - 0.5) * 10;
      
      // Scheduled admissions from reservations
      const scheduledAdmissions = reservationsByDate[dateKey] || 0;
      const admissionImpact = (scheduledAdmissions / totalBeds) * 100;
      
      // Expected discharges (estimate based on average stay)
      const expectedDischarges = Math.floor(Math.random() * 3) + 1;
      const dischargeImpact = (expectedDischarges / totalBeds) * 100;
      
      // Calculate forecasted occupancy
      let forecastedOccupancy = baseOccupancy * weekdayFactor + randomVariation + admissionImpact - dischargeImpact;
      forecastedOccupancy = Math.max(20, Math.min(100, forecastedOccupancy));
      
      // Calculate confidence interval (wider for further dates)
      const confidenceSpread = 5 + (i * 0.5);
      
      data.push({
        date: format(date, 'MMM dd'),
        fullDate: date,
        occupancy: Math.round(forecastedOccupancy),
        lowerBound: Math.round(Math.max(0, forecastedOccupancy - confidenceSpread)),
        upperBound: Math.round(Math.min(100, forecastedOccupancy + confidenceSpread)),
        admissions: scheduledAdmissions + Math.floor(Math.random() * 3),
        discharges: expectedDischarges,
        availableBeds: Math.round(totalBeds * (1 - forecastedOccupancy / 100)),
      });
    }
    
    return data;
  }, [forecastPeriod, capacityStats, reservations]);

  // Historical trend data (last 14 days simulation)
  const historicalData = React.useMemo(() => {
    const data = [];
    const today = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const date = subDays(today, i);
      const dayOfWeek = date.getDay();
      const weekdayFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.85 : 1.0;
      const baseRate = 65 + Math.random() * 20;
      
      data.push({
        date: format(date, 'MMM dd'),
        occupancy: Math.round(baseRate * weekdayFactor),
        admissions: Math.floor(Math.random() * 8) + 2,
        discharges: Math.floor(Math.random() * 7) + 2,
      });
    }
    
    return data;
  }, []);

  // Room type distribution for pie chart
  const roomTypeDistribution = React.useMemo(() => {
    const distribution = [];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
    
    Object.entries(capacityStats.byType).forEach(([type, stats], index) => {
      const roomType = ROOM_TYPES.find(t => t.id === type);
      distribution.push({
        name: roomType?.name || type,
        value: stats.total,
        occupied: stats.occupied,
        available: stats.available,
        color: colors[index % colors.length],
      });
    });
    
    return distribution;
  }, [capacityStats]);

  // Demand forecast alerts
  const alerts = React.useMemo(() => {
    const alertList = [];
    
    // High occupancy alert
    if (capacityStats.occupancyRate > 85) {
      alertList.push({
        type: 'critical',
        message: `High occupancy alert: ${capacityStats.occupancyRate}% beds occupied`,
        icon: AlertTriangle,
      });
    }
    
    // ICU capacity check
    const icuStats = capacityStats.byType['icu'];
    if (icuStats && icuStats.total > 0) {
      const icuOccupancy = Math.round((icuStats.occupied / icuStats.total) * 100);
      if (icuOccupancy > 80) {
        alertList.push({
          type: 'warning',
          message: `ICU at ${icuOccupancy}% capacity - only ${icuStats.available} beds available`,
          icon: AlertTriangle,
        });
      }
    }
    
    // Upcoming surge from reservations
    const upcomingReservations = reservations.filter(r => 
      r.status === 'confirmed' && 
      new Date(r.expectedArrival) <= addDays(new Date(), 3)
    ).length;
    
    if (upcomingReservations > capacityStats.availableBeds * 0.7) {
      alertList.push({
        type: 'warning',
        message: `${upcomingReservations} reservations in next 3 days may exceed available beds`,
        icon: Calendar,
      });
    }
    
    // Forecast peak warning
    const peakDay = forecastData.reduce((max, day) => 
      day.occupancy > max.occupancy ? day : max, forecastData[0]
    );
    if (peakDay && peakDay.occupancy > 90) {
      alertList.push({
        type: 'info',
        message: `Peak occupancy of ${peakDay.occupancy}% expected on ${peakDay.date}`,
        icon: TrendingUp,
      });
    }
    
    return alertList;
  }, [capacityStats, reservations, forecastData]);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Capacity Planning & Forecasting
          </h2>
          <p className="text-sm text-muted-foreground">
            Predict bed demand and optimize resource allocation
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Room Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Room Types</SelectItem>
              {ROOM_TYPES.map(type => (
                <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="14">14 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                alert.type === 'critical' ? 'bg-destructive/10 border-destructive/30 text-destructive' :
                alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-700' :
                'bg-blue-500/10 border-blue-500/30 text-blue-700'
              }`}
            >
              <alert.icon className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Current Occupancy</p>
                <p className="text-2xl font-bold">{capacityStats.occupancyRate}%</p>
              </div>
              <div className={`p-2 rounded-full ${
                capacityStats.occupancyRate > 85 ? 'bg-destructive/10 text-destructive' :
                capacityStats.occupancyRate > 70 ? 'bg-amber-500/10 text-amber-600' :
                'bg-green-500/10 text-green-600'
              }`}>
                <Bed className="h-5 w-5" />
              </div>
            </div>
            <Progress 
              value={capacityStats.occupancyRate} 
              className="h-1.5 mt-3"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Available Beds</p>
                <p className="text-2xl font-bold text-green-600">{capacityStats.availableBeds}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                of {capacityStats.totalBeds}
              </Badge>
            </div>
            <div className="flex gap-2 mt-3">
              <Badge variant="secondary" className="text-[10px]">
                {capacityStats.reservedBeds} Reserved
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {capacityStats.maintenanceBeds} Maintenance
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Forecast Peak</p>
                <p className="text-2xl font-bold">
                  {Math.max(...forecastData.map(d => d.occupancy))}%
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Expected in {forecastPeriod} day period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Upcoming Admissions</p>
                <p className="text-2xl font-bold">
                  {reservations.filter(r => 
                    r.status === 'confirmed' && 
                    new Date(r.expectedArrival) <= addDays(new Date(), parseInt(forecastPeriod))
                  ).length}
                </p>
              </div>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Confirmed reservations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="forecast" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forecast">Occupancy Forecast</TabsTrigger>
          <TabsTrigger value="historical">Historical Trend</TabsTrigger>
          <TabsTrigger value="distribution">Bed Distribution</TabsTrigger>
          <TabsTrigger value="floor">By Floor</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Occupancy Forecast (Next {forecastPeriod} Days)</CardTitle>
              <CardDescription className="text-xs">
                Predicted bed occupancy with confidence intervals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} className="text-xs" tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip 
                      contentStyle={{ fontSize: 12 }}
                      formatter={(value, name) => [
                        `${value}%`,
                        name === 'occupancy' ? 'Forecast' : 
                        name === 'upperBound' ? 'Upper Bound' : 'Lower Bound'
                      ]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="upperBound"
                      stroke="transparent"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.1}
                      name="Upper Bound"
                    />
                    <Area
                      type="monotone"
                      dataKey="lowerBound"
                      stroke="transparent"
                      fill="transparent"
                      name="Lower Bound"
                    />
                    <Line
                      type="monotone"
                      dataKey="occupancy"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                      name="Forecast"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {/* Daily breakdown */}
              <div className="mt-4 grid grid-cols-7 gap-2">
                {forecastData.slice(0, 7).map((day, index) => (
                  <div 
                    key={index}
                    className={`p-2 rounded text-center border ${
                      day.occupancy > 85 ? 'bg-destructive/10 border-destructive/30' :
                      day.occupancy > 70 ? 'bg-amber-500/10 border-amber-500/30' :
                      'bg-green-500/10 border-green-500/30'
                    }`}
                  >
                    <p className="text-[10px] text-muted-foreground">{day.date}</p>
                    <p className="text-sm font-semibold">{day.occupancy}%</p>
                    <p className="text-[10px] text-muted-foreground">
                      {day.availableBeds} free
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historical">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Historical Occupancy (Last 14 Days)</CardTitle>
              <CardDescription className="text-xs">
                Past occupancy trends with admission/discharge patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} className="text-xs" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="occupancy"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Occupancy %"
                    />
                    <Line
                      type="monotone"
                      dataKey="admissions"
                      stroke="#10b981"
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                      name="Admissions"
                    />
                    <Line
                      type="monotone"
                      dataKey="discharges"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                      name="Discharges"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Bed Distribution by Room Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roomTypeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {roomTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-3">
                  {roomTypeDistribution.map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="text-sm font-medium">{type.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="secondary">{type.occupied} occupied</Badge>
                        <Badge variant="outline">{type.available} free</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="floor">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Capacity by Floor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(capacityStats.byFloor).map(([floor, stats]) => ({
                      floor: FLOORS.find(f => f.id === floor)?.name || floor,
                      occupied: stats.occupied,
                      reserved: stats.reserved,
                      available: stats.available,
                    }))}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="floor" type="category" tick={{ fontSize: 10 }} width={100} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Legend />
                    <Bar dataKey="occupied" stackId="a" fill="#3b82f6" name="Occupied" />
                    <Bar dataKey="reserved" stackId="a" fill="#f59e0b" name="Reserved" />
                    <Bar dataKey="available" stackId="a" fill="#10b981" name="Available" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            Capacity Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {capacityStats.occupancyRate > 80 && (
              <div className="p-3 rounded-lg border bg-amber-500/5 border-amber-500/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Consider Overflow Planning</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      With {capacityStats.occupancyRate}% occupancy, prepare contingency beds 
                      or coordinate with partner facilities.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {capacityStats.maintenanceBeds > 0 && (
              <div className="p-3 rounded-lg border bg-blue-500/5 border-blue-500/20">
                <div className="flex items-start gap-2">
                  <RefreshCw className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Expedite Maintenance</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {capacityStats.maintenanceBeds} beds under maintenance. 
                      Prioritize repairs to increase availability.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-3 rounded-lg border bg-green-500/5 border-green-500/20">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Optimize Discharge Timing</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Schedule discharges before noon to maximize bed turnover 
                    for afternoon admissions.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-3 rounded-lg border bg-purple-500/5 border-purple-500/20">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Stagger Elective Admissions</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Distribute elective surgeries across weekdays to 
                    maintain consistent occupancy levels.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
