import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

export const ChatThreadList = ({ threads, activeId, onSelect, onCreate, onRename, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");

  return (
    <div className="flex h-full flex-col border-r border-border bg-card/40">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          ▸ threads
        </span>
        <button
          type="button"
          onClick={onCreate}
          title="New chat"
          className="text-muted-foreground transition-colors hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <ul className="flex-1 overflow-y-auto py-1">
        {threads.length === 0 && (
          <li className="px-3 py-2 font-mono text-[11px] text-muted-foreground">No threads yet.</li>
        )}
        {threads.map((t) => {
          const active = t.id === activeId;
          const isEditing = editingId === t.id;
          return (
            <li key={t.id}>
              <div
                className={`group flex items-center gap-1 px-2 py-1.5 ${
                  active ? "bg-secondary/70" : "hover:bg-secondary/40"
                }`}
              >
                {isEditing ? (
                  <>
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          onRename(t.id, draft.trim() || t.title);
                          setEditingId(null);
                        } else if (e.key === "Escape") {
                          setEditingId(null);
                        }
                      }}
                      className="flex-1 rounded bg-background px-1.5 py-0.5 font-mono text-xs outline-none ring-1 ring-border focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onRename(t.id, draft.trim() || t.title);
                        setEditingId(null);
                      }}
                      className="text-primary"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-muted-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onSelect(t.id)}
                      className="flex-1 truncate text-left font-mono text-xs"
                      title={t.title}
                    >
                      {t.title || "Untitled"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(t.id);
                        setDraft(t.title);
                      }}
                      title="Rename"
                      className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete thread "${t.title}"?`)) onDelete(t.id);
                      }}
                      title="Delete"
                      className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
