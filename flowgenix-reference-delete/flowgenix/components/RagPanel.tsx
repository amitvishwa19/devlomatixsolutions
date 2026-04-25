import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AgentConfig, RagDoc, getDefaultModel, insertRagDoc, deleteRagDoc } from "@/flowgenix/lib/agent-storage";
import { chunkText, embedTexts } from "@/flowgenix/lib/agent-runtime";
import { toast } from "sonner";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";

interface Props {
  config: AgentConfig;
  docs: RagDoc[];
  setDocs: (d: RagDoc[]) => void;
}

export const RagPanel = ({ config, docs, setDocs }: Props) => {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const m = getDefaultModel(config);
    if (!m || !m.apiKey) {
      toast.error("Add a model with an API key first — embeddings require it.");
      return;
    }
    setBusy(true);
    try {
      const next = [...docs];
      for (const f of Array.from(files)) {
        const text = await f.text();
        const chunks = chunkText(text);
        const vecs = await embedTexts(m, chunks);
        const doc: RagDoc = {
          id: crypto.randomUUID(),
          name: f.name,
          chunks: chunks.map((text, i) => ({ text, embedding: vecs[i] })),
        };
        await insertRagDoc(doc);
        next.push(doc);
      }
      setDocs(next);
      toast.success(`Indexed ${files.length} document(s)`);
    } catch (e) {
      toast.error(`Embedding failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteRagDoc(id);
      setDocs(docs.filter((d) => d.id !== id));
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={ref}
        type="file"
        multiple
        accept=".txt,.md,.csv,.json,.log"
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />
      <Button
        onClick={() => ref.current?.click()}
        disabled={busy}
        variant="outline"
        className="w-full font-mono"
      >
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
        upload_docs
      </Button>
      <p className="text-[10px] text-muted-foreground font-mono">
        .txt .md .csv .json — embedded with text-embedding-3-small via your provider
      </p>
      <div className="space-y-1">
        {docs.length === 0 && (
          <p className="text-xs text-muted-foreground font-mono">// no documents indexed</p>
        )}
        {docs.map((d) => (
          <div
            key={d.id}
            className="flex items-center justify-between rounded border border-border bg-secondary/40 px-2 py-1.5"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate text-xs font-mono">{d.name}</span>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {d.chunks.length}c
              </span>
            </div>
            <button
              onClick={() => remove(d.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
