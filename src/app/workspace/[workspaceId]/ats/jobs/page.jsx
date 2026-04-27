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
    const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'
    
    // Sheet State
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

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
                    <div className="flex items-center gap-2 text-xs  text-muted-foreground opacity-40">
                        <Link
                            href={`/workspace/${workspaceId}/ats`}
                            className="hover:text-primary cursor-pointer transition-colors"
                        >
                            ATS
                        </Link>
                        <ChevronRight size={10} />
                        <span className="text-primary/60">Jobs</span>
                    </div>
                    <h1 className="text-xl font-bold  ">Job Management</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/workspace/${workspaceId}/ats/departments`)}
                        className="rounded-md px-6 font-bold  hover:bg-muted/20"
                    >
                        <Building2 className="w-4 h-4 mr-2 opacity-50" />
                        Departments
                    </Button>
                    <Button 
                        className="rounded-md px-6 font-bold bg-primary shadow-lg shadow-primary/20"
                        onClick={() => {
                            setIsEditMode(false);
                            setSelectedJob(null);
                            setIsSheetOpen(true);
                        }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Position
                    </Button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2 rounded-md bg-card/30 backdrop-blur-xl border  shadow-xl shadow-black/5">
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
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 rounded-md transition-all ${viewMode === 'list' ? 'bg-background shadow-xs opacity-100' : 'opacity-40 hover:opacity-100'}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={14} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 rounded-md transition-all ${viewMode === 'grid' ? 'bg-background shadow-xs opacity-100' : 'opacity-40 hover:opacity-100'}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid size={14} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Jobs List/Grid Container */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {viewMode === 'list' ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="bg-card/30 backdrop-blur-xl border rounded-md overflow-hidden shadow-2xl shadow-black/10"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b  bg-muted/10">
                                            <th className="p-6 text-xs  text-muted-foreground opacity-40 ">Position</th>
                                            <th className="p-6 text-xs  text-muted-foreground opacity-40 ">Department</th>
                                            <th className="p-6 text-xs  text-muted-foreground opacity-40 ">Location</th>
                                            <th className="p-6 text-xs  text-muted-foreground opacity-40 text-center ">Applicants</th>
                                            <th className="p-6 text-xs  text-muted-foreground opacity-40 ">Status</th>
                                            <th className="p-6 text-xs  text-muted-foreground opacity-40"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayJobs.map((job, i) => (
                                            <motion.tr
                                                key={job.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="border-b border-border/10 hover:bg-primary/5 transition-colors group cursor-pointer"

                                            >
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${getStatusColor(job.status)} group-hover:scale-110 transition-transform`}>
                                                            <Briefcase size={18} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold group-hover:text-primary transition-colors tracking-tight">{job.title}</h4>
                                                            <p className="text-xs   text-muted-foreground/60  font-mono">{job.type}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <Badge variant="outline" className="text-xs     bg-muted/20 px-3 py-1 rounded-md">
                                                        {job.category?.name || job.department || 'General'}
                                                    </Badge>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex items-center gap-2 text-xs    text-muted-foreground opacity-60">
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
                                                        <span className={`text-xs    ${getTextColor(job.status)}`}>
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
                                                            <DropdownMenuContent align="end" className="w-48 rounded-md  bg-card/90 backdrop-blur-xl">
                                                                <DropdownMenuItem
                                                                    className="text-xs p-3 gap-2 font-semibold"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setIsEditMode(true);
                                                                        setSelectedJob(job);
                                                                        setIsSheetOpen(true);
                                                                    }}
                                                                >
                                                                    Edit Position
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-xs p-3 gap-2 font-semibold"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        window.open(`/jobs/${job.id}`, '_blank');
                                                                    }}
                                                                >
                                                                    Preview Public Page
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-xs p-3 gap-2 text-rose-500 font-semibold"
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
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-6 border-t  bg-muted/5 flex items-center justify-between">
                                <p className="text-xs    text-muted-foreground/40">Showing {displayJobs.length} total positions</p>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" disabled className="h-8 rounded-md text-xs     opacity-50">Previous</Button>
                                    <Button variant="outline" size="sm" disabled className="h-8 rounded-md text-xs     opacity-50">Next</Button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {displayJobs.map((job, i) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-card p-6 flex flex-col gap-6 group cursor-pointer hover:border-primary/40 transition-all"
                                    onClick={(e) => {
                                        // Prevent redirect if clicking on a button or menu item
                                        if (e.target.closest('button') || e.target.closest('[role="menuitem"]')) return;
                                        router.push(`/workspace/${workspaceId}/ats/jobs/${job.id}`)
                                    }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor(job.status)}`}>
                                                <Briefcase size={22} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold tracking-tight text-lg group-hover:text-primary transition-colors">{job.title}</h4>
                                                <p className="text-xs text-muted-foreground/60   ">{job.type}</p>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md opacity-40 group-hover:opacity-100">
                                                    <MoreHorizontal size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-md bg-card/90 backdrop-blur-xl">
                                                <DropdownMenuItem
                                                    className="text-xs p-3 gap-2 font-semibold"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsEditMode(true);
                                                        setSelectedJob(job);
                                                        setIsSheetOpen(true);
                                                    }}
                                                >
                                                    Edit Position
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-xs p-3 gap-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(`/jobs/${job.id}`, '_blank');
                                                    }}
                                                >
                                                    Preview Public Page
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-xs p-3 gap-2 text-rose-500"
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

                                    <div className="flex items-center gap-4">
                                        <Badge variant="outline" className="text-[10px]    bg-muted/20 px-3 py-1 rounded-md border-border/40">
                                            {job.category?.name || job.department || 'General'}
                                        </Badge>
                                        <div className="flex items-center gap-2 text-[10px]    text-muted-foreground opacity-60">
                                            <MapPin size={12} className="text-primary" />
                                            {job.location || 'Remote'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 rounded-lg bg-muted/20 border border-border/10 flex flex-col items-center">
                                            <span className="text-lg ">{job._count?.applications || 0}</span>
                                            <span className="text-[9px]    text-muted-foreground/40">Applicants</span>
                                        </div>
                                        <div className="p-3 rounded-lg bg-muted/20 border border-border/10 flex flex-col items-center">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-2 h-2 rounded-full ${getDotColor(job.status)}`} />
                                                <span className={`text-[10px]    ${getTextColor(job.status)}`}>{job.status}</span>
                                            </div>
                                            <span className="text-[9px]    text-muted-foreground/40">Status</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/workspace/${workspaceId}/ats/pipeline?jobId=${job.id}`)
                                        }}
                                        className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-[10px]    shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        View Pipeline
                                    </Button>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Single Shared Modal/Sheet for Create and Edit */}
            <JobCreateSheet
                workspaceId={workspaceId}
                open={isSheetOpen}
                setOpen={setIsSheetOpen}
                isEdit={isEditMode}
                data={selectedJob}
                onSuccess={() => mutate()}
            />
        </div>
    );
}
