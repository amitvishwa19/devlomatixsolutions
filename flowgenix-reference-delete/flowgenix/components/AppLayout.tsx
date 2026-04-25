import { ReactNode, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { MessageSquare, Settings, Workflow, History, LayoutGrid, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import flowgenixLogo from "@/assets/flowgenix-logo.png";

type TabDef = {
  to: string;
  label: string;
  icon: typeof MessageSquare;
  match: (path: string) => boolean;
};

const TABS: TabDef[] = [
  { to: "/", label: "chat", icon: MessageSquare, match: (p) => p === "/" || p === "/chat" },
  { to: "/setup", label: "setup", icon: Settings, match: (p) => p === "/setup" },
  { to: "/workflows", label: "workflows", icon: Workflow, match: (p) => p === "/workflows" },
  { to: "/runs", label: "runs", icon: History, match: (p) => p === "/runs" },
  { to: "/canvas", label: "canvas", icon: LayoutGrid, match: (p) => p.startsWith("/canvas") },
  { to: "/credentials", label: "credentials", icon: KeyRound, match: (p) => p === "/credentials" },
];

interface Props {
  children: ReactNode;
  /** Render content edge-to-edge without padding (for Canvas). */
  fullBleed?: boolean;
}

export const AppLayout = ({ children, fullBleed = false }: Props) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.shiftKey || e.altKey) return;
      const idx = parseInt(e.key, 10);
      if (!Number.isFinite(idx) || idx < 1 || idx > TABS.length) return;
      const target = document.activeElement;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) return;
      }
      e.preventDefault();
      navigate(TABS[idx - 1].to);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card/40 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-2.5">
          <div className="flex items-center gap-2.5">
            <img
              src={flowgenixLogo}
              alt="Flowgenix logo"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
            <span className="font-mono text-sm font-semibold tracking-tight">
              flow<span className="text-primary">genix</span>
            </span>
          </div>
          <nav className="flex items-center gap-1">
            {TABS.map((t) => {
              const active = t.match(pathname);
              const Icon = t.icon;
              return (
                <NavLink
                  key={t.to}
                  to={t.to}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs transition-colors",
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>
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
