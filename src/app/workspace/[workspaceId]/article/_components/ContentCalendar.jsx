import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Loader2, Plus, X, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/supabase/client";

const platformColors = {
    linkedin: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    instagram: "bg-pink-500/10 text-pink-500 border-pink-500/30",
    twitter: "bg-sky-500/10 text-sky-500 border-sky-500/30",
    facebook: "bg-indigo-500/10 text-indigo-500 border-indigo-500/30",
    tiktok: "bg-purple-500/10 text-purple-500 border-purple-500/30",
};

export const ContentCalendar = () => {
    const [topics, setTopics] = useState([""]);
    const [platforms, setPlatforms] = useState("linkedin,instagram,twitter");
    const [duration, setDuration] = useState("week");
    const [tone, setTone] = useState("professional");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const { toast } = useToast();

    const addTopic = () => setTopics([...topics, ""]);
    const removeTopic = (i) => setTopics(topics.filter((_, idx) => idx !== i));
    const updateTopic = (i, val) => {
        const copy = [...topics];
        copy[i] = val;
        setTopics(copy);
    };

    const generate = async () => {
        const validTopics = topics.filter((t) => t.trim());
        if (validTopics.length === 0) {
            toast({ title: "Validation Error", description: "Add at least one topic", variant: "destructive" });
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
                toast({ title: "Partial Data", description: "Calendar generated but couldn't be structured. Showing raw output." });
                setResult(null);
            }
        } catch (e) {
            toast({ title: "Error", description: e.message || "Failed to generate calendar", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const grouped = result?.calendar?.reduce((acc, entry) => {
        const key = entry.date || `Day ${entry.day}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(entry);
        return acc;
    }, {}) || {};

    return (
        <div className="pt-6 px-4 pb-12 max-w-6xl mx-auto">
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-4">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">AI Content Planner</span>
                </div>
                <h1 className="font-display text-3xl font-bold mb-2">
                    <span className="text-primary">Content</span>{" "}
                    <span className="text-foreground">Calendar</span>
                </h1>
                <p className="text-muted-foreground">Generate a structured content plan for your social media.</p>
            </div>

            <Card className="mb-8 border-border shadow-sm bg-card">
                <CardContent className="pt-6 space-y-6">
                    <div>
                        <Label className="mb-3 block font-semibold text-sm">Key Topics</Label>
                        <div className="space-y-2">
                            {topics.map((t, i) => (
                                <div key={i} className="flex gap-2 relative group">
                                    <Input
                                        value={t}
                                        onChange={(e) => updateTopic(i, e.target.value)}
                                        placeholder={`Topic ${i + 1} (e.g. AI in marketing)`}
                                        className="bg-secondary/50 focus-visible:ring-primary"
                                    />
                                    {topics.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeTopic(i)}
                                            className="absolute right-0 top-0 opacity-50 hover:opacity-100 hover:text-destructive hover:bg-transparent"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={addTopic} className="mt-3 bg-secondary/30">
                            <Plus className="h-3 w-3 mr-1" /> Add Another Topic
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                        <div className="space-y-2">
                            <Label className="font-semibold text-sm">Duration</Label>
                            <Select value={duration} onValueChange={setDuration}>
                                <SelectTrigger className="bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="week">1 Week Strategy</SelectItem>
                                    <SelectItem value="2weeks">2 Weeks Strategy</SelectItem>
                                    <SelectItem value="month">1 Month Strategy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-sm">Voice Tone</Label>
                            <Select value={tone} onValueChange={setTone}>
                                <SelectTrigger className="bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="professional">Professional & Polished</SelectItem>
                                    <SelectItem value="casual">Casual & Relatable</SelectItem>
                                    <SelectItem value="humorous">Humorous & Witty</SelectItem>
                                    <SelectItem value="educational">Educational & Insightful</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-sm">Target Platforms (comma-separated)</Label>
                            <Input
                                value={platforms}
                                onChange={(e) => setPlatforms(e.target.value)}
                                placeholder="linkedin, instagram, twitter"
                                className="bg-secondary/50"
                            />
                        </div>
                    </div>

                    <Button onClick={generate} disabled={loading} className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02] mt-4">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarDays className="mr-2 h-4 w-4" />}
                        {loading ? "Generating Plan Phase..." : "Generate Custom Calendar"}
                    </Button>
                </CardContent>
            </Card>

            {result?.strategy_notes && (
                <Card className="mb-6 border-primary/20 bg-primary/5 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-primary flex items-center"><Sparkles className="w-4 h-4 mr-2" /> Strategy Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-foreground/80 leading-relaxed">{result.strategy_notes}</p>
                    </CardContent>
                </Card>
            )}

            {Object.keys(grouped).length > 0 && (
                <div className="space-y-8 mt-6">
                    {Object.entries(grouped).map(([date, entries]) => (
                        <div key={date} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-base font-bold text-foreground mb-4 border-b border-border/30 pb-2">{date}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {entries.map((entry, i) => (
                                    <Card key={i} className="border-border shadow-sm bg-card hover:bg-secondary/10 transition-colors">
                                        <CardHeader className="pb-3 border-b border-border/30 mb-3 bg-secondary/10">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline" className={platformColors[entry.platform?.toLowerCase()] || "bg-muted text-muted-foreground"}>
                                                    {entry.platform}
                                                </Badge>
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{entry.content_type}</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <CardTitle className="text-base text-foreground leading-tight">{entry.topic}</CardTitle>
                                            <p className="text-sm text-muted-foreground line-clamp-3">{entry.idea}</p>
                                            
                                            <div className="flex items-center gap-3 pt-2">
                                                <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                                                    <Clock className="h-3 w-3" /> {entry.best_time}
                                                </span>
                                                <Badge variant="outline" className="text-[10px] text-primary/80 border-primary/20">{entry.goal}</Badge>
                                            </div>
                                            
                                            {entry.hashtags?.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 pt-2">
                                                    {entry.hashtags.slice(0, 4).map((h) => (
                                                        <span key={h} className="text-[10px] bg-primary/5 text-primary px-1.5 py-0.5 rounded-sm font-medium">#{h}</span>
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
