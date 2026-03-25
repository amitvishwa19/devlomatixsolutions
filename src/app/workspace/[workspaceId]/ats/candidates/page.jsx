'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
    Search,
    Filter,
    Download,
    UserPlus,
    MoreHorizontal,
    Star,
    Mail,
    Phone,
    MapPin,
    ExternalLink,
    ChevronRight,
    Users,
    CheckCircle2,
    Clock,
    X,
    SlidersHorizontal,
    Briefcase,
    Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

export default function TalentDatabasePage() {
    const { workspaceId } = useParams();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");

    const talents = [
        { id: "c1", name: "Rahul Sharma", role: "Sr. Frontend Engineer", email: "rahul@example.com", status: "Interview", score: 4.8, location: "Delhi", applied: "2d ago", tags: ["React", "Next.js"] },
        { id: "c2", name: "Ananya Iyer", role: "Product Designer", email: "ananya@example.com", status: "Offer", score: 4.9, location: "Mumbai", applied: "5d ago", tags: ["Figma", "UI/UX"] },
        { id: "c3", name: "Vikram Malhotra", role: "Backend Architect", email: "vikram@example.com", status: "Screening", score: 4.2, location: "Bangalore", applied: "1w ago", tags: ["Go", "K8s"] },
        { id: "c4", name: "Sanya Gupta", role: "HR Generalist", email: "sanya@example.com", status: "Technical", score: 3.5, location: "Pune", applied: "3d ago", tags: ["Recruitment", "Operations"] },
        { id: "c5", name: "Amit Verma", role: "Full Stack Dev", email: "amit@example.com", status: "Rejected", score: 3.8, location: "Noida", applied: "10d ago", tags: ["Node.js", "React"] },
        { id: "c6", name: "Meera Reddy", role: "QA Lead", email: "meera@example.com", status: "Interview", score: 4.5, location: "Hyderabad", applied: "4d ago", tags: ["Automation", "Selenium"] },
    ];

    const filteredTalents = talents.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-4 p-4  animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-xl font-bold">Talent Database</h1>
                    <p className="text-sm font-bold text-muted-foreground opacity-60">Manage and discover candidates across all job positions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 rounded-md px-6 font-bold border-border/40 bg-card/40 backdrop-blur-xl">
                        <Download className="w-4 h-4 mr-2 opacity-50" />
                        Export Talent
                    </Button>
                    <Button className="h-10 rounded-md px-6 font-black uppercase tracking-widest text-[10px] bg-primary shadow-lg shadow-primary/20">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Candidate
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-card/30 backdrop-blur-xl p-4 rounded-lg border border-border/40 shadow-xl shadow-black/5">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by name, role, or skills..."
                        className="pl-11 h-14 bg-muted/30 border-none rounded-lg font-bold focus-visible:ring-1 focus-visible:ring-primary shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                        <SelectTrigger className="w-[180px] h-14 bg-muted/30 border-none rounded-lg font-bold shadow-inner">
                            <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/40 bg-card/90 backdrop-blur-xl">
                            <SelectItem value="all">All Departments</SelectItem>
                            <SelectItem value="eng">Engineering</SelectItem>
                            <SelectItem value="des">Design</SelectItem>
                            <SelectItem value="mkt">Marketing</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-[180px] h-14 bg-muted/30 border-none rounded-lg font-bold shadow-inner">
                            <SelectValue placeholder="Stage" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/40 bg-card/90 backdrop-blur-xl">
                            <SelectItem value="all">All Stages</SelectItem>
                            <SelectItem value="interview">Interview</SelectItem>
                            <SelectItem value="offer">Offer</SelectItem>
                            <SelectItem value="screening">Screening</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-lg bg-muted/30 hover:bg-primary/10 hover:text-primary transition-all">
                        <SlidersHorizontal size={20} />
                    </Button>
                </div>
            </div>

            {/* Talent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredTalents.map((candidate, idx) => (
                        <motion.div
                            key={candidate.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5 hover:border-primary/20 transition-all group cursor-default h-full flex flex-col">
                                <CardHeader className="p-6 pb-2 flex flex-row items-start justify-between space-y-0">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-lg">
                                            <AvatarFallback className="bg-primary/5 text-primary font-black uppercase text-lg">
                                                {candidate.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">{candidate.name}</h3>
                                            <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">{candidate.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black italic">
                                            <Sparkles size={10} /> {candidate.score}
                                        </div>
                                        <Badge className={`bg-${candidate.status === 'Offer' ? 'emerald' : candidate.status === 'Rejected' ? 'rose' : 'primary'}-500/10 text-${candidate.status === 'Offer' ? 'emerald' : candidate.status === 'Rejected' ? 'rose' : 'primary'}-500 border-none text-[8px] font-black uppercase tracking-widest`}>
                                            {candidate.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 pt-4 flex-1 flex flex-col gap-6">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground/60">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={12} /> {candidate.location}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} /> {candidate.applied}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {candidate.tags.map((tag, i) => (
                                            <Badge key={i} variant="outline" className="h-7 rounded-md border-border/40 bg-muted/10 font-bold px-2 text-[10px] opacity-60">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>

                                    <div className="mt-auto pt-4 flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1 h-10 rounded-xl font-black uppercase tracking-widest text-[9px] border-border/40 hover:bg-primary/5 hover:border-primary/20 transition-all"
                                            onClick={() => router.push(`/workspace/${workspaceId}/ats/candidates/${candidate.id}`)}
                                        >
                                            View Profile <ExternalLink size={12} className="ml-2 opacity-50" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl opacity-40 hover:opacity-100">
                                            <Mail size={16} />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl opacity-40 hover:opacity-100">
                                                    <MoreHorizontal size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="rounded-xl border-border/40 bg-card/90 backdrop-blur-xl">
                                                <DropdownMenuItem className="font-bold text-xs">Share Profile</DropdownMenuItem>
                                                <DropdownMenuItem className="font-bold text-xs">Add to Project</DropdownMenuItem>
                                                <DropdownMenuItem className="font-bold text-xs text-rose-500">Archive</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Pagination Placeholder */}
            <div className="flex items-center justify-center pt-8">
                <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg border border-border/20 backdrop-blur-xl">
                    <Button variant="ghost" className="h-10 w-10 rounded-xl font-bold opacity-40">1</Button>
                    <Button variant="ghost" className="h-10 w-10 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20">2</Button>
                    <Button variant="ghost" className="h-10 w-10 rounded-xl font-bold opacity-40">3</Button>
                    <span className="mx-2 opacity-40">...</span>
                    <Button variant="ghost" className="h-10 w-10 rounded-xl font-bold opacity-40">12</Button>
                </div>
            </div>
        </div>
    );
}
