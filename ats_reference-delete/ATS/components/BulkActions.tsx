import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Mail, ArrowRight, Trash2, X, Users, Send } from "lucide-react";
import { useAts } from "@/ATS/context/AtsContext";
import { stages, Stage } from "@/ATS/data/mockData";
import { toast } from "sonner";

const BulkActions = ({ selectedIds, onClear }: { selectedIds: string[]; onClear: () => void }) => {
  const { updateCandidateStage, candidates } = useAts();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const selectedCandidates = candidates.filter((c) => selectedIds.includes(c.id));

  const handleBulkStageChange = (stage: string) => {
    selectedIds.forEach((id) => updateCandidateStage(id, stage as Stage));
    toast.success(`${selectedIds.length} candidates moved to ${stage}`);
    onClear();
  };

  const handleBulkEmail = () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error("Please fill in subject and body");
      return;
    }
    toast.success(`Email sent to ${selectedIds.length} candidates`);
    setEmailDialogOpen(false);
    setEmailSubject("");
    setEmailBody("");
  };

  const handleBulkReject = () => {
    selectedIds.forEach((id) => updateCandidateStage(id, "rejected"));
    toast.success(`${selectedIds.length} candidates rejected`);
    onClear();
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">{selectedIds.length} selected</span>
      </div>

      <div className="h-4 w-px bg-border" />

      {/* Move to Stage */}
      <Select onValueChange={handleBulkStageChange}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <div className="flex items-center gap-1">
            <ArrowRight className="h-3 w-3" />
            <SelectValue placeholder="Move to..." />
          </div>
        </SelectTrigger>
        <SelectContent>
          {stages.filter((s) => s.key !== "rejected").map((s) => (
            <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Bulk Email */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 h-8 text-xs">
            <Mail className="h-3 w-3" /> Email
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Bulk Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Sending to: {selectedCandidates.map((c) => c.name).join(", ")}
            </div>
            <input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Email subject..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
            <Textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Email body... Use {{name}} for personalization"
              className="min-h-[150px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleBulkEmail} className="gap-1">
                <Send className="h-3.5 w-3.5" /> Send to {selectedIds.length}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Reject */}
      <Button variant="outline" size="sm" className="gap-1 h-8 text-xs text-destructive hover:text-destructive" onClick={handleBulkReject}>
        <Trash2 className="h-3 w-3" /> Reject
      </Button>

      {/* Clear */}
      <Button variant="ghost" size="sm" className="gap-1 h-8 text-xs ml-auto" onClick={onClear}>
        <X className="h-3 w-3" /> Clear
      </Button>
    </div>
  );
};

export default BulkActions;
