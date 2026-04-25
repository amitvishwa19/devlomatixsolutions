import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle } from "lucide-react";
import cronParser from "cron-parser";

export function isValidCron(expr: string): boolean {
  try {
    cronParser.parseExpression(expr);
    return true;
  } catch {
    return false;
  }
}

type Field = "minute" | "hour" | "dom" | "month" | "dow";

const RANGES: Record<Field, [number, number]> = {
  minute: [0, 59],
  hour: [0, 23],
  dom: [1, 31],
  month: [1, 12],
  dow: [0, 6],
};

const LABELS: Record<Field, string> = {
  minute: "Minute",
  hour: "Hour",
  dom: "Day of month",
  month: "Month",
  dow: "Day of week",
};

const DOW_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const PRESETS: { label: string; cron: string }[] = [
  { label: "Every minute", cron: "* * * * *" },
  { label: "Hourly", cron: "0 * * * *" },
  { label: "Daily 9am", cron: "0 9 * * *" },
  { label: "Weekly Mon 9am", cron: "0 9 * * 1" },
];

function partToString(values: number[] | "*"): string {
  if (values === "*" || values.length === 0) return "*";
  return [...values].sort((a, b) => a - b).join(",");
}

function parseCron(expr: string): Record<Field, number[] | "*"> {
  const parts = (expr || "* * * * *").trim().split(/\s+/);
  const fields: Field[] = ["minute", "hour", "dom", "month", "dow"];
  const out = {} as Record<Field, number[] | "*">;
  fields.forEach((f, i) => {
    const p = parts[i] ?? "*";
    if (p === "*") out[f] = "*";
    else out[f] = p.split(",").map(Number).filter((n) => !Number.isNaN(n));
  });
  return out;
}

export type CronBuilderProps = {
  value: string;
  onChange: (cron: string) => void;
};

export const CronBuilder = ({ value, onChange }: CronBuilderProps) => {
  const parsed = useMemo(() => parseCron(value), [value]);

  const update = (field: Field, next: number[] | "*") => {
    const nextParsed = { ...parsed, [field]: next };
    const cron = (["minute", "hour", "dom", "month", "dow"] as Field[])
      .map((f) => partToString(nextParsed[f]))
      .join(" ");
    onChange(cron);
  };

  const renderField = (field: Field) => {
    const [min, max] = RANGES[field];
    const current = parsed[field];
    const isAll = current === "*";
    const selected: number[] = isAll ? [] : (current as number[]);
    const summary = isAll ? "every" : selected.slice(0, 4).join(",") + (selected.length > 4 ? "…" : "");
    const display = (n: number) => {
      if (field === "dow") return DOW_NAMES[n];
      if (field === "month") return MONTH_NAMES[n - 1];
      return String(n);
    };

    return (
      <div className="space-y-1.5">
        <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{LABELS[field]}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-full justify-start font-mono text-xs">
              {summary}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3">
            <div className="mb-2 flex items-center gap-2">
              <Checkbox
                id={`all-${field}`}
                checked={isAll}
                onCheckedChange={(c) => update(field, c ? "*" : [])}
              />
              <Label htmlFor={`all-${field}`} className="font-mono text-xs">Every</Label>
            </div>
            {!isAll && (
              <ScrollArea className="h-44 pr-2">
                <div className="grid grid-cols-3 gap-1">
                  {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((n) => {
                    const checked = selected.includes(n);
                    return (
                      <button
                        type="button"
                        key={n}
                        onClick={() => {
                          const nextSet = checked ? selected.filter((x) => x !== n) : [...selected, n];
                          update(field, nextSet);
                        }}
                        className={`rounded border px-1.5 py-1 font-mono text-[10px] transition-colors ${
                          checked
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border bg-secondary/30 hover:border-primary/40"
                        }`}
                      >
                        {display(n)}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <Button
            key={p.cron}
            type="button"
            size="sm"
            variant={value === p.cron ? "default" : "outline"}
            onClick={() => onChange(p.cron)}
            className="h-7 font-mono text-[10px]"
          >
            {p.label}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {(["minute", "hour", "dom", "month", "dow"] as Field[]).map(renderField)}
      </div>
      {(() => {
        const valid = isValidCron(value || "* * * * *");
        return (
          <div
            className={`rounded-md border px-2 py-1.5 ${
              valid ? "border-border bg-secondary/30" : "border-destructive/50 bg-destructive/10"
            }`}
          >
            <p className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              cron
              {!valid && (
                <span className="flex items-center gap-1 text-destructive">
                  <AlertCircle className="h-3 w-3" /> invalid expression
                </span>
              )}
            </p>
            <p className={`font-mono text-xs ${valid ? "" : "text-destructive"}`}>{value || "* * * * *"}</p>
          </div>
        );
      })()}
    </div>
  );
};
