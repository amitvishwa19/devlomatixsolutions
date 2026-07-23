import { useEffect } from "react";
import { MessageSquare, Settings, Workflow, History, LayoutGrid, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";

export const AppLayout = ({ children, fullBleed = false }) => {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params?.workspaceId;

  const base = `/workspace/${workspaceId}/flowgenix`;

  const TABS = [
    { to: `${base}/chat`, label: "chat", icon: MessageSquare, match: (p) => p === base || p === `${base}/chat` },
    { to: `${base}/setup`, label: "setup", icon: Settings, match: (p) => p === `${base}/setup` },
    { to: `${base}/workflows`, label: "workflows", icon: Workflow, match: (p) => p === `${base}/workflows` },
    { to: `${base}/runs`, label: "runs", icon: History, match: (p) => p === `${base}/runs` },
    { to: `${base}/canvas`, label: "canvas", icon: LayoutGrid, match: (p) => p.includes(`${base}/canvas`) },
    { to: `${base}/credentials`, label: "credentials", icon: KeyRound, match: (p) => p === `${base}/credentials` },
  ];

  useEffect(() => {
    const onKey = (e) => {
      if (!(e.metaKey || e.ctrlKey) || e.shiftKey || e.altKey) return;
      const idx = parseInt(e.key, 10);
      if (!Number.isFinite(idx) || idx < 1 || idx > TABS.length) return;
      const target = document.activeElement;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) return;
      }
      e.preventDefault();
      router.push(TABS[idx - 1].to);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, workspaceId, TABS]);

  return (
    <div className="flex  flex-col bg-background text-foreground">

      <main className={cn("flex-1 min-h-0", fullBleed ? "" : "overflow-auto")}>
        {fullBleed ? (
          children
        ) : (
          <div className="mx-auto h-full max-w-7xl px-6 py-4">{children}</div>
        )}
      </main>
    </div>
  );
};
