import { Check, ChevronsUpDown, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AccountSwitcher({ accounts = [], activeAccount, onSelect }) {
  const hasAccounts = accounts.length > 0;
  const activeId = activeAccount?.id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 max-w-[260px] justify-between gap-2 px-2.5"
          disabled={!hasAccounts}
          title={hasAccounts ? "Switch active WhatsApp account" : "Add a WhatsApp account in Settings"}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Phone className="h-3.5 w-3.5" />
            </span>
            <span className="flex min-w-0 flex-col items-start leading-tight">
              <span className="truncate text-xs font-semibold">
                {activeAccount?.display_name || (hasAccounts ? "Choose account" : "No account")}
              </span>
              <span className="truncate text-[10px] text-muted-foreground">
                {activeAccount?.phone_number || "—"}
              </span>
            </span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
          WhatsApp accounts
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {accounts.map((acc) => {
          const selected = acc.id === activeId;
          return (
            <DropdownMenuItem
              key={acc.id}
              onSelect={(e) => { e.preventDefault(); onSelect?.(acc.id); }}
              className="flex items-start gap-2"
            >
              <Check className={`mt-0.5 h-4 w-4 shrink-0 ${selected ? "text-primary opacity-100" : "opacity-0"}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{acc.display_name}</span>
                  {acc.is_default && (
                    <span className="inline-flex items-center gap-0.5 rounded-sm bg-primary/10 px-1 text-[9px] font-semibold uppercase tracking-wide text-primary">
                      <Star className="h-2.5 w-2.5" /> default
                    </span>
                  )}
                </div>
                <p className="truncate text-[11px] text-muted-foreground">{acc.phone_number}</p>
              </div>
            </DropdownMenuItem>
          );
        })}
        {!hasAccounts && (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            No WhatsApp accounts connected. Add one in Settings.
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
