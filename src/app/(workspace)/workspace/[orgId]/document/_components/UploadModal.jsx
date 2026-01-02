import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { categoryLabels } from "../_data/document";

export function UploadModal({ open, onOpenChange }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [assignToPatient, setAssignToPatient] = useState(false);
  const [patientName, setPatientName] = useState("");
  const { toast } = useToast();

  const imagePreviewUrl = useMemo(() => {
    if (file && file.type.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!file || !category || !documentName) {
      toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    if (assignToPatient && !patientName) {
      toast({ title: "Missing Information", description: "Please enter patient name.", variant: "destructive" });
      return;
    }
    toast({ title: "Document Uploaded", description: `${documentName} has been successfully uploaded.` });
    setFile(null); setCategory(""); setDocumentName(""); setAssignToPatient(false); setPatientName("");
    onOpenChange(false);
  };

  const handleRemoveFile = () => { if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl); setFile(null); };
  const categories = Object.keys(categoryLabels);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Upload Document</DialogTitle>
          <DialogDescription>Add a new document to the hospital management system.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className={cn("border-2 border-dashed rounded-xl text-center transition-all duration-200 relative overflow-hidden h-40", dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50", file && "border-success bg-success/5")} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
            {file ? (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                {imagePreviewUrl ? <img src={imagePreviewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg" /> : <div className="text-center"><div className="w-12 h-12 mx-auto rounded-full bg-success/20 flex items-center justify-center"><FileUp className="w-6 h-6 text-success" /></div><p className="font-medium text-foreground mt-2">{file.name}</p><p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>}
                <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="absolute top-2 right-2 h-8 w-8 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive"><X className="w-4 h-4" /></Button>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4"><div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><FileUp className="w-6 h-6 text-primary" /></div><div className="mt-3"><p className="font-medium text-foreground">Drop your file here or <label className="text-primary cursor-pointer hover:underline">browse<input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dicom" /></label></p><p className="text-sm text-muted-foreground mt-1">PDF, DOC, JPEG, PNG, DICOM (max 50MB)</p></div></div>
            )}
          </div>
          <div className="space-y-4">
            <div className="space-y-2"><Label htmlFor="documentName">Document Name</Label><Input id="documentName" placeholder="Enter document name" value={documentName} onChange={(e) => setDocumentName(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="category">Document Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger><SelectContent>{categories.map((cat) => <SelectItem key={cat} value={cat}>{categoryLabels[cat]}</SelectItem>)}</SelectContent></Select></div>
            <div className="flex items-center space-x-2"><Checkbox id="assignToPatient" checked={assignToPatient} onCheckedChange={(checked) => setAssignToPatient(checked === true)} /><Label htmlFor="assignToPatient" className="cursor-pointer">Assign to patient</Label></div>
            {assignToPatient && <div className="space-y-2 animate-fade-in"><Label htmlFor="patient">Patient Name</Label><Input id="patient" placeholder="Enter patient name" value={patientName} onChange={(e) => setPatientName(e.target.value)} /></div>}
          </div>
          <div className="flex gap-3 pt-2"><Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="gradient" className="flex-1" onClick={handleSubmit}><Upload className="w-4 h-4 mr-2" />Upload Document</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
