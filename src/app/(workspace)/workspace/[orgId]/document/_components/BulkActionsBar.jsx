import { Download, Trash2, Share2, Archive, X, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BulkActionsBar({ selectedCount, onClearSelection, onBulkDownload, onBulkShare, onBulkArchive, onBulkDelete }) {
  if (selectedCount === 0) return null;
  return (
    <div className={cn("fixed bottom-6 left-1/2 -translate-x-1/2 z-50", "bg-card border border-border rounded-xl shadow-lg", "px-4 py-3 flex items-center gap-4", "animate-in slide-in-from-bottom-5 duration-200")}>
      <div className="flex items-center gap-2 pr-4 border-r border-border"><CheckSquare className="h-4 w-4 text-primary" /><span className="text-sm font-medium">{selectedCount} selected</span><Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={onClearSelection}><X className="h-3 w-3" /></Button></div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onBulkDownload}><Download className="h-4 w-4 mr-2" />Download</Button>
        <Button variant="ghost" size="sm" onClick={onBulkShare}><Share2 className="h-4 w-4 mr-2" />Share</Button>
        <Button variant="ghost" size="sm" onClick={onBulkArchive}><Archive className="h-4 w-4 mr-2" />Archive</Button>
        <Button variant="ghost" size="sm" onClick={onBulkDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
      </div>
    </div>
  );
}
