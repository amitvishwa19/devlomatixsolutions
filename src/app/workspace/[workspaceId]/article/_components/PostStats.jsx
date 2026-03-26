'use client';

import { Clock, CheckCircle2, LayoutGrid, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const PostStats = ({ posts }) => {
 const stats = [
 { label: 'Scheduled', value: posts.filter(p => p.status === 'SCHEDULED').length, icon: Clock, color: 'text-blue-500' },
 { label: 'Published', value: posts.filter(p => p.status === 'PUBLISHED').length, icon: CheckCircle2, color: 'text-emerald-500' },
 { label: 'Total Posts', value: posts.length, icon: LayoutGrid, color: 'text-primary' },
 { label: 'Failed', value: posts.filter(p => p.status === 'FAILED').length, icon: AlertCircle, color: 'text-rose-500' },
 ];

 return (
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 {stats.map((stat, i) => (
 <div key={i} className="bg-card/100 p-6 rounded-lg border border-border/100 backdrop-blur-md hover:border-primary/20 transition-colors">
 <div className="flex items-center justify-between mb-2">
 <stat.icon size={20} className={stat.color} />
 <Badge variant="outline" className="border-none bg-muted/30 text-[10px] text-muted-foreground font-bold">This Month</Badge>
 </div>
 <h4 className="text-2xl font-bold text-foreground">{stat.value}</h4>
 <p className="text-muted-foreground text-[10px] font-bold ">{stat.label}</p>
 </div>
 ))}
 </div>
 );
};
