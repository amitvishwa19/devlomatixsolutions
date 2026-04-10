'use client';

import React, { useState, useEffect } from'react';
import { 
 Clock, 
 CheckCircle2, 
 LayoutGrid, 
 AlertCircle,
 Heart,
 MessageCircle,
 TrendingUp,
 BarChart3
} from'lucide-react';
import { Badge } from'@/components/ui/badge';
import { useParams } from'next/navigation';
import axios from'@/utils/axios';
import { cn } from'@/lib/utils';

export const PostStats = ({ posts }) => {
 const params = useParams();
 const workspaceId = params.workspaceId;
 const [analytics, setAnalytics] = useState(null);
 const [loading, setLoading] = useState(false);

 useEffect(() => {
 const fetchAnalytics = async () => {
 setLoading(true);
 try {
 const res = await axios.get(`/api/workspace/${workspaceId}/social/analytics`);
 setAnalytics(res.data.summary);
 } catch (error) {
 console.error("[ANALYTICS_FETCH_ERROR]", error);
 } finally {
 setLoading(false);
 }
 };

 if (posts && posts.some(p => p.status ==='PUBLISHED')) {
 fetchAnalytics();
 }
 }, [workspaceId, posts]);

 const stats = [
 { label:'Scheduled', value: posts.filter(p => p.status ==='SCHEDULED').length, icon: Clock, color:'text-blue-500', bg:'bg-blue-500/5'},
 { label:'Published', value: posts.filter(p => p.status ==='PUBLISHED').length, icon: CheckCircle2, color:'text-emerald-500', bg:'bg-emerald-500/5'},
 { label:'Likes', value: analytics?.totalLikes ??'-', icon: Heart, color:'text-rose-500', bg:'bg-rose-500/5', isEngagement: true },
 { label:'Comments', value: analytics?.totalComments ??'-', icon: MessageCircle, color:'text-amber-500', bg:'bg-amber-500/5', isEngagement: true },
 ];

 return (
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-1">
 {stats.map((stat, i) => (
 <div key={i} className={cn(
"p-4 rounded-md border border-border/40 backdrop-blur-md transition-all hover:shadow-soft group relative overflow-hidden",
 stat.bg
 )}>
 {/* Background Highlight */}
 <div className={cn(
"absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-5 group-hover:opacity-10 transition-opacity",
 stat.color.replace('text-','bg-')
 )} />

 <div className="flex items-center justify-between mb-3 relative z-10">
 <div className={cn("p-2 rounded-md bg-background border border-border/40 shadow-sm", stat.color)}>
 <stat.icon size={16} />
 </div>
 {stat.isEngagement ? (
 <Badge variant="outline"className="border-none bg-primary/5 text-primary text-[8px] tracking-widest px-1.5 h-4">
 LIVE
 </Badge>
 ) : (
 <Badge variant="outline"className="border-none bg-muted/30 text-[8px] text-muted-foreground tracking-widest px-1.5 h-4">
 SYNCED
 </Badge>
 )}
 </div>
 
 <div className="relative z-10">
 <h4 className="text-xl text-foreground tracking-tight flex items-baseline gap-1">
 {loading && stat.isEngagement ? (
 <span className="animate-pulse">...</span>
 ) : (
 stat.value
 )}
 </h4>
 <p className="text-muted-foreground text-[9px] uppercase tracking-wider opacity-60">
 {stat.label}
 </p>
 </div>
 </div>
 ))}
 </div>
 );
};