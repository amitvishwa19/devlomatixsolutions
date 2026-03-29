'use client';

import React, { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addMonths, 
  subMonths, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  parseISO,
  isValid
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const CalendarView = ({ posts, workspaceId, onOpenPost }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getPostsForDay = (day) => {
    return posts.filter(post => {
      const postDate = post.scheduledAt || post.publishedAt || post.createdAt;
      if (!postDate) return false;
      const date = typeof postDate === 'string' ? parseISO(postDate) : postDate;
      return isValid(date) && isSameDay(date, day);
    });
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'PUBLISHED': return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
      case 'SCHEDULED': return <Clock className="w-3 h-3 text-blue-500" />;
      case 'FAILED': return <AlertCircle className="w-3 h-3 text-rose-500" />;
      default: return <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />;
    }
  };

  return (
    <div className="bg-card/40 backdrop-blur-xl border border-border/40 rounded-xl overflow-hidden shadow-soft animate-fade-in">
      {/* Calendar Header */}
      <div className="p-6 flex items-center justify-between border-b border-border/40 bg-muted/5">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg text-foreground uppercase tracking-tight">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <p className="text-[10px] font-bold text-muted-foreground opacity-60">
              {posts.length} Content Items Tracked
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday} className="h-8 rounded-lg font-bold text-[10px] px-4">
            Today
          </Button>
          <div className="flex items-center bg-background rounded-lg border border-border/60 p-0.5">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-7 w-7 rounded-md hover:bg-muted">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7 rounded-md hover:bg-muted">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-border/20">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-3 text-center text-[10px] text-muted-foreground uppercase tracking-widest bg-muted/2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 min-h-[600px]">
        {days.map((day, idx) => {
          const dayPosts = getPostsForDay(day);
          const isOutside = !isSameMonth(day, currentDate);
          const isTodayDay = isToday(day);

          return (
            <div 
              key={day.toString()} 
              className={cn(
                "min-h-[120px] p-2 border-r border-b border-border/10 transition-colors hover:bg-muted/5 group",
                isOutside && "bg-muted/2 opacity-30",
                idx % 7 === 6 && "border-r-0"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "text-[10px] w-6 h-6 flex items-center justify-center rounded-md",
                  isTodayDay ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" : "text-muted-foreground"
                )}>
                  {format(day, 'd')}
                </span>
                {dayPosts.length > 0 && (
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-bold text-[9px] h-4 px-1.5 rounded-full">
                    {dayPosts.length}
                  </Badge>
                )}
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[85px] scrollbar-hide">
                {dayPosts.map(post => (
                  <TooltipProvider key={post.id}>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={() => onOpenPost(post)}
                          className={cn(
                            "w-full text-left p-1.5 rounded-md border text-[9px] font-bold truncate transition-all active:scale-95 group/item flex items-center gap-1.5 shadow-sm",
                            post.status === 'PUBLISHED' ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10" :
                            post.status === 'SCHEDULED' ? "bg-blue-500/5 border-blue-500/10 text-blue-600 hover:bg-blue-500/10" :
                            post.status === 'FAILED' ? "bg-rose-500/5 border-rose-500/10 text-rose-600 hover:bg-rose-500/10" :
                            "bg-muted/5 border-border/40 text-muted-foreground hover:bg-muted/10"
                          )}
                        >
                          <StatusIcon status={post.status} />
                          <span className="truncate">{post.title || "Untitled Post"}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-popover border-border animate-in zoom-in-95 p-3 rounded-xl shadow-xl w-64">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge className={cn(
                              "text-[8px] tracking-widest h-4 border-none",
                              post.status === 'PUBLISHED' ? "bg-emerald-500 text-white" :
                              post.status === 'SCHEDULED' ? "bg-blue-500 text-white" :
                              "bg-muted text-muted-foreground"
                            )}>
                              {post.status}
                            </Badge>
                            <span className="text-[8px] font-bold text-muted-foreground">
                              {format(parseISO(post.scheduledAt || post.createdAt), 'hh:mm a')}
                            </span>
                          </div>
                          <p className="text-xs line-clamp-2 leading-tight">{post.title || "Untitled Post"}</p>
                          <div className="flex flex-wrap gap-1">
                            {post.platforms?.map(p => (
                              <span key={p} className="text-[8px] text-primary uppercase bg-primary/5 px-1 rounded">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
