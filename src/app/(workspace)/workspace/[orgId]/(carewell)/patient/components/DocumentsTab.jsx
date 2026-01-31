import React, { useState, useRef } from 'react';
import { Plus, FileText, Trash2, Download, Eye, Upload, File, Image, FileCheck, Shield, Send, TestTube, Scan, Pill, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DOCUMENT_TYPES } from '../types';
import { useToast } from '@/hooks/use-toast';

const TYPE_ICONS = {
  lab_report: TestTube,
  radiology: Scan,
  prescription: Pill,
  discharge: FileText,
  referral: Send,
  insurance: Shield,
  consent: FileCheck,
  other: File,
};

export function DocumentsTab({ patient, onUpdatePatient }) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const [newDocument, setNewDocument] = useState({
    name: '',
    type: 'lab_report',
    notes: '',
    file: null,
  });

  const documents = patient?.documents || [];

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit file size to 10MB (demo purposes - no actual upload)
      if (file.size > 10 * 1024 * 1024) {
        toast({ 
          title: 'File too large', 
          description: 'Please select a file smaller than 10MB.', 
          variant: 'destructive' 
        });
        return;
      }
      setNewDocument(prev => ({
        ...prev,
        name: prev.name || file.name,
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
      }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ 
          title: 'File too large', 
          description: 'Please select a file smaller than 10MB.', 
          variant: 'destructive' 
        });
        return;
      }
      setNewDocument(prev => ({
        ...prev,
        name: prev.name || file.name,
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
      }));
    }
  };

  const handleUploadDocument = () => {
    if (!newDocument.name) {
      toast({ title: 'Name required', description: 'Please enter a document name.', variant: 'destructive' });
      return;
    }

    const document = {
      id: `doc-${Date.now()}`,
      name: newDocument.name,
      type: newDocument.type,
      notes: newDocument.notes,
      date: new Date(),
      size: newDocument.file?.size || 0,
      fileType: newDocument.file?.type || 'application/pdf',
      url: '#', // In real app, this would be the storage URL
    };

    const updatedPatient = {
      ...patient,
      documents: [document, ...(patient.documents || [])],
    };

    onUpdatePatient?.(updatedPatient);
    toast({ title: 'Document uploaded', description: `${newDocument.name} has been added.` });
    
    setNewDocument({
      name: '',
      type: 'lab_report',
      notes: '',
      file: null,
    });
    setShowUploadDialog(false);
  };

  const handleDeleteDocument = (docId) => {
    const updatedPatient = {
      ...patient,
      documents: patient.documents.filter(d => d.id !== docId),
    };
    onUpdatePatient?.(updatedPatient);
    toast({ title: 'Document deleted', description: 'Document has been removed.' });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getTypeInfo = (typeId) => DOCUMENT_TYPES.find(t => t.id === typeId);

  const isImage = (fileType) => fileType?.startsWith('image/');

  // Group documents by type
  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.type]) acc[doc.type] = [];
    acc[doc.type].push(doc);
    return acc;
  }, {});

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold">Documents</h4>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowUploadDialog(true)}>
          <Plus className="w-3 h-3" />
          Upload Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {DOCUMENT_TYPES.slice(0, 4).map((type) => {
          const count = groupedDocuments[type.id]?.length || 0;
          const Icon = TYPE_ICONS[type.id] || File;
          return (
            <div key={type.id} className="p-3 bg-secondary/30 rounded-lg border border-border text-center">
              <Icon className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">{type.label}s</p>
            </div>
          );
        })}
      </div>

      {documents.length > 0 ? (
        <div className="space-y-3">
          {documents
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((doc) => {
              const typeInfo = getTypeInfo(doc.type);
              const Icon = TYPE_ICONS[doc.type] || File;

              return (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isImage(doc.fileType) ? "bg-purple-100 dark:bg-purple-950" : "bg-primary/10"
                    )}>
                      {isImage(doc.fileType) ? (
                        <Image className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Icon className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          {typeInfo?.label || doc.type}
                        </Badge>
                        <span>•</span>
                        <span>{format(new Date(doc.date), 'dd MMM yyyy')}</span>
                        {doc.size > 0 && (
                          <>
                            <span>•</span>
                            <span>{formatFileSize(doc.size)}</span>
                          </>
                        )}
                      </div>
                      {doc.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">"{doc.notes}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
          <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No documents uploaded</p>
          <p className="text-xs text-muted-foreground mt-1">Upload lab reports, prescriptions, and other medical documents</p>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Document
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Drop Zone */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                newDocument.file && "bg-green-50 dark:bg-green-950/20 border-green-500"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              />
              {newDocument.file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileCheck className="w-8 h-8 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium text-sm">{newDocument.file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(newDocument.file.size)}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewDocument(prev => ({ ...prev, file: null }));
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Drop file here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Document Name *</Label>
                <Input
                  placeholder="e.g., Blood Test Report"
                  value={newDocument.name}
                  onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Document Type</Label>
                <Select 
                  value={newDocument.type} 
                  onValueChange={(val) => setNewDocument({ ...newDocument, type: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Notes (optional)</Label>
              <Textarea
                placeholder="Any additional notes about this document..."
                value={newDocument.notes}
                onChange={(e) => setNewDocument({ ...newDocument, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
            <Button onClick={handleUploadDocument} className="gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Document Preview</p>
                <p className="text-xs text-muted-foreground mt-1">
                  (Preview would show actual document in production)
                </p>
              </div>
            </div>
            {selectedDocument?.notes && (
              <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Notes:</strong> {selectedDocument.notes}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDocument(null)}>Close</Button>
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
