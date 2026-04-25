import { useEffect, useState } from "react";
import { AppLayout } from "@/flowgenix/components/AppLayout";
import { AgentSettings } from "@/flowgenix/components/AgentSettings";
import { ModelsManager } from "@/flowgenix/components/ModelsManager";
import { RagPanel } from "@/flowgenix/components/RagPanel";
import {
  AgentConfig,
  RagDoc,
  defaultConfig,
  loadConfig,
  loadRag,
} from "@/flowgenix/lib/agent-storage";
import { Loader2 } from "lucide-react";

const Setup = () => {
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
        <div className="flex items-center justify-center py-24 text-muted-foreground font-mono text-sm">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" /> loading from cloud...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="rounded-lg border border-border bg-card p-4 lg:col-span-2">
            <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-primary">
              ▸ models · multi_provider · router
            </h2>
            <ModelsManager config={config} onChange={setConfig} />
          </section>
          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-primary">
              ▸ agent_config
            </h2>
            <AgentSettings config={config} onChange={setConfig} />
          </section>
          <section className="rounded-lg border border-border bg-card p-4 self-start">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-primary">
              ▸ knowledge_base
            </h2>
            <RagPanel config={config} docs={docs} setDocs={setDocs} />
          </section>
        </div>
      )}
    </AppLayout>
  );
};

export default Setup;
