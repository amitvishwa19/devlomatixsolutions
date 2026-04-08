import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Loader2, Copy, Check, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const tones = ["professional", "casual", "witty", "inspirational", "formal", "friendly", "humorous", "bold"];
const platforms = ["", "instagram", "twitter", "linkedin", "facebook", "tiktok", "youtube", "blog"];
const languages = ["english", "spanish", "french", "german", "arabic", "hindi", "portuguese", "chinese", "japanese", "korean"];

const Rewriter = () => {
  const [content, setContent] = useState("");
  const [tone, setTone] = useState("professional");
  const [platform, setPlatform] = useState("");
  const [language, setLanguage] = useState("english");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ rewritten_content: string; changes_summary: string; improvement_score: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const rewrite = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("rewrite-content", {
        body: { content, tone, platform: platform || undefined, language, instructions: instructions || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult({
        rewritten_content: data.rewritten_content || "",
        changes_summary: data.changes_summary || "",
        improvement_score: data.improvement_score || 0,
      });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to rewrite content", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.rewritten_content);
    setCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-5xl">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-4">
            <RefreshCw className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI Content Rewriter</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            <span className="gradient-text">Content</span>{" "}
            <span className="text-foreground">Rewriter</span>
          </h1>
          <p className="text-muted-foreground">Paste your content and transform it for any platform or tone.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <Card className="border-border/50 bg-card/80 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Original Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[180px] text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue placeholder="Tone" /></SelectTrigger>
                  <SelectContent>
                    {tones.map((t) => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger><SelectValue placeholder="Platform (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Any platform</SelectItem>
                    {platforms.filter(Boolean).map((p) => (
                      <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue placeholder="Language" /></SelectTrigger>
                <SelectContent>
                  {languages.map((l) => (
                    <SelectItem key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Additional instructions (optional)"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
              <Button onClick={rewrite} disabled={loading || !content.trim()} className="w-full">
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                {loading ? "Rewriting..." : "Rewrite Content"}
              </Button>
            </CardContent>
          </Card>

          {/* Output */}
          <Card className={`border-border/50 bg-card/80 backdrop-blur transition-opacity ${result ? "opacity-100" : "opacity-50"}`}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Rewritten Content</CardTitle>
              {result && (
                <Button variant="ghost" size="sm" onClick={copyResult}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {result ? (
                <>
                  <div className="rounded-md bg-muted/50 p-4 text-sm whitespace-pre-wrap min-h-[180px] text-foreground">
                    {result.rewritten_content}
                  </div>
                  {result.improvement_score > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Improvement Score</span>
                        <span>{result.improvement_score}%</span>
                      </div>
                      <Progress value={result.improvement_score} className="h-2" />
                    </div>
                  )}
                  {result.changes_summary && (
                    <p className="text-xs text-muted-foreground italic">{result.changes_summary}</p>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center min-h-[180px] text-muted-foreground text-sm">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Rewritten content will appear here
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Rewriter;
