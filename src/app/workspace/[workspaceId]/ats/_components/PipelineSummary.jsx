'use client';

import { motion } from 'framer-motion';
import { 
 Users, 
 CheckCircle2, 
 Clock, 
 MoreHorizontal,
 ArrowUpRight,
 Search,
 Play
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export const PipelineSummary = ({ stats, nextInterview }) => {
 const { workspaceId } = useParams();
 const router = useRouter();
 const defaultStages = [
 { label: "Applied", count: 0, color: "bg-blue-500", progress: 100 },
 { label: "Screening", count: 0, color: "bg-amber-500", progress: 80 },
 { label: "Technical", count: 0, color: "bg-primary", progress: 60 },
 { label: "Cultural", count: 0, color: "bg-emerald-500", progress: 40 },
 { label: "Offer", count: 0, color: "bg-indigo-500", progress: 20 }
 ];

 const displayStages = stats || defaultStages;

 return (
 <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5">
 <CardHeader className="flex flex-row items-center justify-between pb-6">
 <div className="space-y-1">
 <CardTitle className="text-2xl tracking-tighter">Hiring Pipeline</CardTitle>
 <p className="text-[10px] tracking-[0.2em] text-muted-foreground opacity-40">Candidate Flow across all jobs</p>
 </div>
 <Button variant="outline" className="h-10 rounded-lg px-4 text-[9px] border-border/40 bg-card/40 backdrop-blur-xl">
 Detailed Pipeline <ArrowUpRight className="ml-2 w-3 h-3" />
 </Button>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
 {displayStages.map((stage, i) => (
 <motion.div
 key={i}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.1 }}
 className="space-y-4"
 >
 <div className="flex flex-col gap-1">
 <span className={`w-2 h-2 rounded-full ${stage.color} mb-2 shadow-lg shadow-black/20`} />
 <h4 className="text-xs opacity-60">{stage.label}</h4>
 <div className="flex items-baseline gap-1">
 <span className="text-2xl">{stage.count}</span>
 <span className="text-[10px] font-bold text-muted-foreground">Candidates</span>
 </div>
 </div>
 <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
 <motion.div
 initial={{ width: 0 }}
 animate={{ width: `${stage.progress}%` }}
 transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
 className={`h-full ${stage.color} shadow-lg shadow-black/20`}
 />
 </div>
 </motion.div>
 ))}
 </div>

 <div className="mt-12 p-6 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
 <Clock size={20} />
 </div>
 <div>
 <h4 className="text-sm">Upcoming Interviews</h4>
 <p className="text-[10px] font-bold text-muted-foreground opacity-60 ">
 {nextInterview ? `Next scheduled: ${nextInterview.time} with ${nextInterview.name}` : "No upcoming interviews scheduled"}
 </p>
 </div>
 </div>
 <Button 
 onClick={() => router.push(`/workspace/${workspaceId}/ats/interviews/${nextInterview?.id || 'demo-session'}`)}
 className="rounded-lg h-10 px-6 text-[9px] bg-foreground text-background hover:bg-foreground/90 transition-all shadow-xl shadow-black/20"
 >
 Launch Interview Space <Play size={12} className="ml-2 fill-current" />
 </Button>
 </div>
 </CardContent>
 </Card>
 );
};
