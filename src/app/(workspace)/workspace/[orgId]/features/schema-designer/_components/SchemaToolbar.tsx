import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Download, 
  Upload, 
  FileJson, 
  FileCode, 
  History,
  Sparkles,
  ChevronDown 
} from "lucide-react";

interface SchemaToolbarProps {
  onAddField: () => void;
  onImportJSON: () => void;
  onExportJSON: () => void;
  onExportSQL: () => void;
  onViewHistory: () => void;
  onGenerateAI?: () => void;
  hasFields: boolean;
}

export function SchemaToolbar({
  onAddField,
  onImportJSON,
  onExportJSON,
  onExportSQL,
  onViewHistory,
  onGenerateAI,
  hasFields,
}: SchemaToolbarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onAddField} 
        className="gap-1.5 h-8"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Field
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 h-8">
            <Download className="h-3.5 w-3.5" />
            Import
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="bg-popover">
          <DropdownMenuItem onClick={onImportJSON} className="gap-2">
            <FileJson className="h-4 w-4" />
            Import from JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 h-8"
            disabled={!hasFields}
          >
            <Upload className="h-3.5 w-3.5" />
            Export
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="bg-popover">
          <DropdownMenuItem onClick={onExportJSON} className="gap-2">
            <FileJson className="h-4 w-4" />
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportSQL} className="gap-2">
            <FileCode className="h-4 w-4" />
            Export as SQL
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onViewHistory} 
        className="gap-1.5 h-8"
        disabled={!hasFields}
      >
        <History className="h-3.5 w-3.5" />
        History
      </Button>

      {onGenerateAI && (
        <>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerateAI}
            className="gap-1.5 h-8 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border-primary/20"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI Generate
          </Button>
        </>
      )}
    </div>
  );
}
