import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2, GripVertical, AlertCircle, AlertTriangle, Link2 } from "lucide-react";
import { FieldDef, FIELD_TYPES, DEFAULT_VALUES, ValidationError } from "../types";
import { cn } from "@/lib/utils";

interface FieldRowProps {
  field: FieldDef;
  errors: ValidationError[];
  tables: string[];
  onUpdate: (updates: Partial<FieldDef>) => void;
  onRemove: () => void;
  onDragStart?: () => void;
}

export function FieldRow({ field, errors, tables, onUpdate, onRemove }: FieldRowProps) {
  const fieldErrors = errors.filter(e => e.type === 'error');
  const fieldWarnings = errors.filter(e => e.type === 'warning');
  const hasError = fieldErrors.length > 0;
  const hasWarning = fieldWarnings.length > 0;

  return (
    <div 
      className={cn(
        "field-row grid grid-cols-[24px_1fr_130px_110px_60px_50px_50px_50px_36px] gap-2 p-3 border-b last:border-b-0 items-center group",
        hasError && "bg-destructive/5 border-l-2 border-l-destructive",
        hasWarning && !hasError && "bg-warning/5 border-l-2 border-l-warning"
      )}
    >
      <div className="flex justify-center cursor-grab opacity-0 group-hover:opacity-50 transition-opacity">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="relative">
        <Input
          value={field.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="field_name"
          className={cn(
            "h-9 text-sm font-mono",
            hasError && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {(hasError || hasWarning) && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {hasError ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <ul className="text-xs space-y-1">
                  {errors.map((e, i) => (
                    <li key={i} className={e.type === 'error' ? 'text-destructive' : 'text-warning'}>
                      {e.message}
                    </li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <Select
        value={field.type}
        onValueChange={(value) => onUpdate({ type: value })}
      >
        <SelectTrigger className="h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FIELD_TYPES.map(t => (
            <SelectItem key={t.value} value={t.value}>
              <span className="flex items-center gap-2">
                <span className={cn("text-xs", t.color)}>●</span>
                {t.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={field.defaultValue}
        onValueChange={(value) => onUpdate({ defaultValue: value })}
      >
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder="None" />
        </SelectTrigger>
        <SelectContent>
          {DEFAULT_VALUES.map(d => (
            <SelectItem key={d.value} value={d.value}>
              <span className="flex flex-col">
                <span>{d.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex justify-center">
              <Checkbox
                checked={field.isOptional}
                onCheckedChange={(c) => onUpdate({ isOptional: !!c })}
                className="data-[state=checked]:bg-muted-foreground"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>Optional (nullable)</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex justify-center">
              <Checkbox
                checked={field.isId}
                onCheckedChange={(c) => onUpdate({ isId: !!c, isOptional: c ? false : field.isOptional })}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>Primary Key</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex justify-center">
              <Checkbox
                checked={field.isUnique}
                onCheckedChange={(c) => onUpdate({ isUnique: !!c })}
                className="data-[state=checked]:bg-accent"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>Unique constraint</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex justify-center">
              {field.relationTo ? (
                <Link2 className="h-4 w-4 text-primary" />
              ) : (
                <Select
                  value={field.relationTo || "none"}
                  onValueChange={(value) => onUpdate({ 
                    relationTo: value === 'none' ? undefined : value,
                    relationField: value === 'none' ? undefined : 'id'
                  })}
                >
                  <SelectTrigger className="h-7 w-7 p-0 border-0 bg-transparent">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No relation</SelectItem>
                    {tables.filter(t => t !== field.name).map(table => (
                      <SelectItem key={table} value={table}>{table}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {field.relationTo ? `References ${field.relationTo}` : 'Add relation'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
