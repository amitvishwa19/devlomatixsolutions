import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
//import { MultiSelectCombobox } from "@/components/MultiSelectCombobox";
import { Download, FileText, Image, File, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { categoryLabels } from "../_data/document";
import { MultiSelectCombobox } from "./MultiSelectCombobox";

const mockUsers = [
  { value: "1", label: "Dr. Sarah Johnson", role: "doctor", department: "cardiology" },
  { value: "2", label: "Dr. Michael Chen", role: "doctor", department: "radiology" },
  { value: "3", label: "Emily Davis", role: "nurse", department: "emergency" },
  { value: "4", label: "Dr. Robert Wilson", role: "doctor", department: "surgery" },
  { value: "5", label: "Lisa Brown", role: "admin", department: "general" },
];
const recentAssignmentIds = ["1", "3", "4"];

export function DocumentPreviewModal({ document, open, onOpenChange }) {
  const [assignedUsers, setAssignedUsers] = useState([]);
  const { toast } = useToast();
  if (!document) return null;
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(document.fileType.toLowerCase());
  const isPDF = document.fileType.toLowerCase() === "pdf";
  const handleAssign = () => { if (assignedUsers.length === 0) return; const names = assignedUsers.map((id) => mockUsers.find((u) => u.value === id)?.label).filter(Boolean).join(", "); toast({ title: "Document Assigned", description: `${document.name} assigned to ${names}.` }); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between"><div>
            <DialogTitle className="text-lg">{document.name}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{categoryLabels[document.category]} • {document.size} • {document.fileType.toUpperCase()}</p>
          </div>
            <Button variant="outline" size="sm" className="gap-2"><Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-4">
          {isPDF && <div className="w-full max-w-2xl aspect-[3/4] bg-card rounded-lg border border-border flex flex-col items-center justify-center gap-4 shadow-lg"><FileText className="w-16 h-16 text-primary/60" /><div className="text-center"><h3 className="font-medium text-foreground">{document.name}</h3><p className="text-sm text-muted-foreground mt-1">PDF Document Preview</p></div></div>}
          {isImage && <div className="max-w-2xl max-h-full bg-card rounded-lg border border-border overflow-hidden shadow-lg"><div className="aspect-video w-full min-w-[400px] bg-gradient-to-br from-primary/20 to-secondary/20 flex flex-col items-center justify-center gap-4"><Image className="w-16 h-16 text-primary/60" /><div className="text-center"><h3 className="font-medium text-foreground">{document.name}</h3></div></div></div>}
          {!isPDF && !isImage && <div className="flex flex-col items-center justify-center gap-4 p-8"><div className="p-6 rounded-full bg-muted"><File className="w-12 h-12 text-muted-foreground" /></div><p className="text-sm text-muted-foreground">Preview not available</p></div>}
        </div>
        <div className="p-4 border-t border-border bg-card shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span>Uploaded by: <span className="text-foreground">{document.uploadedBy}</span>
              </span>
              <span>Date: <span className="text-foreground">{new Date(document.uploadedAt).toLocaleDateString()}</span></span></div>
            <div className="flex items-center gap-2">
              <Label htmlFor="assignTo" className="text-sm whitespace-nowrap">Assign to:</Label>
              <MultiSelectCombobox
                options={mockUsers}
                selected={assignedUsers}
                onChange={setAssignedUsers}
                placeholder="Select users"
                recentIds={recentAssignmentIds}
                groupByDepartment={true}
              />
              <Button
                size="sm"
                onClick={handleAssign}
                disabled={assignedUsers.length === 0}
                className="gap-1">
                <UserPlus className="w-4 h-4" />
                Assign
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
