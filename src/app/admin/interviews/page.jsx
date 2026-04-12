"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, Video, CheckCircle, List, CalendarDays } from "lucide-react";
import { useAts } from "@/app/admin/_context/AtsContext";
import StarRating from "@/app/admin/_component/StarRating";
import InterviewCalendar from "@/app/admin/_component/InterviewCalendar";

const statusStyles = {
  scheduled: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function InterviewsPage() {
  const { interviews } = useAts();
  const scheduled = interviews.filter((i) => i.status === "scheduled");
  const completed = interviews.filter((i) => i.status === "completed");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Interviews</h1>
        <p className="text-muted-foreground">{scheduled.length} upcoming • {completed.length} completed</p>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar" className="gap-2"><CalendarDays className="h-4 w-4" /> Calendar</TabsTrigger>
          <TabsTrigger value="list" className="gap-2"><List className="h-4 w-4" /> List</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <InterviewCalendar />
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          {/* Upcoming */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Upcoming Interviews</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {scheduled.map((interview) => (
                <Card key={interview.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          {interview.candidateAvatar}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{interview.candidateName}</div>
                          <div className="text-sm text-muted-foreground">{interview.jobTitle}</div>
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[interview.status]}`}>
                        {interview.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {interview.date}</div>
                      <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {interview.time} ({interview.duration})</div>
                      <div className="flex items-center gap-1.5"><Video className="h-3.5 w-3.5" /> {interview.type}</div>
                      <div className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {interview.interviewer}</div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">Reschedule</Button>
                      <Button size="sm" className="flex-1">Join Meeting</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Completed */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Completed Interviews</h2>
            <div className="space-y-3">
              {completed.map((interview) => (
                <Card key={interview.id}>
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-sm font-medium text-success">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{interview.candidateName} — {interview.type}</div>
                        <div className="text-sm text-muted-foreground">{interview.jobTitle} • {interview.date} at {interview.time}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {interview.rating && <StarRating rating={interview.rating} />}
                      <div className="max-w-xs text-xs text-muted-foreground truncate">{interview.feedback}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
