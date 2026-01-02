
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  UserRound,
  FlaskConical,
  Pill,
  ScanLine,
  FileSignature,
  Shield,
  ClipboardList,
  File,
  MoreVertical,
  Download,
  Eye,
  Trash2,
  Calendar,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categoryLabels } from "../_data/document";

const categoryIconMap = {
  "patient-records": UserRound,
  "lab-reports": FlaskConical,
  "prescriptions": Pill,
  "imaging": ScanLine,
  "consent-forms": FileSignature,
  "insurance": Shield,
  "discharge-summary": ClipboardList,
  "other": File,
};

const statusStyles = {
  active: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  archived: "bg-muted text-muted-foreground border-border",
};

export function DocumentCard({ document, style, viewMode = "list", onPreview }) {
  const Icon = categoryIconMap[document.category];

  const handlePreview = () => {
    onPreview?.(document);
  };

  if (viewMode === "grid") {
    return (
      <div
        className="group p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover-lift animate-slide-up cursor-pointer"
        style={style}
        onClick={handlePreview}
      >
        {/* Grid View Layout */}
        <div className="flex flex-col h-full">
          {/* Icon & Actions */}
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <Icon className="w-6 h-6" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="gap-2" onClick={handlePreview}>
                  <Eye className="w-4 h-4" /> View Document
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Download className="w-4 h-4" /> Download
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {document.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {categoryLabels[document.category]}
            </p>
            {document.patientName && (
              <p className="text-xs text-muted-foreground mt-2 truncate flex items-center gap-1">
                <User className="w-3 h-3" />
                {document.patientName}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {new Date(document.uploadedAt).toLocaleDateString()}
            </span>
            <span
              className={cn(
                "inline-flex px-2 py-0.5 text-xs font-medium rounded-full border capitalize",
                statusStyles[document.status]
              )}
            >
              {document.status}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // List View Layout
  return (
    <div
      className="group p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover-lift animate-slide-up cursor-pointer"
      style={style}
      onClick={handlePreview}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {document.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {categoryLabels[document.category]}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="gap-2" onClick={handlePreview}>
                  <Eye className="w-4 h-4" /> View Document
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Download className="w-4 h-4" /> Download
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {document.patientName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(document.uploadedAt).toLocaleDateString()}
            </span>
            <span>{document.size}</span>
            <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              {document.fileType}
            </span>
          </div>

          {/* Status Badge */}
          <div className="mt-3">
            <span
              className={cn(
                "inline-flex px-2.5 py-1 text-xs font-medium rounded-full border capitalize",
                statusStyles[document.status]
              )}
            >
              {document.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
