'use client';

import { motion, AnimatePresence } from'framer-motion';
import { useParams, useRouter } from'next/navigation';
import {
 Search,
 Filter,
 Plus,
 Briefcase,
 MapPin,
 Users,
 MoreHorizontal,
 ChevronRight,
 ArrowUpRight,
 Circle,
 LayoutGrid,
 List
} from'lucide-react';
import { Button } from'@/components/ui/button';
import { Input } from'@/components/ui/input';
import { Badge } from'@/components/ui/badge';
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger
} from'@/components/ui/dropdown-menu';

import useSWR from'swr';
import axios from'axios';

const fetcher = url => axios.get(url).then(res => res.data);

export default function JobManagementPage() {
 const { workspaceId } = useParams();
 const router = useRouter();

 const { data: jobs, isLoading } = useSWR(`/api/workspace/${workspaceId}/ats/jobs`, fetcher);

 const displayJobs = jobs || [];

 const getStatusColor = (status) => {
 switch (status) {
 case'OPEN': return'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
 case'DRAFT': return'bg-blue-500/10 text-blue-500 border-blue-500/20';
 case'CLOSED': return'bg-rose-500/10 text-rose-500 border-rose-500/20';
 case'ARCHIVED': return'bg-muted/40 text-muted-foreground border-border/20';
 default: return'bg-secondary text-secondary-foreground';
 }
 };

 return (
 <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-700">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="space-y-1">
 <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted-foreground opacity-40">
 <span onClick={() => router.push(`/workspace/${workspaceId}/ats`)} className="hover:text-primary cursor-pointer transition-colors">ATS</span>
 <ChevronRight size={10} />
 <span className="text-primary/60">Jobs</span>
 </div>
 <h1 className="text-xl font-bold">Job Management</h1>
 </div>
 <div className="flex items-center gap-3">
 <Button
 onClick={() => router.push(`/workspace/${workspaceId}/ats/jobs/create`)}
 className="rounded-md px-6 font-bold bg-primary shadow-lg shadow-primary/20"
 >
 <Plus className="w-4 h-4"/>
 Create Position
 </Button>
 </div>
 </div>

 {/* Filters Bar */}
 <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2 rounded-md bg-card/30 backdrop-blur-xl border border-border/40 shadow-xl shadow-black/5">
 <div className="relative flex-1 w-full">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40"/>
 <Input
 placeholder="Search positions by title, department..."
 className="pl-11 bg-transparent border-none h-12 text-sm font-medium focus-visible:ring-0 shadow-none"
 />
 </div>
 <div className="h-8 w-[1px] bg-border/40 hidden md:block"/>
 <div className="flex items-center gap-2 w-full md:w-auto px-2">
 <Button variant="ghost"className="rounded-md px-4 text-xs font-bold gap-2">
 <Filter size={14} className="opacity-40"/>
 Departments
 </Button>
 <Button variant="ghost"className="rounded-md px-4 text-xs font-bold gap-2">
 Status
 </Button>
 <div className="flex bg-muted/40 p-1 rounded-md ml-2">
 <Button variant="ghost"size="icon"className="h-8 w-8 rounded-md bg-background shadow-xs">
 <List size={14} />
 </Button>
 <Button variant="ghost"size="icon"className="h-8 w-8 rounded-md opacity-40">
 <LayoutGrid size={14} />
 </Button>
 </div>
 </div>
 </div>

 {/* Jobs List */}
 <div className="bg-card/30 backdrop-blur-xl border border-border/40 rounded-md overflow-hidden shadow-2xl shadow-black/10">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-border/40 bg-muted/10">
 <th className="p-6 text-[10px] tracking-[0.2em] text-muted-foreground opacity-40">Position</th>
 <th className="p-6 text-[10px] tracking-[0.2em] text-muted-foreground opacity-40">Department</th>
 <th className="p-6 text-[10px] tracking-[0.2em] text-muted-foreground opacity-40">Location</th>
 <th className="p-6 text-[10px] tracking-[0.2em] text-muted-foreground opacity-40 text-center">Applicants</th>
 <th className="p-6 text-[10px] tracking-[0.2em] text-muted-foreground opacity-40">Status</th>
 <th className="p-6 text-[10px] tracking-[0.2em] text-muted-foreground opacity-40"></th>
 </tr>
 </thead>
 <tbody>
 <AnimatePresence mode="popLayout">
 {displayJobs.map((job, i) => (
 <motion.tr
 key={job.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.05 }}
 className="border-b border-border/10 hover:bg-primary/5 transition-colors group cursor-pointer"
 onClick={() => router.push(`/workspace/${workspaceId}/ats/jobs/${job.id}`)}
 >
 <td className="p-6">
 <div className="flex items-center gap-4">
 <div className={`w-10 rounded-md flex items-center justify-center ${getStatusColor(job.status)} group-hover:scale-110 transition-transform`}>
 <Briefcase size={18} />
 </div>
 <div>
 <h4 className="text-sm group-hover:text-primary transition-colors">{job.title}</h4>
 <p className="text-[10px] font-bold text-muted-foreground opacity-60">{job.type}</p>
 </div>
 </div>
 </td>
 <td className="p-6">
 <Badge variant="outline"className="text-[10px] font-bold border-border/40 bg-muted/20 px-3 py-1 rounded-md">
 {job.department ||'N/A'}
 </Badge>
 </td>
 <td className="p-6">
 <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground opacity-60">
 <MapPin size={14} className="text-primary"/>
 {job.location ||'Remote'}
 </div>
 </td>
 <td className="p-6 text-center">
 <div className="inline-flex flex-col items-center justify-center min-w-[60px] p-2 rounded-md bg-muted/20 border border-border/10">
 <span className="text-sm">{job._count?.applications || 0}</span>
 <span className="text-[9px] font-bold text-muted-foreground opacity-40">Total</span>
 </div>
 </td>
 <td className="p-6">
 <div className="flex items-center gap-2">
 <div className={`w-2 h-2 rounded-full ${getStatusColor(job.status).split('')[1].replace('text-','bg-')}`} />
 <span className={`text-[10px] ${getStatusColor(job.status).split('')[1]}`}>
 {job.status}
 </span>
 </div>
 </td>
 <td className="p-6">
 <div className="flex items-center justify-end gap-2">
 <Button
 onClick={(e) => {
 e.stopPropagation();
 router.push(`/workspace/${workspaceId}/ats/pipeline?jobId=${job.id}`)
 }}
 size="sm"
 className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-[9px] shadow-lg shadow-primary/20 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100"
 >
 View Pipeline
 </Button>
 <DropdownMenu>
 <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
 <Button variant="ghost"size="icon"className="h-8 w-8 rounded-md opacity-40 group-hover:opacity-100">
 <MoreHorizontal size={16} />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end"className="w-48 rounded-md border-border/40 bg-card/90 backdrop-blur-xl">
 <DropdownMenuItem className="text-xs font-bold gap-2">
 Edit Position
 </DropdownMenuItem>
 <DropdownMenuItem className="text-xs font-bold gap-2">
 Preview Public Page
 </DropdownMenuItem>
 <DropdownMenuItem className="text-xs font-bold gap-2 text-rose-500">
 Close Position
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </td>
 </motion.tr>
 ))}
 </AnimatePresence>
 </tbody>
 </table>
 </div>
 <div className="p-6 border-t border-border/40 bg-muted/5 flex items-center justify-between">
 <p className="text-xs font-bold text-muted-foreground opacity-40">Showing {displayJobs.length} total positions</p>
 <div className="flex items-center gap-2">
 <Button variant="outline"size="sm"disabled className="h-8 rounded-md text-[10px] border-border/40 opacity-50">Previous</Button>
 <Button variant="outline"size="sm"disabled className="h-8 rounded-md text-[10px] border-border/40 opacity-50">Next</Button>
 </div>
 </div>
 </div>
 </div>
 );
}