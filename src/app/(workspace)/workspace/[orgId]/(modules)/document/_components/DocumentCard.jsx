import { 
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  File, 
  MoreVertical,
  Download,
  Eye,
  Trash2,
  Share2,
  Edit,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const typeIcons = {
  pdf: FileText,
  image: FileImage,
  spreadsheet: FileSpreadsheet,
  document: File,
};

const typeColors = {
  pdf: "text-destructive",
  image: "text-chart-2",
  spreadsheet: "text-chart-5",
  document: "text-primary",
};

const statusStyles = {
  active: "bg-success/10 text-success border-success/20",
  archived: "bg-muted text-muted-foreground border-muted",
  pending: "bg-warning/10 text-warning border-warning/20",
};

export function DocumentCard({ 
  document, 
  onView, 
  onDownload, 
  onDelete, 
  onShare,
  isSelected = false,
  onSelect,
  onToggleStar,
  selectionMode = false
}) {
  const Icon = typeIcons[document.type];

  return (
    <div 
      className={cn(
        "bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-all group relative",
        isSelected && "border-primary bg-primary/5"
      )}
    >
      {(selectionMode || isSelected) && onSelect && (
        <div className="absolute top-3 left-3 z-10">
          <Checkbox 
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(document, !!checked)}
            className="bg-card"
          />
        </div>
      )}

      {onToggleStar && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-3 right-3 h-7 w-7 z-10",
            !document.starred && "opacity-0 group-hover:opacity-100",
            "transition-opacity"
          )}
          onClick={() => onToggleStar(document)}
        >
          <Star 
            className={cn(
              "h-4 w-4",
              document.starred ? "fill-warning text-warning" : "text-muted-foreground"
            )} 
          />
        </Button>
      )}

      <div className="flex items-start gap-4">
        <div 
          className={cn(
            "h-12 w-12 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0 cursor-pointer",
            "group-hover:bg-secondary transition-colors",
            selectionMode && "ml-6"
          )}
          onClick={() => onView(document)}
        >
          <Icon className={cn("h-6 w-6", typeColors[document.type])} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 cursor-pointer" onClick={() => onView(document)}>
              <h4 className="text-sm font-medium text-foreground truncate hover:text-primary transition-colors">
                {document.name}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {document.size} • {document.uploadedAt}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity",
                    onToggleStar && "mr-6"
                  )}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onView(document)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload(document)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare(document)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                {onToggleStar && (
                  <DropdownMenuItem onClick={() => onToggleStar(document)}>
                    <Star className={cn("h-4 w-4 mr-2", document.starred && "fill-current")} />
                    {document.starred ? "Remove Star" : "Add Star"}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(document)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge variant="outline" className="text-xs font-normal truncate max-w-[120px]">
              {document.category}
            </Badge>
            <Badge 
              variant="outline" 
              className={cn("text-xs font-normal flex-shrink-0", statusStyles[document.status])}
            >
              {document.status}
            </Badge>
          </div>

          {document.patientName && (
            <p className="text-xs text-muted-foreground mt-2">
              Patient: <span className="text-foreground">{document.patientName}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
