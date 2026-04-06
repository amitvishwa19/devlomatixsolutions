import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieIcon, Star } from 'lucide-react';
import type { Lead } from '../data/mockLeads';

interface AnalyticsDashboardProps {
  leads: Lead[];
}

const CHART_COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(250, 91%, 65%)',
  'hsl(0, 84%, 60%)',
  'hsl(180, 70%, 45%)',
  'hsl(300, 60%, 55%)',
  'hsl(60, 70%, 50%)',
];

const AnalyticsDashboard = ({ leads }: AnalyticsDashboardProps) => {
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      counts[l.category] = (counts[l.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name: name.length > 18 ? name.slice(0, 18) + '…' : name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [leads]);

  const ratingData = useMemo(() => {
    const buckets = [
      { name: '0-1', min: 0, max: 1 },
      { name: '1-2', min: 1, max: 2 },
      { name: '2-3', min: 2, max: 3 },
      { name: '3-4', min: 3, max: 4 },
      { name: '4-5', min: 4, max: 5.1 },
    ];
    return buckets.map((b) => ({
      name: b.name,
      count: leads.filter((l) => l.rating >= b.min && l.rating < b.max).length,
    }));
  }, [leads]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      const label = l.status.charAt(0).toUpperCase() + l.status.slice(1);
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const locationData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      const loc = l.city || l.state || l.country || 'Unknown';
      counts[loc] = (counts[loc] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name: name.length > 15 ? name.slice(0, 15) + '…' : name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [leads]);

  if (leads.length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 text-center animate-fade-in">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No data to display</h3>
        <p className="text-muted-foreground">Search for leads first to see analytics.</p>
      </div>
    );
  }

  const tooltipStyle = {
    contentStyle: {
      background: 'hsl(222, 47%, 9%)',
      border: '1px solid hsl(217, 33%, 18%)',
      borderRadius: '8px',
      color: 'hsl(210, 40%, 96%)',
      fontSize: '13px',
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Leads by Category</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" />
              <XAxis type="number" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Breakdown */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Status Breakdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px', color: 'hsl(215, 20%, 55%)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Rating Distribution */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-warning" />
            <h3 className="font-semibold text-foreground">Rating Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={ratingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="count" stroke="hsl(38, 92%, 50%)" fill="hsl(38, 92%, 50%)" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Locations */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-success" />
            <h3 className="font-semibold text-foreground">Top Locations</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
