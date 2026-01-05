import { 
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  File,
  Download,
  Share2,
  User,
  Calendar,
  FileCheck,
  History,
  Printer
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Document } from "./types";

interface VersionEntry {
  version: string;
  modifiedBy: string;
  modifiedAt: string;
  changes: string;
}

interface DocumentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  onDownload: (doc: Document) => void;
  onShare: (doc: Document) => void;
}

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

// Mock version history
const mockVersionHistory: VersionEntry[] = [
  { version: "v1.3", modifiedBy: "Dr. Sarah Johnson", modifiedAt: "2 hours ago", changes: "Updated patient diagnosis" },
  { version: "v1.2", modifiedBy: "Nurse Mike Chen", modifiedAt: "Yesterday", changes: "Added lab results attachment" },
  { version: "v1.1", modifiedBy: "Admin Lisa Park", modifiedAt: "Dec 26, 2024", changes: "Fixed formatting issues" },
  { version: "v1.0", modifiedBy: "Dr. Sarah Johnson", modifiedAt: "Dec 24, 2024", changes: "Initial upload" },
];

export function DocumentPreviewDialog({ 
  open, 
  onOpenChange, 
  document, 
  onDownload, 
  onShare 
}: DocumentPreviewDialogProps) {
  if (!document) return null;

  const Icon = typeIcons[document.type];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <SheetHeader className="p-6 pb-0">
          <div className="flex items-start gap-4">
            <div className={cn(
              "h-14 w-14 rounded-xl bg-secondary/50 flex items-center justify-center flex-shrink-0"
            )}>
              <Icon className={cn("h-7 w-7", typeColors[document.type])} />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg font-semibold text-foreground truncate pr-8">
                {document.name}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="text-xs font-normal">
                  {document.category}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs font-normal", statusStyles[document.status])}
                >
                  {document.status}
                </Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-6 pt-4 space-y-6">
            {/* Document Preview Placeholder */}
            <div className="h-48 rounded-xl bg-secondary/30 border border-border flex items-center justify-center">
              <div className="text-center">
                <Icon className={cn("h-16 w-16 mx-auto mb-3", typeColors[document.type])} />
                <p className="text-sm text-muted-foreground">Preview not available</p>
                <p className="text-xs text-muted-foreground">Click download to view full document</p>
              </div>
            </div>

            {/* Document Details */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Uploaded by:</span>
                  <span className="text-foreground font-medium">{document.uploadedBy}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Date:</span>
                  <span className="text-foreground font-medium">{document.uploadedAt}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Size:</span>
                  <span className="text-foreground font-medium">{document.size}</span>
                </div>
                {document.patientName && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Patient:</span>
                    <span className="text-foreground font-medium">{document.patientName}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Version History */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <History className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold text-foreground">Version History</h4>
              </div>
              <div className="space-y-2">
                {mockVersionHistory.map((version, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs font-mono">
                        {version.version}
                      </Badge>
                      <div>
                        <p className="text-sm text-foreground">{version.changes}</p>
                        <p className="text-xs text-muted-foreground">
                          {version.modifiedBy} • {version.modifiedAt}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Restore
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => document && onShare(document)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button className="flex-1" onClick={() => document && onDownload(document)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
