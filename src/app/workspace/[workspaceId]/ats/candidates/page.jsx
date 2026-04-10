'use client';

import { useState } from'react';
import { motion, AnimatePresence } from'framer-motion';
import { useParams, useRouter } from'next/navigation';
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
 Sparkles,
 LayoutGrid,
 List as ListIcon,
 FileText
} from'lucide-react';
import { Button } from'@/components/ui/button';
import { Input } from'@/components/ui/input';
import { Badge } from'@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from'@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from'@/components/ui/avatar';
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger
} from'@/components/ui/dropdown-menu';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue
} from'@/components/ui/select';
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from"@/components/ui/table";
import { CandidateModal } from'../_components/CandidateModal';
import { CandidateDetailsModal } from '../_components/CandidateDetailsModal';

import useSWR from'swr';
import axios from'axios';

const fetcher = url => axios.get(url).then(res => res.data);

export default function TalentDatabasePage() {
 const { workspaceId } = useParams();
 const router = useRouter();
 const [searchQuery, setSearchQuery] = useState("");
 const [selectedDepartment, setSelectedDepartment] = useState("all");
 const [selectedStatus, setSelectedStatus] = useState("all");
 const [viewMode, setViewMode] = useState("list");

 const { data: candidates, isLoading, mutate } = useSWR(`/api/workspace/${workspaceId}/ats/candidates`, fetcher);
 const [isAddModalOpen, setIsAddModalOpen] = useState(false);
 const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
 const [selectedCandidateId, setSelectedCandidateId] = useState(null);


 const talents = candidates ? candidates.map(c => ({
 id: c.id,
 name: c.name,
 role: c.applications?.[0]?.job?.title ||"Candidate",
 email: c.email,
 status: c.applications?.[0]?.stage ||"Applied",
 score: c.aiMatchScore ? (c.aiMatchScore / 20).toFixed(1) :"N/A",
 location: c.location ||"N/A",
 applied: new Date(c.createdAt).toLocaleDateString(),
 tags: c.skills || [],
 resumeUrl: c.resumeUrl || null
 })) : [];

 const filteredTalents = talents.filter(t =>
 t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 t.role.toLowerCase().includes(searchQuery.toLowerCase())
 );

 return (
 <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-700">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="space-y-1">
 <h1 className="text-xl font-bold">Talent Database</h1>
 <p className="text-xs font-bold text-muted-foreground opacity-60">Manage and discover candidates across all job positions.</p>
 </div>
 <div className="flex items-center gap-3">
 <Button variant="outline"className="rounded-md px-6 font-bold border-border/40 bg-card/40 backdrop-blur-xl">
 <Download className="w-4 h-4 mr-2 opacity-50"/>
 Export Talent
 </Button>
 <Button
 onClick={() => setIsAddModalOpen(true)}
 className="rounded-md px-6 bg-primary shadow-lg shadow-primary/20"
 >
 <UserPlus className="w-4 h-4"/>
 Add Candidate
 </Button>
 </div>
 </div>

 {/* Filter Bar */}
 <div className="flex flex-col md:flex-row items-center gap-4 bg-card/30 backdrop-blur-xl p-4 rounded-md border border-border/40 shadow-xl shadow-black/5">
 <div className="relative flex-1 group">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors"/>
 <Input
 placeholder="Search by name, role, or skills..."
 className="pl-11 h-14 bg-muted/30 border-none rounded-md font-bold focus-visible:ring-1 focus-visible:ring-primary shadow-inner"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 <div className="flex items-center gap-2">
 <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
 <SelectTrigger className="w-[180px] h-14 bg-muted/30 border-none rounded-md font-bold shadow-inner">
 <SelectValue placeholder="Department"/>
 </SelectTrigger>
 <SelectContent className="rounded-md border-border/40 bg-card/90 backdrop-blur-xl">
 <SelectItem value="all">All Departments</SelectItem>
 <SelectItem value="eng">Engineering</SelectItem>
 <SelectItem value="des">Design</SelectItem>
 <SelectItem value="mkt">Marketing</SelectItem>
 </SelectContent>
 </Select>
 <Select value={selectedStatus} onValueChange={setSelectedStatus}>
 <SelectTrigger className="w-[180px] h-14 bg-muted/30 border-none rounded-md font-bold shadow-inner">
 <SelectValue placeholder="Stage"/>
 </SelectTrigger>
 <SelectContent className="rounded-md border-border/40 bg-card/90 backdrop-blur-xl">
 <SelectItem value="all">All Stages</SelectItem>
 <SelectItem value="interview">Interview</SelectItem>
 <SelectItem value="offer">Offer</SelectItem>
 <SelectItem value="screening">Screening</SelectItem>
 </SelectContent>
 </Select>
 <Button variant="ghost"size="icon"className="h-14 w-14 rounded-md bg-muted/30 hover:bg-primary/10 hover:text-primary transition-all">
 <SlidersHorizontal size={20} />
 </Button>

 <div className="flex items-center gap-1 bg-muted/30 p-1.5 rounded-md border border-border/10 ml-2">
 <Button
 variant="ghost"
 size="icon"
 onClick={() => setViewMode('list')}
 className={`h-11 w-11 rounded-md transition-all ${viewMode ==='list'?'bg-primary text-white shadow-lg shadow-primary/20':'opacity-40 hover:opacity-100'}`}
 >
 <ListIcon size={18} />
 </Button>
 <Button
 variant="ghost"
 size="icon"
 onClick={() => setViewMode('grid')}
 className={`h-11 w-11 rounded-md transition-all ${viewMode ==='grid'?'bg-primary text-white shadow-lg shadow-primary/20':'opacity-40 hover:opacity-100'}`}
 >
 <LayoutGrid size={18} />
 </Button>
 </div>
 </div>
 </div>

 {/* Talent List/Grid */}
 <AnimatePresence mode="wait">
 {viewMode ==='list'? (
 <motion.div
 key="list"
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 20 }}
 transition={{ duration: 0.2 }}
 className="bg-card/30 backdrop-blur-xl rounded-md border border-border/40 overflow-hidden"
 >
 <Table>
 <TableHeader className="bg-muted/50">
 <TableRow className="border-border/40 hover:bg-transparent">
 <TableHead className="text-[10px] py-5 px-6">Candidate</TableHead>
 <TableHead className="text-[10px] py-5">Role</TableHead>
 <TableHead className="text-[10px] py-5 text-center">AI Score</TableHead>
 <TableHead className="text-[10px] py-5">Stage</TableHead>
 <TableHead className="text-[10px] py-5">Location</TableHead>
 <TableHead className="text-[10px] py-5">Applied</TableHead>
 <TableHead className="text-[10px] py-5 text-right px-6">Action</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {filteredTalents.map((candidate) => (
 <TableRow key={candidate.id} className="border-border/20 group hover:bg-primary/5 transition-colors">
 <TableCell className="py-4 px-6">
 <div className="flex items-center gap-3">
 <Avatar className="h-9 w-9 border border-primary/20">
 <AvatarFallback className="bg-primary/5 text-primary text-[10px]">
 {candidate.name.split('').map(n => n[0]).join('')}
 </AvatarFallback>
 </Avatar>
 <div>
 <p className="text-xs">{candidate.name}</p>
 <p className="text-[10px] text-muted-foreground font-bold truncate max-w-[150px] opacity-60">{candidate.email}</p>
 </div>
 </div>
 </TableCell>
 <TableCell>
 <p className="text-xs font-bold opacity-80">{candidate.role}</p>
 </TableCell>
 <TableCell className="text-center">
 <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] italic">
 <Sparkles size={10} /> {candidate.score}
 </div>
 </TableCell>
 <TableCell>
 <Badge className={`bg-${candidate.status ==='Offer'?'emerald': candidate.status ==='Rejected'?'rose':'primary'}-500/10 text-${candidate.status ==='Offer'?'emerald': candidate.status ==='Rejected'?'rose':'primary'}-500 border-none text-[8px] `}>
 {candidate.status}
 </Badge>
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/60">
 <MapPin size={12} /> {candidate.location}
 </div>
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/60">
 <Clock size={12} /> {candidate.applied}
 </div>
 </TableCell>
 <TableCell className="text-right px-6">
 <div className="flex items-center justify-end gap-2">
 <Button
 variant="ghost"
 size="icon"
 className="h-8 w-8 rounded-md opacity-40 hover:opacity-100 hover:bg-primary hover:text-white transition-all shadow-none"
 onClick={() => {
     setSelectedCandidateId(candidate.id);
     setIsDetailsModalOpen(true);
 }}
 >
 <ExternalLink size={14} />
 </Button>
 {candidate.resumeUrl && (
 <Button
 variant="ghost"
 size="icon"
 className="h-8 w-8 rounded-md opacity-40 hover:opacity-100 hover:bg-emerald-500 hover:text-white transition-all shadow-none"
 onClick={() => window.open(candidate.resumeUrl,'_blank')}
 title="View Resume"
 >
 <FileText size={14} />
 </Button>
 )}
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost"size="icon"className="h-8 w-8 rounded-md opacity-40 hover:opacity-100">
 <MoreHorizontal size={14} />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end"className="rounded-md border-border/40 bg-card/90 backdrop-blur-xl">
 <DropdownMenuItem className="font-bold text-xs">Share Profile</DropdownMenuItem>
 <DropdownMenuItem className="font-bold text-xs">Add to Project</DropdownMenuItem>
 <DropdownMenuItem className="font-bold text-xs text-rose-500">Archive</DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </motion.div>
 ) : (
 <motion.div
 key="grid"
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.98 }}
 transition={{ duration: 0.2 }}
 className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
 >
 {filteredTalents.map((candidate, idx) => (
 <motion.div
 key={candidate.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.02 }}
 >
 <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5 hover:border-primary/20 transition-all group cursor-default h-full flex flex-col">
 <CardHeader className="p-6 pb-2 flex flex-row items-start justify-between space-y-0">
 <div className="flex items-center gap-4">
 <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-lg">
 <AvatarFallback className="bg-primary/5 text-primary text-lg">
 {candidate.name.split('').map(n => n[0]).join('')}
 </AvatarFallback>
 </Avatar>
 <div>
 <h3 className="text-lg group-hover:text-primary transition-colors">{candidate.name}</h3>
 <p className="text-[10px] font-bold text-muted-foreground opacity-60">{candidate.role}</p>
 </div>
 </div>
 <div className="flex flex-col items-end gap-1">
 <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] italic">
 <Sparkles size={10} /> {candidate.score}
 </div>
 <Badge className={`bg-${candidate.status ==='Offer'?'emerald': candidate.status ==='Rejected'?'rose':'primary'}-500/10 text-${candidate.status ==='Offer'?'emerald': candidate.status ==='Rejected'?'rose':'primary'}-500 border-none text-[8px] `}>
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
 <Badge key={i} variant="outline"className="h-7 rounded-md border-border/40 bg-muted/10 font-bold px-2 text-[10px] opacity-60">
 {tag}
 </Badge>
 ))}
 </div>

 <div className="mt-auto pt-4 flex items-center gap-2">
 <Button
 variant="outline"
 className="flex-1 rounded-md text-[9px] border-border/40 hover:bg-primary/5 hover:border-primary/20 transition-all"
 onClick={() => {
     setSelectedCandidateId(candidate.id);
     setIsDetailsModalOpen(true);
 }}
 >
 View Profile <ExternalLink size={12} className="ml-2 opacity-50"/>
 </Button>
 <Button variant="ghost"size="icon"className="w-10 rounded-md opacity-40 hover:opacity-100">
 <Mail size={16} />
 </Button>
 {candidate.resumeUrl && (
 <Button
 variant="ghost"
 size="icon"
 className="w-10 rounded-md opacity-40 hover:opacity-100 hover:text-emerald-500"
 onClick={() => window.open(candidate.resumeUrl,'_blank')}
 >
 <FileText size={16} />
 </Button>
 )}
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost"size="icon"className="w-10 rounded-md opacity-40 hover:opacity-100">
 <MoreHorizontal size={16} />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent className="rounded-md border-border/40 bg-card/90 backdrop-blur-xl">
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
 </motion.div>
 )}
 </AnimatePresence>

 {/* Empty State */}
 {!isLoading && filteredTalents.length === 0 && (
 <div className="flex flex-col items-center justify-center py-24 bg-card/10 rounded-md border border-border/10 border-dashed">
 <Users className="w-16 h-16 text-muted-foreground opacity-20 mb-4"/>
 <h3 className="text-lg font-bold opacity-60">No candidates found</h3>
 <p className="text-xs text-muted-foreground opacity-40">Try adjusting your filters or add a new candidate.</p>
 <Button
 onClick={() => setIsAddModalOpen(true)}
 variant="ghost"
 className="mt-6 text-[10px] text-primary"
 >
 <UserPlus className="w-4 h-4 mr-2"/>
 Add First Candidate
 </Button>
 </div>
 )}

 <CandidateModal
 isOpen={isAddModalOpen}
 onClose={() => setIsAddModalOpen(false)}
 workspaceId={workspaceId}
 onSuccess={() => mutate()}
 />

 <CandidateDetailsModal 
 isOpen={isDetailsModalOpen}
 onClose={() => setIsDetailsModalOpen(false)}
 candidateId={selectedCandidateId}
 workspaceId={workspaceId}
 />
 </div>
 );
}