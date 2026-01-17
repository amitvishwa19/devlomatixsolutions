import { Construction } from "lucide-react";

export function PlaceholderSettings({ title, description }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Construction className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h4 className="text-lg font-medium text-muted-foreground">Coming Soon</h4>
        <p className="text-sm text-muted-foreground/70 mt-1">This section is under development</p>
      </div>
    </div>
  );
}
