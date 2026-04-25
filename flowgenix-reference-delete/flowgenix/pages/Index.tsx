import { useEffect, useState } from "react";
import { AppLayout } from "@/flowgenix/components/AppLayout";
import { ChatPanel } from "@/flowgenix/components/ChatPanel";
import {
  AgentConfig,
  RagDoc,
  defaultConfig,
  loadConfig,
  loadRag,
} from "@/flowgenix/lib/agent-storage";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [config, setConfig] = useState<AgentConfig>(defaultConfig);
  const [docs, setDocs] = useState<RagDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [c, d] = await Promise.all([loadConfig(), loadRag()]);
      setConfig(c);
      setDocs(d);
      setLoading(false);
    })();
  }, []);

  return (
    <AppLayout>
      {loading ? (
        <div className="flex h-full items-center justify-center text-muted-foreground font-mono text-sm">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" /> loading from cloud...
        </div>
      ) : (
        <div className="flex h-full flex-col gap-3">
          <header className="space-y-1">
            <h1 className="font-mono text-xl font-semibold tracking-tight">
              Flowgenix<span className="text-primary">.</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Chat with your agent, then promote it to a scheduled workflow on the canvas.
            </p>
          </header>
          <section
            className="flex-1 min-h-0 overflow-hidden rounded-lg border border-border bg-card"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <ChatPanel config={config} ragDocs={docs} />
          </section>
        </div>
      )}
    </AppLayout>
  );
};

export default Index;
