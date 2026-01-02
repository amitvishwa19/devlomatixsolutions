import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ViewToggle({ viewMode, onViewModeChange }) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0",
          viewMode === "grid" && "bg-background shadow-sm"
        )}
        onClick={() => onViewModeChange("grid")}
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="sr-only">Grid view</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0",
          viewMode === "list" && "bg-background shadow-sm"
        )}
        onClick={() => onViewModeChange("list")}
      >
        <List className="w-4 h-4" />
        <span className="sr-only">List view</span>
      </Button>
    </div>
  );
}
