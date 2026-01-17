import { Share2, Eye, Download, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const permissionLabels = { view: "View only", edit: "Can edit", admin: "Full access" };
const permissionColors = { view: "bg-secondary text-muted-foreground border-border", edit: "bg-primary/10 text-primary border-primary/20", admin: "bg-chart-3/10 text-chart-3 border-chart-3/20" };

export function SharedWithMe({ documents, onView, onDownload }) {
  if (documents.length === 0) {
    return (<div className="bg-card rounded-xl border border-border p-8 text-center"><div className="h-14 w-14 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4"><Share2 className="h-7 w-7 text-muted-foreground" /></div><h3 className="text-lg font-medium text-foreground mb-1">No shared documents</h3><p className="text-sm text-muted-foreground">Documents shared with you will appear here.</p></div>);
  }
  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div key={doc.id} className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><h4 className="text-sm font-medium truncate">{doc.name}</h4><div className="flex items-center gap-2 mt-1"><Badge variant="outline" className="text-xs">{doc.category}</Badge><Badge variant="outline" className={cn("text-xs", permissionColors[doc.permission])}>{permissionLabels[doc.permission]}</Badge></div></div>
                <div className="flex items-center gap-2"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(doc)}><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDownload(doc)}><Download className="h-4 w-4" /></Button></div>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t"><div className="flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarFallback className="bg-primary/10 text-primary text-[10px]">{doc.sharedBy.name.split(" ").map(n => n[0]).join("").toUpperCase()}</AvatarFallback></Avatar><span className="text-xs text-muted-foreground">Shared by <span className="text-foreground">{doc.sharedBy.name}</span></span></div><div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{doc.sharedAt}</div></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
