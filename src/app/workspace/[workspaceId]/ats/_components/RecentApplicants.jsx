'use client';

import { motion } from 'framer-motion';
import { 
 User, 
 MoreVertical, 
 Star, 
 ArrowRight,
 Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const RecentApplicants = ({ applicants = [] }) => {
 const defaultApplicants = [
 { 
 name: "Rahul Sharma", 
 role: "Frontend Dev", 
 score: 4.8, 
 appliedAt: "2h ago", 
 avatar: null,
 status: "Screening"
 },
 { 
 name: "Priya Patel", 
 role: "Product Designer", 
 score: 4.5, 
 appliedAt: "5h ago", 
 avatar: null,
 status: "Applied"
 }
 ];

 const displayApplicants = applicants.length > 0 ? applicants.map(app => ({
 name: app.candidate?.name || "Anonymous",
 role: app.job?.title || "Unknown Position",
 score: app.candidate?.aiMatchScore ? (app.candidate.aiMatchScore / 20).toFixed(1) : null,
 appliedAt: new Date(app.createdAt).toLocaleDateString(),
 avatar: app.candidate?.avatarUrl,
 status: app.stage
 })) : defaultApplicants;

 const getStatusColor = (status) => {
 switch (status) {
 case 'Applied': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
 case 'Screening': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
 case 'Interview': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
 default: return 'bg-secondary text-secondary-foreground';
 }
 };

 return (
 <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-md overflow-hidden shadow-2xl shadow-black/5">
 <CardHeader className="flex flex-row items-center justify-between">
 <CardTitle className="text-xl ">Recent Applicants</CardTitle>
 <div className="flex items-center gap-2">
 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-40 hover:opacity-100 bg-muted/40 backdrop-blur-xl">
 <Search size={14} />
 </Button>
 </div>
 </CardHeader>
 <CardContent className="px-2">
 <div className="space-y-1">
 {displayApplicants.map((applicant, i) => (
 <motion.div
 key={i}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: i * 0.1 }}
 className="flex items-center justify-between p-4 rounded-md hover:bg-primary/5 transition-all cursor-pointer group"
 >
 <div className="flex items-center gap-4">
 <Avatar className="h-10 w-10 border-2 border-primary/20 bg-background group-hover:scale-110 transition-transform">
 <AvatarImage src={applicant.avatar} />
 <AvatarFallback className="bg-primary/10 text-primary text-xs ">
 {applicant.name.split(' ').map(n => n[0]).join('')}
 </AvatarFallback>
 </Avatar>
 <div className="space-y-0.5">
 <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{applicant.name}</h4>
 <p className="text-[10px] text-muted-foreground opacity-40">{applicant.role}</p>
 </div>
 </div>
 <div className="flex flex-col items-end gap-1.5">
 <Badge className={`text-[9px] tracking-wider px-2 py-0.5 rounded-full ${getStatusColor(applicant.status)}`}>
 {applicant.status}
 </Badge>
 <div className="flex items-center gap-2">
 {applicant.score && (
 <div className="flex items-center gap-1">
 <Star size={10} className="fill-amber-500 text-amber-500" />
 <span className="text-[10px]">{applicant.score}</span>
 </div>
 )}
 <span className="text-[9px] font-medium text-muted-foreground opacity-60">{applicant.appliedAt}</span>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 <Button variant="ghost" className="w-full mt-4 text-[10px] tracking-[0.2em] opacity-40 hover:opacity-100 hover:bg-primary/5 rounded-md h-12">
 View Talent Database <ArrowRight size={12} className="ml-2" />
 </Button>
 </CardContent>
 </Card>
 );
};
