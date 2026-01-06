import { useState } from "react";
import { Upload, X, Check } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function UploadDocumentDialog({ open, onOpenChange, onUpload }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("");
  const [patientId, setPatientId] = useState("");
  const [notes, setNotes] = useState("");

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setDragActive(true); else if (e.type === "dragleave") setDragActive(false); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]); };
  const handleFileChange = (e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); };
  const handleSubmit = () => { onUpload({ file, category, patientId, notes }); setFile(null); setCategory(""); setPatientId(""); setNotes(""); onOpenChange(false); };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[450px]">
        <SheetHeader><SheetTitle>Upload Document</SheetTitle><SheetDescription>Upload a new document. Supported: PDF, Images, Word, Excel.</SheetDescription></SheetHeader>
        <ScrollArea className="h-[calc(100vh-140px)] mt-4">
          <div className="space-y-4 pr-4">
            <div className={cn("border-2 border-dashed rounded-xl p-8 text-center transition-colors", dragActive ? "border-primary bg-primary/5" : "border-border", file && "border-success bg-success/5")} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
              {file ? (<div className="flex items-center justify-center gap-3"><div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center"><Check className="h-5 w-5 text-success" /></div><div className="text-left"><p className="text-sm font-medium">{file.name}</p><p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div><Button variant="ghost" size="icon" className="h-8 w-8 ml-2" onClick={() => setFile(null)}><X className="h-4 w-4" /></Button></div>) : (<><Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" /><p className="text-sm mb-1">Drag and drop your file here</p><p className="text-xs text-muted-foreground mb-3">or</p><label><input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" /><Button variant="outline" size="sm" asChild><span>Browse Files</span></Button></label></>)}
            </div>
            <div className="space-y-2"><Label>Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent><SelectItem value="medical-records">Medical Records</SelectItem><SelectItem value="lab-reports">Lab Reports</SelectItem><SelectItem value="prescriptions">Prescriptions</SelectItem><SelectItem value="imaging">Imaging</SelectItem><SelectItem value="administrative">Administrative</SelectItem><SelectItem value="consent-forms">Consent Forms</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Patient ID (Optional)</Label><Input placeholder="Enter patient ID" value={patientId} onChange={(e) => setPatientId(e.target.value)} /></div>
            <div className="space-y-2"><Label>Notes (Optional)</Label><Input placeholder="Add notes" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            <div className="flex justify-end gap-3 pt-4"><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={handleSubmit} disabled={!file || !category}>Upload Document</Button></div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
