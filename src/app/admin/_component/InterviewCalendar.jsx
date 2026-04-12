"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useAts } from "../_context/AtsContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TYPE_COLORS = {
  Technical: "bg-primary/80 text-primary-foreground",
  "Portfolio Review": "bg-accent/80 text-accent-foreground",
  "Culture Fit": "bg-success/80 text-success-foreground",
  Behavioral: "bg-warning/80 text-warning-foreground",
  "Final Round": "bg-destructive/80 text-destructive-foreground",
  "Design Challenge": "bg-primary/60 text-primary-foreground",
  default: "bg-muted text-muted-foreground",
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

const InterviewCalendar = () => {
  const { interviews, candidates, scheduleInterview } = useAts();
  const [view, setView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 12)); // April 12, 2026
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [newInterview, setNewInterview] = useState({
    candidateId: "", type: "Technical", duration: "60 min", interviewer: "",
  });

  const navigate = (dir) => {
    const d = new Date(currentDate);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  const formatDate = (d) => d.toISOString().split("T")[0];

  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const getInterviewsForDate = (dateStr) =>
    interviews.filter((i) => i.date === dateStr);

  const getTypeColor = (type) => TYPE_COLORS[type] || TYPE_COLORS.default;

  const handleSchedule = () => {
    if (!newInterview.candidateId || !selectedSlot || !newInterview.interviewer) {
      toast.error("Please fill all required fields");
      return;
    }
    const candidate = candidates.find((c) => c.id === newInterview.candidateId);
    if (!candidate) return;
    scheduleInterview({
      candidateId: candidate.id,
      candidateName: candidate.name,
      candidateAvatar: candidate.avatar,
      jobTitle: candidate.jobTitle,
      type: newInterview.type,
      date: selectedSlot.date,
      time: selectedSlot.time,
      duration: newInterview.duration,
      interviewer: newInterview.interviewer,
    });
    toast.success(`Interview scheduled for ${candidate.name}`);
    setScheduleOpen(false);
    setSelectedSlot(null);
    setNewInterview({ candidateId: "", type: "Technical", duration: "60 min", interviewer: "" });
  };

  const handleSlotClick = (date, time) => {
    setSelectedSlot({ date, time });
    setScheduleOpen(true);
  };

  const headerLabel = () => {
    if (view === "month") return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (view === "week") {
      const start = weekDays[0];
      const end = weekDays[6];
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  };

  const today = formatDate(new Date());

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}><ChevronLeft className="h-4 w-4" /></Button>
          <h2 className="text-lg font-semibold text-foreground min-w-[220px] text-center">{headerLabel()}</h2>
          <Button variant="outline" size="icon" onClick={() => navigate(1)}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(2026, 3, 12))}>Today</Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden">
            {(["month", "week", "day"]).map((v) => (
              <Button key={v} variant={view === v ? "default" : "ghost"} size="sm" className="rounded-none text-xs capitalize" onClick={() => setView(v)}>
                {v}
              </Button>
            ))}
          </div>
          <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Schedule</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Schedule Interview</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Candidate</Label>
                  <Select value={newInterview.candidateId} onValueChange={(v) => setNewInterview({ ...newInterview, candidateId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
                    <SelectContent>
                      {candidates.filter((c) => c.stage !== "rejected" && c.stage !== "hired").map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name} — {c.jobTitle}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={selectedSlot?.date || ""} onChange={(e) => setSelectedSlot({ ...selectedSlot, date: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input value={selectedSlot?.time || ""} onChange={(e) => setSelectedSlot({ ...selectedSlot, time: e.target.value })} placeholder="10:00 AM" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={newInterview.type} onValueChange={(v) => setNewInterview({ ...newInterview, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Technical", "Behavioral", "Culture Fit", "Portfolio Review", "Final Round", "Design Challenge"].map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select value={newInterview.duration} onValueChange={(v) => setNewInterview({ ...newInterview, duration: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["30 min", "45 min", "60 min", "90 min"].map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Interviewer</Label>
                  <Input value={newInterview.interviewer} onChange={(e) => setNewInterview({ ...newInterview, interviewer: e.target.value })} placeholder="e.g. Rajesh Kumar" />
                </div>
                <Button onClick={handleSchedule} className="w-full">Schedule Interview</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(TYPE_COLORS).filter(([k]) => k !== "default").map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={cn("h-2.5 w-2.5 rounded-sm", color.split(" ")[0])} />
            <span className="text-xs text-muted-foreground">{type}</span>
          </div>
        ))}
      </div>

      {/* Month View */}
      {view === "month" && (
        <Card>
          <CardContent className="p-2 sm:p-4">
            <div className="grid grid-cols-7 gap-px">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
              ))}
              {monthDays.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} className="min-h-[80px] bg-muted/30 rounded" />;
                const dateStr = formatDate(day);
                const dayInterviews = getInterviewsForDate(dateStr);
                const isToday = dateStr === today;
                return (
                  <div
                    key={dateStr}
                    className={cn(
                      "min-h-[80px] rounded border p-1 cursor-pointer transition-colors hover:bg-muted/50",
                      isToday && "border-primary bg-primary/5"
                    )}
                    onClick={() => handleSlotClick(dateStr, "10:00 AM")}
                  >
                    <div className={cn("text-xs font-medium mb-1", isToday ? "text-primary" : "text-foreground")}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-0.5">
                      {dayInterviews.slice(0, 2).map((intv) => (
                        <div key={intv.id} className={cn("text-[10px] rounded px-1 py-0.5 truncate", getTypeColor(intv.type))}>
                          {intv.time} {intv.candidateName.split(" ")[0]}
                        </div>
                      ))}
                      {dayInterviews.length > 2 && (
                        <div className="text-[10px] text-muted-foreground px-1">+{dayInterviews.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week View */}
      {view === "week" && (
        <Card>
          <CardContent className="p-2 sm:p-4 overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-8 gap-px">
                <div className="p-2" />
                {weekDays.map((d) => {
                  const dateStr = formatDate(d);
                  const isToday = dateStr === today;
                  return (
                    <div key={dateStr} className={cn("p-2 text-center border-b", isToday && "bg-primary/5")}>
                      <div className="text-xs text-muted-foreground">{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
                      <div className={cn("text-sm font-semibold", isToday ? "text-primary" : "text-foreground")}>{d.getDate()}</div>
                    </div>
                  );
                })}
              </div>
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-8 gap-px border-b">
                  <div className="p-1 text-[11px] text-muted-foreground text-right pr-2">
                    {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
                  </div>
                  {weekDays.map((d) => {
                    const dateStr = formatDate(d);
                    const timeStr = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`;
                    const dayInterviews = getInterviewsForDate(dateStr).filter((intv) => {
                      const h = parseInt(intv.time);
                      const isPM = intv.time.includes("PM");
                      const intHour = isPM && h !== 12 ? h + 12 : !isPM && h === 12 ? 0 : h;
                      return intHour === hour;
                    });
                    return (
                      <div
                        key={`${dateStr}-${hour}`}
                        className="min-h-[50px] p-0.5 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => handleSlotClick(dateStr, timeStr)}
                      >
                        {dayInterviews.map((intv) => (
                          <div key={intv.id} className={cn("text-[10px] rounded px-1.5 py-1 mb-0.5", getTypeColor(intv.type))}>
                            <div className="font-medium truncate">{intv.candidateName}</div>
                            <div className="opacity-80">{intv.type}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Day View */}
      {view === "day" && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              {HOURS.map((hour) => {
                const dateStr = formatDate(currentDate);
                const timeStr = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`;
                const dayInterviews = getInterviewsForDate(dateStr).filter((intv) => {
                  const h = parseInt(intv.time);
                  const isPM = intv.time.includes("PM");
                  const intHour = isPM && h !== 12 ? h + 12 : !isPM && h === 12 ? 0 : h;
                  return intHour === hour;
                });
                return (
                  <div key={hour} className="flex gap-4 border-b py-2 cursor-pointer hover:bg-muted/30 transition-colors min-h-[60px]"
                    onClick={() => handleSlotClick(dateStr, timeStr)}>
                    <div className="w-16 text-sm text-muted-foreground text-right flex-shrink-0">
                      {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
                    </div>
                    <div className="flex-1 space-y-1">
                      {dayInterviews.map((intv) => (
                        <div key={intv.id} className={cn("rounded-lg p-3 flex items-center gap-3", getTypeColor(intv.type))}>
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background/20 text-xs font-medium">
                            {intv.candidateAvatar}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{intv.candidateName}</div>
                            <div className="text-xs opacity-80">{intv.type} • {intv.jobTitle}</div>
                          </div>
                          <div className="text-right text-xs">
                            <div>{intv.time}</div>
                            <div className="opacity-80">{intv.duration}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InterviewCalendar;
