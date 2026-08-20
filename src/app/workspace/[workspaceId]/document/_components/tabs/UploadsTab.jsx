'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/global/EmptyState';
import { Upload, Folder as FolderIcon, Clock, FileIcon, Eye, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { createDocument } from '../../_actions/create-document';
import { toast } from 'sonner';

export function UploadsTab({
    workspaceId,
    documents = [],
    loading = false,
    availableFolders = [],
    uploadTargetFolderId = 'root',
    setUploadTargetFolderId,
    onViewDocument,
    onUploadSuccess
}) {
    const [dragOver, setDragOver] = useState(false);
    const [uploadQueue, setUploadQueue] = useState([]);
    const fileInputRef = useRef(null);

    const uploadedFiles = useMemo(() => documents.filter(d => !d.isFolder), [documents]);

    const startUploadFile = async (file, targetFolderId = null) => {
        if (!file || !workspaceId) return;

        const effectiveFolderId = targetFolderId || (uploadTargetFolderId !== 'root' ? uploadTargetFolderId : null);
        const queueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const sizeFormatted = file.size > 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${(file.size / 1024).toFixed(0)} KB`;

        const newQueueItem = {
            id: queueId,
            name: file.name,
            size: sizeFormatted,
            progress: 10,
            status: 'uploading'
        };

        setUploadQueue(prev => [newQueueItem, ...prev]);

        try {
            const fileExt = file.name.split('.').pop() || '';
            const sanitizedBase = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
            const storageFileName = `${Date.now()}_${sanitizedBase}.${fileExt}`;
            const filePath = `workspace_${workspaceId}/${storageFileName}`;

            setUploadQueue(prev => prev.map(q => q.id === queueId ? { ...q, progress: 30 } : q));

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('devlomatix')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            setUploadQueue(prev => prev.map(q => q.id === queueId ? { ...q, progress: 70 } : q));

            const { data: { publicUrl } } = supabase.storage
                .from('devlomatix')
                .getPublicUrl(filePath);

            let category = 'GENERAL';
            const mime = file.type || '';
            if (mime.startsWith('image/')) category = 'IMAGE';
            else if (mime === 'application/pdf') category = 'SPECIFICATION';
            else if (mime.includes('spreadsheet') || mime.includes('excel')) category = 'FINANCE';
            else if (mime.startsWith('video/')) category = 'MARKETING';

            const res = await createDocument(workspaceId, {
                name: file.name,
                fileUrl: publicUrl,
                fileKey: uploadData.path,
                fileSize: file.size,
                fileType: file.type || 'application/octet-stream',
                extension: fileExt ? `.${fileExt}` : null,
                isFolder: false,
                parentId: effectiveFolderId,
                category,
                status: 'APPROVED',
                tags: []
            });

            if (!res.success) throw new Error(res.error);

            setUploadQueue(prev => prev.map(q => q.id === queueId ? { ...q, progress: 100, status: 'completed' } : q));
            toast.success(`"${file.name}" uploaded successfully`);

            if (onUploadSuccess) onUploadSuccess();

            setTimeout(() => {
                setUploadQueue(prev => prev.filter(q => q.id !== queueId));
            }, 3000);
        } catch (error) {
            console.error("Direct upload error:", error);
            toast.error(error.message || "Failed to upload file");
            setUploadQueue(prev => prev.map(q => q.id === queueId ? { ...q, status: 'error' } : q));
        }
    };

    const handleFileInputChange = (e) => {
        const files = Array.from(e.target.files || []);
        files.forEach(f => startUploadFile(f));
        if (e.target) e.target.value = '';
    };

    const handleDropUpload = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files || []);
        files.forEach(f => startUploadFile(f));
    };

    return (
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 transition-opacity duration-150 ${loading && documents.length > 0 ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
            {/* Target Destination Folder Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-card/80 border border-border/60 rounded-xl backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <FolderIcon className="w-4 h-4 text-amber-500" />
                    <div>
                        <p className="text-xs font-bold text-foreground">Upload Destination Folder</p>
                        <p className="text-[10px] text-muted-foreground">Files dropped or uploaded here will be stored in this directory</p>
                    </div>
                </div>
                <div className="w-full sm:w-64">
                    <Select value={uploadTargetFolderId} onValueChange={setUploadTargetFolderId}>
                        <SelectTrigger className="h-8 text-xs font-semibold bg-background rounded-lg border-border/60">
                            <SelectValue placeholder="Select target folder" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg max-h-56">
                            <SelectItem value="root" className="text-xs font-semibold">📁 [Root Directory] (Main Workspace)</SelectItem>
                            {availableFolders.map((f) => (
                                <SelectItem key={f.id} value={f.id} className="text-xs font-semibold">
                                    📁 {f.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <Card
                className={`border-2 border-dashed p-10 text-center transition-all duration-200 cursor-pointer rounded-2xl ${dragOver
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-border/60 bg-card/60 hover:bg-muted/10 hover:border-primary/40"
                    }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDropUpload}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Upload className="h-7 w-7 text-primary" />
                </div>
                <p className="font-bold text-sm text-foreground">Click to browse or drop files here</p>
                <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-wider">
                    PDF • DOCX • XLSX • PNG • JPG • MP4 • MP3 (UP TO 50 MB)
                </p>
            </Card>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                className="hidden"
                multiple
            />

            {/* Active Upload Queue */}
            {uploadQueue.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Upload Progress ({uploadQueue.length})
                    </h3>
                    <div className="space-y-2">
                        {uploadQueue.map((item) => (
                            <Card key={item.id} className="p-3.5 border border-border/60 bg-card flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <Upload className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold truncate text-foreground">{item.name}</span>
                                            <span className="text-[10px] font-mono text-muted-foreground">{item.size}</span>
                                        </div>
                                        {item.status === 'uploading' && (
                                            <Progress value={item.progress} className="h-1.5" />
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload History Table */}
            <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Recently Uploaded Files
                </h3>
                <Card className="border border-border/60 bg-card/80 backdrop-blur-md rounded-xl overflow-hidden divide-y divide-border/30">
                    {loading && uploadedFiles.length === 0 ? (
                        <div className="p-8 space-y-3 animate-pulse">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-8 bg-muted/30 rounded-lg" />
                            ))}
                        </div>
                    ) : uploadedFiles.length === 0 ? (
                        <div className="p-12 text-center">
                            <EmptyState
                                icon={Clock}
                                title="No Uploads Yet"
                                description="Files you upload in this workspace will appear here."
                            />
                        </div>
                    ) : (
                        uploadedFiles.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">
                                        <FileIcon className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-foreground truncate">{doc.name}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(0)} KB` : 'Unknown size'} • {format(new Date(doc.createdAt), "yyyy-MM-dd HH:mm")}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onViewDocument(doc)}
                                        className="h-7 text-xs font-semibold gap-1 text-primary hover:bg-primary/10"
                                    >
                                        <Eye className="w-3.5 h-3.5" /> View
                                    </Button>
                                    {doc.fileUrl && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                            className="h-7 text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground"
                                        >
                                            <a href={doc.fileUrl} download>
                                                <Download className="w-3.5 h-3.5" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </Card>
            </div>
        </div>
    );
}
