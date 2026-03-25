'use client';

import { motion } from 'framer-motion';
import { 
    MapPin, 
    Briefcase, 
    Clock, 
    ArrowRight,
    Building2,
    DollarSign,
    Zap,
    History
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export const JobCard = ({ job, onApply }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -5 }}
            className="group relative bg-card/60 backdrop-blur-xl border border-border/40 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 cursor-pointer overflow-hidden"
            onClick={() => onApply(job)}
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex flex-col h-full space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                {job.department}
                            </Badge>
                            {((job.createdAt && (new Date() - new Date(job.createdAt)) < 7 * 24 * 60 * 60 * 1000) || (job.postedAt && job.postedAt.includes('day'))) && (
                                <Badge variant="outline" className="text-[10px] font-bold border-amber-500/30 text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <Zap size={10} className="fill-amber-500" /> NEW
                                </Badge>
                            )}
                        </div>
                        <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors line-clamp-1">{job.title}</h3>
                        <p className="text-sm font-bold text-muted-foreground flex items-center gap-1.5 opacity-70">
                            <Building2 size={14} /> {job.company || 'Devlomatix Solutions'}
                        </p>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                        <div className="p-1.5 bg-muted/30 rounded-lg shrink-0">
                            <MapPin size={12} className="text-primary" />
                        </div>
                        <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                        <div className="p-1.5 bg-muted/30 rounded-lg shrink-0">
                            <Briefcase size={12} className="text-primary" />
                        </div>
                        <span>{job.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                        <div className="p-1.5 bg-muted/30 rounded-lg shrink-0">
                            <DollarSign size={12} className="text-primary" />
                        </div>
                        <span>{job.salaryRange || job.salary || 'Competitive'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                        <div className="p-1.5 bg-muted/30 rounded-lg shrink-0">
                            <Clock size={12} className="text-primary" />
                        </div>
                        <span>{job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : (job.postedAt || 'Recently')}</span>
                    </div>
                </div>

                {/* Description Preview */}
                <p className="text-xs font-medium text-muted-foreground/60 line-clamp-2 leading-relaxed pt-2">
                    {job.description}
                </p>

                {/* Footer Action */}
                <div className="pt-4 mt-auto">
                    <Button 
                        variant="link" 
                        className="p-0 h-auto text-[11px] font-black uppercase tracking-widest text-primary hover:no-underline group/btn"
                    >
                        Apply Now
                        <ArrowRight size={14} className="ml-2 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};
