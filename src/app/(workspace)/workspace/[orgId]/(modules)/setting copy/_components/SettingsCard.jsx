import { cn } from "@/lib/utils";

export function SettingsCard({ title, description, children, className }) {
  return (
    <div className={cn(
      "p-5 rounded-xl bg-surface-2 border border-border/50 transition-all duration-200 hover:border-border",
      className
    )}>
      {title ? (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-foreground">{title}</h4>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            {children}
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
