import { Users, Phone, Star, Globe, TrendingUp } from 'lucide-react';
import type { Lead } from '../data/mockLeads';

interface StatsBarProps {
  leads: Lead[];
}

const StatsBar = ({ leads }: StatsBarProps) => {
  const totalLeads = leads.length;
  const avgRating = leads.length > 0
    ? (leads.reduce((sum, l) => sum + l.rating, 0) / leads.length).toFixed(1)
    : '0';
  const withPhone = leads.filter((l) => l.phone).length;
  const withWebsite = leads.filter((l) => l.website).length;
  const highRated = leads.filter((l) => l.rating >= 4).length;

  const stats = [
    { label: 'Total Leads', value: totalLeads, icon: Users, color: 'text-primary' },
    { label: 'With Phone', value: withPhone, icon: Phone, color: 'text-success' },
    { label: 'With Website', value: withWebsite, icon: Globe, color: 'text-blue-500' },
    { label: 'Avg Rating', value: avgRating, icon: Star, color: 'text-warning' },
    { label: '4+ Rated', value: highRated, icon: TrendingUp, color: 'text-success' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in">
      {stats.map((stat) => (
        <div key={stat.label} className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className={`p-2.5 rounded-lg bg-secondary ${stat.color}`}>
            <stat.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;
