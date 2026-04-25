import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { AccountSwitcher } from "./AccountSwitcher";

export function AppTopNav({ title, accounts, activeAccount, onAccountChange, onRefresh }) {
  return (
    <header className="flex h-14 items-center justify-between gap-3 rounded-xl border border-border bg-card/50 px-3 shadow-sm backdrop-blur">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="shrink-0" />
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold tracking-tight sm:text-lg">{title}</h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Active account drives Inbox, Send, Contacts, Templates &amp; Settings
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <AccountSwitcher
          accounts={accounts}
          activeAccount={activeAccount}
          onSelect={onAccountChange}
        />
        <ThemeToggle />
        <Button size="sm" onClick={onRefresh} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
          Refresh
        </Button>
      </div>
    </header>
  );
}
