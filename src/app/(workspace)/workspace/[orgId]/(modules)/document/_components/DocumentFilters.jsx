import { Search, Filter, SortAsc, LayoutGrid, List, Star, CheckSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

export function DocumentFilters({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
  statusFilter = "all",
  onStatusChange,
  viewMode = "grid",
  onViewModeChange,
  showStarredOnly = false,
  onShowStarredChange,
  selectionMode = false,
  onSelectionModeChange,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-secondary/30 border-border"
          />
        </div>

        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full sm:w-[180px] bg-secondary/30 border-border">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="medical-records">Medical Records</SelectItem>
            <SelectItem value="lab-reports">Lab Reports</SelectItem>
            <SelectItem value="prescriptions">Prescriptions</SelectItem>
            <SelectItem value="imaging">Imaging</SelectItem>
            <SelectItem value="administrative">Administrative</SelectItem>
            <SelectItem value="consent-forms">Consent Forms</SelectItem>
          </SelectContent>
        </Select>

        {onStatusChange && (
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full sm:w-[140px] bg-secondary/30 border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-[160px] bg-secondary/30 border-border">
            <SortAsc className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="name-asc">Name A-Z</SelectItem>
            <SelectItem value="name-desc">Name Z-A</SelectItem>
            <SelectItem value="size-desc">Size (Largest)</SelectItem>
            <SelectItem value="size-asc">Size (Smallest)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onShowStarredChange && (
            <Toggle 
              pressed={showStarredOnly} 
              onPressedChange={onShowStarredChange}
              size="sm"
              className="gap-2"
            >
              <Star className={cn("h-4 w-4", showStarredOnly && "fill-warning text-warning")} />
              Starred
            </Toggle>
          )}
          {onSelectionModeChange && (
            <Toggle 
              pressed={selectionMode} 
              onPressedChange={onSelectionModeChange}
              size="sm"
              className="gap-2"
            >
              <CheckSquare className="h-4 w-4" />
              Select
            </Toggle>
          )}
        </div>

        {onViewModeChange && (
          <div className="flex items-center gap-1 bg-secondary/30 rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => onViewModeChange("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => onViewModeChange("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
