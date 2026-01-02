import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Bell, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header({ 
  searchQuery = "", 
  onSearchChange, 
  onUploadClick,
  showSearch = true,
  showUpload = true,
}) {
  return (
    <header className="sticky top-0 z-40 px-6 py-4 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        {showSearch ? (
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documents, patients, categories..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 bg-secondary/50 border-border focus:bg-secondary"
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          {showUpload && (
            <Button variant="gradient" onClick={onUploadClick} className="gap-2">
              <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Document</span>
            </Button>
          )}

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
          </Button>

          <Avatar className="w-9 h-9 border-2 border-primary/20">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              DR
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
