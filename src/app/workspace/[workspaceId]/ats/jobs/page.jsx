'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
    List,
    Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import useSWR from 'swr';
import axios from 'axios';
import JobCreateSheet from './components/JobCreateSheet';
import { useState } from 'react';
import { toast } from 'sonner';

const fetcher = url => axios.get(url).then(res => res.data);

export default function JobManagementPage() {
    const { workspaceId } = useParams();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");

    const { data: jobs, isLoading, mutate } = useSWR(`/api/workspace/${workspaceId}/ats/jobs`, fetcher);

    const displayJobs = (jobs || []).filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleClosePosition = async (jobId) => {
        try {
            await axios.put(`/api/workspace/${workspaceId}/ats/jobs/${jobId}`, {
                status: 'CLOSED'
            });
            toast.success("Position closed successfully");
            mutate();
        } catch (error) {
            toast.error("Failed to close position");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'DRAFT': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'CLOSED': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'ARCHIVED': return 'bg-muted/40 text-muted-foreground border-border/20';
            default: return 'bg-secondary text-secondary-foreground';
        }
    };

    const getDotColor = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-emerald-500';
            case 'DRAFT': return 'bg-blue-500';
            case 'CLOSED': return 'bg-rose-500';
            case 'ARCHIVED': return 'bg-muted-foreground';
            default: return 'bg-secondary-foreground';
        }
    };

    const getTextColor = (status) => {
        switch (status) {
            case 'OPEN': return 'text-emerald-500';
            case 'DRAFT': return 'text-blue-500';
            case 'CLOSED': return 'text-rose-500';
            case 'ARCHIVED': return 'text-muted-foreground';
            default: return 'text-secondary-foreground';
        }
    };

    return (
        <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs tracking-[0.2em] text-muted-foreground opacity-40">
                        <Link
                            href={`/workspace/${workspaceId}/ats`}
                            className="hover:text-primary cursor-pointer transition-colors"
                        >
                            ATS
                        </Link>
                        <ChevronRight size={10} />
                        <span className="text-primary/60">Jobs</span>
                    </div>
                    <h1 className="text-xl font-bold italic tracking-tighter">Job Management</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/workspace/${workspaceId}/ats/departments`)}
                        className="rounded-md px-6 font-bold border-border/40 hover:bg-muted/20"
                    >
                        <Building2 className="w-4 h-4 mr-2 opacity-50" />
                        Departments
                    </Button>
                    <JobCreateSheet
                        workspaceId={workspaceId}
                        onSuccess={() => mutate()}
                    />
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2 rounded-md bg-card/30 backdrop-blur-xl border border-border/40 shadow-xl shadow-black/5">
                <div className="relative flex-1 w-full text-zinc-900 border-none border-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
                    <Input
                        placeholder="Search positions by title, category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-11 bg-transparent border-none h-12 font-medium focus-visible:ring-0 shadow-none  text-xs  opacity-60"
                    />
                </div>
                <div className="h-8  bg-border/40 hidden md:block" />
                <div className="flex items-center gap-2 w-full md:w-auto px-2">
                    <Button
                        variant="ghost"
                        className="rounded-md px-4 text-xs font-bold gap-2"
                        onClick={() => router.push(`/workspace/${workspaceId}/ats/departments`)}
                    >
                        <Filter size={14} className="opacity-40" />
                        Departments
                    </Button>
                    <Button variant="ghost" className="rounded-md px-4 text-xs font-bold gap-2">
                        Status
                    </Button>
                    <div className="flex bg-muted/40 p-1 rounded-md ml-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md bg-background shadow-xs">
                            <List size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md opacity-40">
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
                                <th className="p-6 text-xs tracking-[0.2em] text-muted-foreground opacity-40 ">Position</th>
                                <th className="p-6 text-xs tracking-[0.2em] text-muted-foreground opacity-40 ">Department</th>
                                <th className="p-6 text-xs tracking-[0.2em] text-muted-foreground opacity-40 ">Location</th>
                                <th className="p-6 text-xs tracking-[0.2em] text-muted-foreground opacity-40 text-center ">Applicants</th>
                                <th className="p-6 text-xs tracking-[0.2em] text-muted-foreground opacity-40 ">Status</th>
                                <th className="p-6 text-xs tracking-[0.2em] text-muted-foreground opacity-40"></th>
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
                                                <div className={`w-10 h-10 rounded-md flex items-center justify-center ${getStatusColor(job.status)} group-hover:scale-110 transition-transform`}>
                                                    <Briefcase size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold group-hover:text-primary transition-colors tracking-tight">{job.title}</h4>
                                                    <p className="text-xs   text-muted-foreground/60 tracking-wider font-mono">{job.type}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <Badge variant="outline" className="text-xs   tracking-wider border-border/40 bg-muted/20 px-3 py-1 rounded-md">
                                                {job.category?.name || job.department || 'General'}
                                            </Badge>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-xs   tracking-wider text-muted-foreground opacity-60">
                                                <MapPin size={12} className="text-primary" />
                                                {job.location || 'Remote'}
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="inline-flex flex-col items-center justify-center min-w-[60px] p-2 rounded-md bg-muted/20 border border-border/10">
                                                <span className="text-xs ">{job._count?.applications || 0}</span>
                                                <span className="text-[9px]    text-muted-foreground/40">Total</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${getDotColor(job.status)}`} />
                                                <span className={`text-xs   tracking-wider ${getTextColor(job.status)}`}>
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
                                                    className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-[9px]    shadow-lg shadow-primary/20 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100"
                                                >
                                                    View Pipeline
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md opacity-40 group-hover:opacity-100">
                                                            <MoreHorizontal size={16} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-md border-border/40 bg-card/90 backdrop-blur-xl">
                                                        <JobCreateSheet
                                                            workspaceId={workspaceId}
                                                            isEdit={true}
                                                            data={job}
                                                            onSuccess={() => mutate()}
                                                            trigger={
                                                                <DropdownMenuItem
                                                                    className="text-xs    p-3 gap-2"
                                                                    onSelect={(e) => e.preventDefault()}
                                                                >
                                                                    Edit Position
                                                                </DropdownMenuItem>
                                                            }
                                                        />
                                                        <DropdownMenuItem
                                                            className="text-xs    p-3 gap-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(`/jobs/${job.id}`, '_blank');
                                                            }}
                                                        >
                                                            Preview Public Page
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-xs    p-3 gap-2 text-rose-500"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleClosePosition(job.id);
                                                            }}
                                                        >
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
                    <p className="text-xs    text-muted-foreground/40">Showing {displayJobs.length} total positions</p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled className="h-8 rounded-md text-xs    border-border/40 opacity-50">Previous</Button>
                        <Button variant="outline" size="sm" disabled className="h-8 rounded-md text-xs    border-border/40 opacity-50">Next</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
