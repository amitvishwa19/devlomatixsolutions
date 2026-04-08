import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateContent, GeneratedContent } from "@/social-hub/lib/gemini";
import { useContentHistory, HistoryEntry } from "@/social-hub/hooks/use-content-history";
import { ContentHistory } from "@/social-hub/components/ContentHistory";
import { supabase } from "@/supabase/client";
import { ExportContent } from "@/social-hub/components/ExportContent";

import { 
  Twitter, Instagram, Linkedin, Facebook, Sparkles, Copy, Check,
  Loader2, MessageSquare, Layers, Image, Film, Globe, Hash
} from "lucide-react";

const platforms = [
  { id: "twitter", name: "Twitter/X", icon: Twitter, color: "text-sky-400" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-400" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-400" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-500" },
  { id: "tiktok", name: "TikTok", icon: Film, color: "text-cyan-400" },
];

const tones = [
  { id: "professional", name: "Professional", emoji: "💼" },
  { id: "casual", name: "Casual", emoji: "😊" },
  { id: "humorous", name: "Humorous", emoji: "😂" },
  { id: "inspirational", name: "Inspirational", emoji: "✨" },
  { id: "educational", name: "Educational", emoji: "📚" },
];

const contentTypes = [
  { id: "post", name: "Single Post", icon: MessageSquare },
  { id: "thread", name: "Thread", icon: Layers },
  { id: "caption", name: "Caption", icon: Image },
  { id: "story", name: "Story", icon: Film },
];

const languagesList = [
  { id: "english", name: "English", flag: "🇺🇸" },
  { id: "spanish", name: "Español", flag: "🇪🇸" },
  { id: "french", name: "Français", flag: "🇫🇷" },
  { id: "german", name: "Deutsch", flag: "🇩🇪" },
  { id: "portuguese", name: "Português", flag: "🇧🇷" },
  { id: "italian", name: "Italiano", flag: "🇮🇹" },
  { id: "japanese", name: "日本語", flag: "🇯🇵" },
  { id: "korean", name: "한국어", flag: "🇰🇷" },
  { id: "chinese", name: "中文", flag: "🇨🇳" },
  { id: "arabic", name: "العربية", flag: "🇸🇦" },
  { id: "hindi", name: "हिन्दी", flag: "🇮🇳" },
];

interface PlatformContent {
  platform: string;
  data: GeneratedContent;
  imageUrl?: string;
}

export function ContentGenerator() {
  const [topic, setTopic] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["twitter"]);
  const [tone, setTone] = useState("casual");
  const [contentType, setContentType] = useState("post");
  const [language, setLanguage] = useState("english");
  const [wordCount, setWordCount] = useState<string>("");
  const [generatedContents, setGeneratedContents] = useState<PlatformContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();
  const { history, addEntry, removeEntry, clearHistory } = useContentHistory();

  // Load template from sessionStorage if navigated from Templates page
  useEffect(() => {
    const raw = sessionStorage.getItem("template");
    if (raw) {
      try {
        const tmpl = JSON.parse(raw);
        if (tmpl.topic) setTopic(tmpl.topic);
        if (tmpl.platforms) setSelectedPlatforms(tmpl.platforms);
        if (tmpl.tone) setTone(tmpl.tone);
        if (tmpl.contentType) setContentType(tmpl.contentType);
      } catch { /* ignore */ }
      sessionStorage.removeItem("template");
    }
  }, []);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter((p) => p !== id) : prev
        : [...prev, id]
    );
  };

  const generateImage = async (topicText: string, platformId: string): Promise<string | undefined> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { topic: topicText, platform: platformId },
      });
      if (error) {
        console.error("Image generation error:", error);
        return undefined;
      }
      return data?.imageUrl;
    } catch (e) {
      console.error("Image generation failed:", e);
      return undefined;
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: "Please enter a topic", description: "We need something to write about!", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setGeneratedContents([]);

    try {
      const parsedWordCount = wordCount ? parseInt(wordCount, 10) : undefined;
      const results: PlatformContent[] = [];

      for (const platformId of selectedPlatforms) {
        const [data, imageUrl] = await Promise.all([
          generateContent({
            topic,
            platform: platformId,
            tone,
            contentType,
            language,
            wordCount: parsedWordCount,
          }),
          generateImage(topic, platformId),
        ]);
        const result: PlatformContent = { platform: platformId, data, imageUrl };
        results.push(result);
        setGeneratedContents([...results]);
      }

      for (const r of results) {
        addEntry({ topic, platform: r.platform, tone, contentType, language, content: r.data.content });
      }

      toast({ title: "Content generated!", description: `Generated for ${results.length} platform${results.length > 1 ? "s" : ""}.` });
    } catch (error) {
      console.error("Generation error:", error);
      toast({ title: "Generation failed", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (item: PlatformContent) => {
    const fullText = `${item.data.title}\n\n${item.data.description}\n\n${item.data.content}\n\n${item.data.hashtags.map(h => `#${h}`).join(' ')}`;
    await navigator.clipboard.writeText(fullText);
    setCopiedPlatform(item.platform);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const handleReuse = (entry: HistoryEntry) => {
    setTopic(entry.topic);
    setSelectedPlatforms([entry.platform]);
    setTone(entry.tone);
    setContentType(entry.contentType);
    setLanguage(entry.language);
    setGeneratedContents([{
      platform: entry.platform,
      data: { title: entry.topic, description: "", content: entry.content, hashtags: [] },
    }]);
    setShowHistory(false);
    toast({ title: "Settings restored from history" });
  };

  const getPlatformInfo = (id: string) => platforms.find((p) => p.id === id);

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <ExportContent contents={generatedContents} topic={topic} />
        <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)} className="border-border/50">
          <Globe className="w-4 h-4 mr-2" />
          {showHistory ? "Back to Generator" : `History (${history.length})`}
        </Button>
      </div>

      {showHistory ? (
        <ContentHistory history={history} onRemove={removeEntry} onClear={clearHistory} onReuse={handleReuse} />
      ) : (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="glass-card p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">What's your topic or idea?</label>
                  <Textarea
                    placeholder="e.g., Launch of our new eco-friendly product line..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="min-h-[120px] bg-secondary/50 border-border/50 focus:border-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-3">
                    Choose Platforms <span className="text-xs text-muted-foreground/70">(select multiple)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {platforms.map((p) => {
                      const isSelected = selectedPlatforms.includes(p.id);
                      return (
                        <button key={p.id} onClick={() => togglePlatform(p.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border hover:bg-secondary/50"
                          }`}>
                          <p.icon className={`w-4 h-4 ${isSelected ? p.color : ""}`} />
                          <span className="text-sm font-medium">{p.name}</span>
                          {isSelected && <Check className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-3">Content Type</label>
                  <div className="flex flex-wrap gap-2">
                    {contentTypes.map((c) => (
                      <button key={c.id} onClick={() => setContentType(c.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                          contentType === c.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border hover:bg-secondary/50"
                        }`}>
                        <c.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-3">Select Tone</label>
                  <div className="flex flex-wrap gap-2">
                    {tones.map((t) => (
                      <button key={t.id} onClick={() => setTone(t.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                          tone === t.id
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border hover:bg-secondary/50"
                        }`}>
                        <span>{t.emoji}</span>
                        <span className="text-sm font-medium">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Language
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {languagesList.map((l) => (
                      <button key={l.id} onClick={() => setLanguage(l.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                          language === l.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border hover:bg-secondary/50"
                        }`}>
                        <span>{l.flag}</span>
                        <span className="text-xs font-medium">{l.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Hash className="w-4 h-4" /> Word Count <span className="text-xs text-muted-foreground/70">(optional)</span>
                  </label>
                  <Input
                    type="number"
                    min={10}
                    max={10000}
                    placeholder="e.g., 500 (leave empty for default)"
                    value={wordCount}
                    onChange={(e) => setWordCount(e.target.value)}
                    className="bg-secondary/50 border-border/50 focus:border-primary"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !topic.trim()}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 transition-opacity text-primary-foreground"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating for {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? "s" : ""}...</>
                  ) : (
                    <><Sparkles className="w-5 h-5 mr-2" /> Generate for {selectedPlatforms.length} Platform{selectedPlatforms.length > 1 ? "s" : ""}</>
                  )}
                </Button>
              </Card>
            </div>

            {/* Output Section */}
            <div className="space-y-4">
              {isLoading && generatedContents.length === 0 ? (
                <Card className="glass-card p-6 min-h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-primary to-accent animate-pulse" />
                    <p className="text-muted-foreground">Crafting your content...</p>
                  </div>
                </Card>
              ) : generatedContents.length > 0 ? (
                generatedContents.map(({ platform: pId, data, imageUrl }) => {
                  const info = getPlatformInfo(pId);
                  const wordCountDisplay = data.content.split(/\s+/).filter(Boolean).length;
                  return (
                    <Card key={pId} className="glass-card p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {info && <info.icon className={`w-5 h-5 ${info.color}`} />}
                          <h3 className="font-display text-lg font-semibold text-foreground">{info?.name}</h3>
                          <span className="text-xs text-muted-foreground">({wordCountDisplay} words)</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleCopy({ platform: pId, data, imageUrl })} className="text-muted-foreground hover:text-foreground">
                          {copiedPlatform === pId ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>

                      {imageUrl && (
                        <div className="rounded-lg overflow-hidden border border-border/30">
                          <img src={imageUrl} alt={data.title} className="w-full h-48 object-cover" />
                        </div>
                      )}

                      <div>
                        <h4 className="text-xl font-bold text-foreground">{data.title}</h4>
                      </div>

                      {data.description && (
                        <p className="text-sm text-muted-foreground italic">{data.description}</p>
                      )}

                      <pre className="whitespace-pre-wrap text-foreground bg-secondary/30 p-4 rounded-lg font-sans text-sm leading-relaxed max-h-[500px] overflow-y-auto">
                        {data.content}
                      </pre>

                      {data.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {data.hashtags.map((tag, i) => (
                            <span key={i} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })
              ) : (
                <Card className="glass-card p-6 min-h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-3 max-w-xs">
                    <div className="w-16 h-16 mx-auto rounded-full bg-secondary/50 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Your AI-generated content will appear here</p>
                  </div>
                </Card>
              )}
              {isLoading && generatedContents.length > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating next platform...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}