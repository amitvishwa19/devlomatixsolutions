'use client';

import { motion } from 'framer-motion';
import { 
    Users, 
    Briefcase, 
    Calendar, 
    TrendingUp,
    Clock,
    UserPlus
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const StatCards = () => {
    const stats = [
        { 
            label: "Total Applicants", 
            value: "1,284", 
            change: "+12.5%", 
            icon: UserPlus, 
            color: "text-blue-500", 
            bg: "bg-blue-500/10" 
        },
        { 
            label: "Active Openings", 
            value: "24", 
            change: "+3 new", 
            icon: Briefcase, 
            color: "text-primary", 
            bg: "bg-primary/10" 
        },
        { 
            label: "Interviews This Week", 
            value: "18", 
            change: "8 today", 
            icon: Calendar, 
            color: "text-amber-500", 
            bg: "bg-amber-500/10" 
        },
        { 
            label: "Avg. Time to Hire", 
            value: "18d", 
            change: "-2 days", 
            icon: Clock, 
            color: "text-emerald-500", 
            bg: "bg-emerald-500/10" 
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5 group hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={`w-14 h-14 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                                    <stat.icon size={24} />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">{stat.label}</p>
                                    <h3 className="text-3xl font-black tracking-tight mt-1">{stat.value}</h3>
                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        <TrendingUp size={12} className={stat.color} />
                                        <span className={`text-[10px] font-black ${stat.color}`}>{stat.change}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};
