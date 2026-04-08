import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Loader2, Plus, X, Clock, Hash } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/supabase/client";

interface CalendarEntry {
  day: number;
  date: string;
  platform: string;
  content_type: string;
  topic: string;
  idea: string;
  best_time: string;
  hashtags: string[];
  goal: string;
}

interface CalendarResult {
  calendar: CalendarEntry[];
  strategy_notes: string;
  posting_frequency: Record<string, number>;
}

const platformColors: Record<string, string> = {
  linkedin: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  instagram: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  twitter: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  facebook: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  tiktok: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const Calendar = () => {
  const [topics, setTopics] = useState<string[]>([""]);
  const [platforms, setPlatforms] = useState("linkedin,instagram,twitter");
  const [duration, setDuration] = useState("week");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalendarResult | null>(null);

  const addTopic = () => setTopics([...topics, ""]);
  const removeTopic = (i: number) => setTopics(topics.filter((_, idx) => idx !== i));
  const updateTopic = (i: number, val: string) => {
    const copy = [...topics];
    copy[i] = val;
    setTopics(copy);
  };

  const generate = async () => {
    const validTopics = topics.filter((t) => t.trim());
    if (validTopics.length === 0) {
      toast.error("Add at least one topic");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("content-calendar", {
        body: { topics: validTopics, platforms, duration, tone },
      });
      if (error) throw error;
      if (data?.calendar) {
        setResult(data);
      } else if (data?.raw_calendar) {
        toast.info("Calendar generated but couldn't be structured. Showing raw output.");
        setResult(null);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate calendar");
    } finally {
      setLoading(false);
    }
  };

  const grouped = result?.calendar?.reduce<Record<string, CalendarEntry[]>>((acc, entry) => {
    const key = entry.date || `Day ${entry.day}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {}) || {};

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Content Calendar</h1>
        <p className="text-muted-foreground">Generate a structured content plan for your social media</p>
      </div>

      <Card className="mb-8 border-border/50 bg-card/60">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label className="mb-2 block">Topics</Label>
            {topics.map((t, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input
                  value={t}
                  onChange={(e) => updateTopic(i, e.target.value)}
                  placeholder={`Topic ${i + 1}`}
                />
                {topics.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeTopic(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addTopic}>
              <Plus className="h-3 w-3 mr-1" /> Add Topic
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">1 Week</SelectItem>
                  <SelectItem value="2weeks">2 Weeks</SelectItem>
                  <SelectItem value="month">1 Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Platforms</Label>
              <Input value={platforms} onChange={(e) => setPlatforms(e.target.value)} placeholder="linkedin,instagram,twitter" />
            </div>
          </div>

          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><CalendarDays className="mr-2 h-4 w-4" /> Generate Calendar</>}
          </Button>
        </CardContent>
      </Card>

      {result?.strategy_notes && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">{result.strategy_notes}</p>
          </CardContent>
        </Card>
      )}

      {Object.keys(grouped).length > 0 && (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, entries]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">{date}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {entries.map((entry, i) => (
                  <Card key={i} className="border-border/30 bg-card/60">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge className={platformColors[entry.platform] || "bg-muted text-muted-foreground"}>
                          {entry.platform}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{entry.content_type}</span>
                      </div>
                      <CardTitle className="text-sm">{entry.topic}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2">
                      <p className="text-muted-foreground">{entry.idea}</p>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" /> {entry.best_time}
                        </span>
                        <Badge variant="outline" className="text-[10px]">{entry.goal}</Badge>
                      </div>
                      {entry.hashtags?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {entry.hashtags.slice(0, 4).map((h) => (
                            <span key={h} className="text-[10px] text-primary/70">#{h}</span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Calendar;