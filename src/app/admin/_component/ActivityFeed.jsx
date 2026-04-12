"use client";

import { ArrowRightLeft, Calendar, Mail, MessageSquare, Star, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAts } from "../_context/AtsContext";
import { activities } from "../_utils/mockData";
import { cn } from "@/lib/utils";
import Link from "next/link";

const ICONS = {
  stage_change: ArrowRightLeft,
  note: MessageSquare,
  email: Mail,
  interview: Calendar,
  rating: Star,
};

const COLORS = {
  stage_change: "bg-primary/10 text-primary border-primary/20",
  note: "bg-warning/10 text-warning border-warning/20",
  email: "bg-accent/10 text-accent-foreground border-accent/20",
  interview: "bg-success/10 text-success border-success/20",
  rating: "bg-warning/10 text-warning border-warning/20",
};

const ActivityFeed = () => {
  const { candidates } = useAts();

  const feed = activities
    .map((a) => {
      const c = candidates.find((c) => c.id === a.candidateId);
      return { ...a, candidateName: c?.name || "Unknown", candidateAvatar: c?.avatar || "??" };
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " at " +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Activity</CardTitle>
        <span className="text-xs text-muted-foreground">{feed.length} events</span>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4">
            {feed.slice(0, 10).map((item) => {
              const Icon = ICONS[item.type] || Clock;
              return (
                <div key={item.id} className="relative flex gap-3 pl-9">
                  <div className={cn("absolute left-1.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border", COLORS[item.type])}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <Link href={`/admin/candidates/${item.candidateId}`} className="font-medium hover:underline">{item.candidateName}</Link>
                      {" "}<span className="text-muted-foreground">{item.message}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground">{formatTime(item.timestamp)}</span>
                      <span className="text-[11px] text-muted-foreground">• {item.user}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
