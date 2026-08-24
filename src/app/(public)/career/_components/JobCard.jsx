'use client';

import { motion } from 'framer-motion';
import {
    MapPin,
    Clock,
    ArrowRight,
    Zap,
    IndianRupee
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
            className="group relative bg-card backdrop-blur-xl border border-border/70 rounded-2xl p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 cursor-pointer overflow-hidden"
            onClick={() => onApply(job)}
        >
            {/* Background Glow */}
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />

            <div className="relative z-10 flex flex-col h-full space-y-4">
                {/* Header: Title & Badges */}
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-primary/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                {job.category?.name || job.department || 'Engineering'}
                            </Badge>
                            {job.isHot && (
                                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Zap size={10} className="fill-amber-500" /> Urgent
                                </Badge>
                            )}
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">{job.title}</h3>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                        <div className="p-1.5 bg-secondary/80 rounded-lg shrink-0">
                            <MapPin size={12} className="text-primary" />
                        </div>
                        <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                        <div className="p-1.5 bg-secondary/80 rounded-lg shrink-0">
                            <IndianRupee size={12} className="text-primary" />
                        </div>
                        <span>{job.salaryRange || job.salary || 'Competitive'} p/m</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                        <div className="p-1.5 bg-secondary/80 rounded-lg shrink-0">
                            <Clock size={12} className="text-primary" />
                        </div>
                        <span>{job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : (job.postedAt || 'Recently')}</span>
                    </div>
                </div>

                {/* Description Preview */}
                <div className="text-xs font-normal text-muted-foreground line-clamp-2 leading-relaxed pt-2">
                    {job.description?.replace(/<[^>]*>/g, '')}
                </div>

                {/* Footer Action */}
                <div className="pt-4 mt-auto">
                    <Button
                        variant="link"
                        className="p-0 h-auto text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 group/btn"
                    >
                        <span>Apply Position</span>
                        <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};
