import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function ContentGenerator() {
    const [topic, setTopic] = useState("");
    const [selectedPlatforms, setSelectedPlatforms] = useState(["twitter"]);
    const [tone, setTone] = useState("casual");
    const [contentType, setContentType] = useState("post");
    const [language, setLanguage] = useState("english");
    const [wordCount, setWordCount] = useState("");
    const [generatedContents, setGeneratedContents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedPlatform, setCopiedPlatform] = useState(null);
    const { toast } = useToast();

    const togglePlatform = (id) => {
        setSelectedPlatforms((prev) =>
            prev.includes(id) ? (prev.length > 1 ? prev.filter((p) => p !== id) : prev) : [...prev, id]
        );
    };

    const loadGeneratedImage = async (topicText, platformId) => {
        try {
            const { data, error } = await supabase.functions.invoke('generate-image', {
                body: { topic: topicText, platform: platformId },
            });
            return error ? undefined : data?.imageUrl;
        } catch {
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
            const results = [];

            for (const platformId of selectedPlatforms) {
                const [data, imageUrl] = await Promise.all([
                    generateContent({ topic, platform: platformId, tone, contentType, language, wordCount: parsedWordCount }),
                    loadGeneratedImage(topic, platformId),
                ]);
                results.push({ platform: platformId, data, imageUrl });
                setGeneratedContents([...results]); // Stream them as they finish
            }
            toast({ title: "Content generated!", description: `Generated for ${results.length} platform${results.length > 1 ? "s" : ""}.` });
        } catch (error) {
            toast({ title: "Generation failed", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async (item) => {
        const fullText = `${item.data.title}\n\n${item.data.description}\n\n${item.data.content}\n\n${item.data.hashtags.map(h => '#' + h).join(' ')}`;
        await navigator.clipboard.writeText(fullText);
        setCopiedPlatform(item.platform);
        toast({ title: "Copied to clipboard!" });
        setTimeout(() => setCopiedPlatform(null), 2000);
    };

    const getPlatformInfo = (id) => platformOptions.find((p) => p.id === id);

    return (
        <div className="space-y-6 pt-6 px-4 pb-12 w-full max-w-7xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="font-display text-4xl font-bold mb-3"><span className="text-primary">Content Generator</span></h1>
                <p className="text-muted-foreground">Create scroll-stopping content for any platform. Just describe your idea and let AI craft the perfect post.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Input Form Setup */}
                <div className="space-y-6">
                    <Card className="p-6 space-y-6 bg-card border border-border shadow-sm">
                        <div>
                            <label className="block text-sm font-medium mb-2">What's your topic or idea?</label>
                            <Textarea
                                placeholder="e.g., Launch of our new eco-friendly product line..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="min-h-[120px] bg-secondary/50 focus:border-primary resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3">Choose Platforms</label>
                            <div className="flex flex-wrap gap-2">
                                {platformOptions.map((p) => {
                                    const isSelected = selectedPlatforms.includes(p.id);
                                    return (
                                        <button key={p.id} onClick={() => togglePlatform(p.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isSelected ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-secondary/30 text-muted-foreground"
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
                            <label className="block text-sm font-medium mb-3">Content Type</label>
                            <div className="flex flex-wrap gap-2">
                                {contentTypeOptions.map((c) => (
                                    <button key={c.id} onClick={() => setContentType(c.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${contentType === c.id ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-secondary/30 text-muted-foreground"
                                            }`}>
                                        <c.icon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{c.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3">Tone</label>
                            <div className="flex flex-wrap gap-2">
                                {toneOptions.map((t) => (
                                    <button key={t.id} onClick={() => setTone(t.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${tone === t.id ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-secondary/30 text-muted-foreground"
                                            }`}>
                                        <span>{t.emoji}</span>
                                        <span className="text-sm font-medium">{t.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                                    <Globe className="w-4 h-4" /> Language
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {languageOptions.map((l) => (
                                        <button key={l.id} onClick={() => setLanguage(l.id)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${language === l.id ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-secondary/30 text-muted-foreground"
                                                }`}>
                                            <span>{l.flag}</span>
                                            <span className="text-xs font-medium">{l.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                    <Hash className="w-4 h-4" /> Word Count (Optional)
                                </label>
                                <Input
                                    type="number" min={10} max={10000} placeholder="e.g. 200"
                                    value={wordCount} onChange={(e) => setWordCount(e.target.value)}
                                    className="bg-secondary/50 h-9"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleGenerate}
                            disabled={isLoading || !topic.trim()}
                            className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02]"
                        >
                            {isLoading ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</>
                            ) : (
                                <><Sparkles className="w-5 h-5 mr-2" /> Generate Now</>
                            )}
                        </Button>
                    </Card>
                </div>

                {/* Output Section Renderer */}
                <div className="space-y-4">
                    {isLoading && generatedContents.length === 0 ? (
                        <Card className="p-6 min-h-[400px] flex flex-col items-center justify-center bg-card">
                            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 animate-pulse flex items-center justify-center mb-4">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                            <p className="text-muted-foreground font-medium">Crafting your content...</p>
                        </Card>
                    ) : generatedContents.length > 0 ? (
                        generatedContents.map(({ platform: pId, data, imageUrl }) => {
                            const info = getPlatformInfo(pId);
                            const wordCountDisplay = data.content.split(/\s+/).filter(Boolean).length;
                            return (
                                <Card key={pId} className="p-6 space-y-4 bg-card shadow-sm border-border">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {info && <info.icon className={`w-5 h-5 ${info.color}`} />}
                                            <h3 className="font-display text-lg font-semibold text-foreground">{info?.name}</h3>
                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">({wordCountDisplay} words)</span>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => handleCopy({ platform: pId, data, imageUrl })} className="text-muted-foreground hover:text-foreground">
                                            {copiedPlatform === pId ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>

                                    {imageUrl && (
                                        <div className="rounded-lg overflow-hidden border border-border/30">
                                            <img src={imageUrl} alt={data.title} className="w-full h-48 object-cover" />
                                        </div>
                                    )}

                                    <h4 className="text-xl font-bold text-foreground">{data.title}</h4>
                                    {data.description && <p className="text-sm text-muted-foreground italic border-l-2 border-primary/50 pl-3">{data.description}</p>}

                                    <pre className="whitespace-pre-wrap text-foreground bg-secondary/30 p-4 rounded-lg font-sans text-sm leading-relaxed max-h-[400px] overflow-y-auto">
                                        {data.content}
                                    </pre>

                                    {data.hashtags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {data.hashtags.map((tag, i) => (
                                                <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </Card>
                            );
                        })
                    ) : (
                        <Card className="p-6 min-h-[400px] flex items-center justify-center bg-card border-dashed">
                            <div className="text-center space-y-3 max-w-xs">
                                <div className="w-16 h-16 mx-auto rounded-full bg-secondary/50 flex items-center justify-center">
                                    <Bot className="w-8 h-8 text-muted-foreground/60" />
                                </div>
                                <p className="text-muted-foreground font-medium">Your AI-generated content will appear here</p>
                            </div>
                        </Card>
                    )}
                    {isLoading && generatedContents.length > 0 && (
                        <div className="flex items-center justify-center p-4 text-muted-foreground text-sm font-medium">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating next platform...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}