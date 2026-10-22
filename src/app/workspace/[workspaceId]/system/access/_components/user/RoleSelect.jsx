"use client";

import * as React from "react";
import { X, Check, ChevronsUpDown, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { titleCaseLabel } from "@/utils/functions";

export function RoleSelect({ roles = [], selected = [], onChange, placeholder = "Select roles...", className }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef(null);
  const [triggerWidth, setTriggerWidth] = React.useState(null);

  React.useEffect(() => {
    const updateWidth = () => {
      if (triggerRef.current) {
        setTriggerWidth(triggerRef.current.offsetWidth);
      }
    };
    updateWidth();
    if (open) {
      // Small timeout to catch any layout shifts when opening
      const timer = setTimeout(updateWidth, 10);
      window.addEventListener("resize", updateWidth);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", updateWidth);
      };
    }
  }, [open]);

  const handleSelect = (roleId) => {
    if (selected.includes(roleId)) {
      onChange(selected.filter((id) => id !== roleId));
    } else {
      onChange([...selected, roleId]);
    }
  };

  const handleRemove = (roleId, e) => {
    e.stopPropagation();
    onChange(selected.filter((id) => id !== roleId));
  };

  const selectedRoles = (roles || []).filter((role) => selected.includes(role.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between min-h-[42px] h-auto px-3 py-1.5 rounded-lg border-border/60 bg-background hover:bg-muted/20 text-foreground font-normal transition-all text-xs cursor-pointer shadow-xs",
            "focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary",
            className
          )}
        >
          {selectedRoles.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 py-0.5">
              {selectedRoles.map((role) => (
                <span
                  key={role.id}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted/60 hover:bg-muted border border-border/80 text-foreground transition-colors"
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: role.color || "var(--primary)" }}
                  />
                  <span className="truncate max-w-[140px] font-medium">
                    {titleCaseLabel(role.title)}
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    className="ml-0.5 rounded-sm p-0.5 hover:bg-background/80 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    onClick={(e) => handleRemove(role.id, e)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleRemove(role.id, e);
                      }
                    }}
                  >
                    <X className="h-3 w-3" />
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground/70 text-xs">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground/60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        style={{
          width: triggerWidth ? `${triggerWidth}px` : "var(--radix-popover-trigger-width, 100%)",
          maxWidth: "calc(100vw - 2rem)",
        }}
        className="w-full p-0 border border-border/80 bg-popover shadow-2xl rounded-xl overflow-hidden z-50"
        align="start"
        sideOffset={6}
      >
        <Command className="bg-transparent">
          <CommandInput
            placeholder="Search roles..."
            className="text-xs h-10 border-b border-border/60 focus:ring-0"
          />
          <CommandList className="max-h-64 p-1.5">
            <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
              No roles found.
            </CommandEmpty>
            <CommandGroup>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {(roles || []).map((role) => {
                  const isSelected = selected.includes(role.id);
                  return (
                    <CommandItem
                      key={role.id}
                      value={role.title}
                      onSelect={() => handleSelect(role.id)}
                      className={cn(
                        "flex items-center gap-2.5 p-2 rounded-lg text-xs cursor-pointer transition-colors",
                        "hover:bg-muted/80 data-[selected=true]:bg-muted/90 data-[selected=true]:text-foreground",
                        isSelected && "bg-primary/10 border border-primary/20 text-foreground"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground shadow-xs"
                            : "border-border/80 bg-background/60"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[2.5]" />}
                      </div>

                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: role.color || "var(--primary)" }}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-xs text-foreground truncate">
                            {titleCaseLabel(role.title)}
                          </span>
                          {role.description && (
                            <span className="text-[10px] text-muted-foreground line-clamp-1">
                              {role.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}