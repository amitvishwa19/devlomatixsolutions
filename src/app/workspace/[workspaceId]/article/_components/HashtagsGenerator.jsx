import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Hash, Loader2, Copy, Check, Sparkles } from "lucide-react";
import { supabase } from "@/supabase/client";
import { useToast } from "@/hooks/use-toast";

const platforms = ["all", "instagram", "twitter", "tiktok", "linkedin", "facebook", "youtube"];
const languages = ["english", "spanish", "french", "german", "arabic", "hindi", "portuguese", "chinese", "japanese", "korean"];

export const HashtagsGenerator = () => {
    const [topic, setTopic] = useState("");
    const [platform, setPlatform] = useState("all");
    const [language, setLanguage] = useState("english");
    const [count, setCount] = useState("20");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [copiedAll, setCopiedAll] = useState(false);
    const { toast } = useToast();

    const generate = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setResult(null);
        try {
            const { data, error } = await supabase.functions.invoke("generate-hashtags", {
                body: { topic, platform: platform === "all" ? "" : platform, count, language },
            });
            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            setResult({ hashtags: data.hashtags || [], categories: data.categories || {} });
        } catch (e) {
            toast({ title: "Error", description: e.message || "Failed to generate hashtags", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const copyAll = () => {
        if (!result) return;
        const text = result.hashtags.map((h) => `#${h}`).join(" ");
        navigator.clipboard.writeText(text);
        setCopiedAll(true);
        toast({ title: "Copied!", description: `${result.hashtags.length} hashtags copied` });
        setTimeout(() => setCopiedAll(false), 2000);
    };

    const categoryColors = {
        trending: "bg-primary/20 text-primary border-primary/30",
        niche: "bg-accent/20 text-accent-foreground border-accent/30",
        branded: "bg-secondary text-secondary-foreground border-border",
        general: "bg-muted text-muted-foreground border-border",
    };

    return (
        <div className="pt-6 px-4 pb-12 w-full max-w-4xl mx-auto">
            <header className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-4">
                    <Hash className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">AI Hashtag Generator</span>
                </div>
                <h1 className="font-display text-3xl font-bold mb-2">
                    <span className="text-primary">Hashtag</span>{" "}
                    <span className="text-foreground">Generator</span>
                </h1>
                <p className="text-muted-foreground">Get trending, optimized hashtags for any topic and platform.</p>
            </header>

            <Card className="mb-8 border-border shadow-sm bg-card">
                <CardContent className="pt-6 space-y-4">
                    <Input
                        placeholder="Enter a topic (e.g., fitness tips, vegan recipes, startup life)"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && generate()}
                        className="text-base bg-secondary/50 focus-visible:ring-primary"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Select value={platform} onValueChange={setPlatform}>
                            <SelectTrigger className="bg-secondary/50 border-border/50"><SelectValue placeholder="Platform" /></SelectTrigger>
                            <SelectContent>
                                {platforms.map((p) => (
                                    <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger className="bg-secondary/50 border-border/50"><SelectValue placeholder="Language" /></SelectTrigger>
                            <SelectContent>
                                {languages.map((l) => (
                                    <SelectItem key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={count} onValueChange={setCount}>
                            <SelectTrigger className="bg-secondary/50 border-border/50"><SelectValue placeholder="Count" /></SelectTrigger>
                            <SelectContent>
                                {["10", "15", "20", "25", "30"].map((c) => (
                                    <SelectItem key={c} value={c}>{c} hashtags</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={generate} disabled={loading || !topic.trim()} className="w-full text-base font-semibold h-11 transition-all hover:scale-[1.02]">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                        {loading ? "Generating..." : "Generate Hashtags"}
                    </Button>
                </CardContent>
            </Card>

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">{result.hashtags.length} Hashtags Generated</h2>
                        <Button variant="outline" size="sm" onClick={copyAll}>
                            {copiedAll ? <Check className="mr-1 h-3 w-3 text-green-500" /> : <Copy className="mr-1 h-3 w-3" />}
                            {copiedAll ? "Copied!" : "Copy All"}
                        </Button>
                    </div>

                    {Object.entries(result.categories).map(([cat, tags]) =>
                        tags && tags.length > 0 ? (
                            <Card key={cat} className="border-border shadow-sm bg-card">
                                <CardHeader className="pb-3 border-b border-border/30 mb-3 bg-secondary/20">
                                    <CardTitle className="text-sm font-medium capitalize text-foreground">{cat}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="outline"
                                            className={`cursor-pointer hover:scale-105 transition-transform ${categoryColors[cat] || ""}`}
                                            onClick={() => {
                                                navigator.clipboard.writeText(`#${tag}`);
                                                toast({ title: `Copied #${tag}` });
                                            }}
                                        >
                                            #{tag}
                                        </Badge>
                                    ))}
                                </CardContent>
                            </Card>
                        ) : null
                    )}
                </div>
            )}
        </div>
    );
};
