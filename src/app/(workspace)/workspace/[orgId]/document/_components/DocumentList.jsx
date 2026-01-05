import { DocumentCard } from "./DocumentCard";
import { FileX, FileText, FileImage, FileSpreadsheet, File, MoreVertical, Download, Eye, Share2, Trash2, Star } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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

export function DocumentList({ 
  documents, 
  onView, 
  onDownload, 
  onDelete, 
  onShare,
  viewMode = "grid",
  selectedDocuments = new Set(),
  onSelectDocument,
  onToggleStar,
  selectionMode = false
}) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
          <FileX className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No documents found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Try adjusting your search or filter criteria, or upload a new document.
        </p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {selectionMode && (
                <TableHead className="w-12"></TableHead>
              )}
              <TableHead className="w-12"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => {
              const Icon = typeIcons[doc.type];
              const isSelected = selectedDocuments.has(doc.id);
              
              return (
                <TableRow 
                  key={doc.id} 
                  className={cn(
                    "group cursor-pointer",
                    isSelected && "bg-primary/5"
                  )}
                  onClick={() => onView(doc)}
                >
                  {selectionMode && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={(checked) => onSelectDocument?.(doc, !!checked)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="h-9 w-9 rounded-lg bg-secondary/50 flex items-center justify-center">
                      <Icon className={cn("h-4 w-4", typeColors[doc.type])} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{doc.name}</span>
                      {doc.starred && (
                        <Star className="h-3 w-3 fill-warning text-warning" />
                      )}
                    </div>
                    {doc.patientName && (
                      <p className="text-xs text-muted-foreground">Patient: {doc.patientName}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-normal">
                      {doc.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs font-normal", statusStyles[doc.status])}
                    >
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{doc.size}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{doc.uploadedAt}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onView(doc)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDownload(doc)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onShare(doc)}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        {onToggleStar && (
                          <DropdownMenuItem onClick={() => onToggleStar(doc)}>
                            <Star className={cn("h-4 w-4 mr-2", doc.starred && "fill-current")} />
                            {doc.starred ? "Remove Star" : "Add Star"}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDelete(doc)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onView={onView}
          onDownload={onDownload}
          onDelete={onDelete}
          onShare={onShare}
          isSelected={selectedDocuments.has(doc.id)}
          onSelect={onSelectDocument}
          onToggleStar={onToggleStar}
          selectionMode={selectionMode}
        />
      ))}
    </div>
  );
}
