import { HistoryEntry } from "@/social-hub/hooks/use-content-history";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Trash2, Clock, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface ContentHistoryProps {
  history: HistoryEntry[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onReuse: (entry: HistoryEntry) => void;
}

const platformLabels: Record<string, string> = {
  twitter: "Twitter/X",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  tiktok: "TikTok",
};

export function ContentHistory({ history, onRemove, onClear, onReuse }: ContentHistoryProps) {
  const { toast } = useToast();

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast({ title: "Copied to clipboard!" });
  };

  if (history.length === 0) {
    return (
      <Card className="glass-card p-6">
        <div className="text-center py-8 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-secondary/50 flex items-center justify-center">
            <History className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No history yet. Generate some content to get started!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          History
        </h3>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground hover:text-destructive">
          Clear All
        </Button>
      </div>

      <ScrollArea className="h-[400px] pr-2">
        <div className="space-y-3">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="p-3 rounded-lg bg-secondary/30 border border-border/30 hover:border-border/60 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {platformLabels[entry.platform] || entry.platform}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                    {entry.tone}
                  </span>
                  {entry.language !== "english" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {entry.language}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                </span>
              </div>

              <p className="text-xs text-muted-foreground mb-1 truncate">Topic: {entry.topic}</p>
              <p className="text-sm text-foreground line-clamp-3">{entry.content}</p>

              <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" onClick={() => handleCopy(entry.content)} className="h-7 text-xs">
                  <Copy className="w-3 h-3 mr-1" /> Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onReuse(entry)} className="h-7 text-xs">
                  Reuse
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onRemove(entry.id)} className="h-7 text-xs text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}