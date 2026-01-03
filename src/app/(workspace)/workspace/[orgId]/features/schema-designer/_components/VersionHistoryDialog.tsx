import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { History, RotateCcw, Clock, FileText } from "lucide-react";
import { format } from "date-fns";

interface Version {
  id: string;
  version: number;
  schema_definition: string;
  created_at: string;
}

interface VersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableName: string;
  onRestore: (schema: string) => void;
}

export function VersionHistoryDialog({
  open,
  onOpenChange,
  tableName,
  onRestore,
}: VersionHistoryDialogProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  useEffect(() => {
    if (open && tableName) {
      loadVersions();
    }
  }, [open, tableName]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      // For now, we'll show the current version from database_designer
      // In a full implementation, you'd have a separate versions table
      const { data, error } = await supabase
        .from('database_designer')
        .select('*')
        .eq('table_name', tableName)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Simulate version history with current state
        const mockVersions: Version[] = [
          {
            id: data.id,
            version: 1,
            schema_definition: data.schema_definition,
            created_at: data.updated_at,
          }
        ];
        setVersions(mockVersions);
        setSelectedVersion(mockVersions[0]);
      }
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = () => {
    if (selectedVersion) {
      onRestore(selectedVersion.schema_definition);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </DialogTitle>
          <DialogDescription>
            View and restore previous versions of your schema
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[300px_1fr] gap-4 mt-4">
          <ScrollArea className="h-[400px] border rounded-lg">
            <div className="p-2 space-y-1">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading versions...
                </div>
              ) : versions.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No version history available
                </div>
              ) : (
                versions.map((version) => (
                  <button
                    key={version.id}
                    onClick={() => setSelectedVersion(version)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedVersion?.id === version.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Version {version.version}</span>
                      {version.version === versions[0]?.version && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(version.created_at), 'MMM d, yyyy h:mm a')}
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="border rounded-lg p-4">
            {selectedVersion ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Schema Preview</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRestore}
                    className="gap-1.5"
                    disabled={selectedVersion.version === versions[0]?.version}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore
                  </Button>
                </div>
                <ScrollArea className="h-[340px]">
                  <pre className="text-sm font-mono bg-muted p-4 rounded-lg whitespace-pre-wrap">
                    {selectedVersion.schema_definition}
                  </pre>
                </ScrollArea>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a version to preview
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
