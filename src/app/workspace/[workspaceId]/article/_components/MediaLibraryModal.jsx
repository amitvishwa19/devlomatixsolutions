'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModal } from "@/hooks/useModal";
import axios from "@/utils/axios";
import {
    Loader2,
    Search,
    Image as ImageIcon,
    Check,
    X,
    FolderOpen,
    FileImage,
    Crop,
    Sliders,
    PenTool
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import AppImage from "@/components/ui/AppImage";
import { clientLogger } from "@/utils/logger";
import { ImageEditor } from './ImageEditor';
import { toast } from 'sonner';
import { uploader } from '@/lib/uploadthing';

export const MediaLibraryModal = () => {
    const { isOpen, onClose, type, data, activeModals } = useModal();
    const isModalOpen = !!activeModals["mediaLibrary"];
    const modalData = activeModals["mediaLibrary"] || {};
    const { workspaceId, onSelect } = modalData;

    const [isLoading, setIsLoading] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedUrl, setSelectedUrl] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (isModalOpen && workspaceId) {
            fetchDocuments();
        }
    }, [isModalOpen, workspaceId]);

    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            // Fetch documents that are NOT folders
            const res = await axios.get(`/api/workspace/${workspaceId}/document?isFolder=false`);
            // Filter for images (Robust check for mime type or extension)
            const images = res.data.filter(doc =>
                doc.fileType?.startsWith('image/') ||
                ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(doc.extension?.toLowerCase())
            );
            setDocuments(images);
        } catch (error) {
            console.error("[MEDIA_LIBRARY_FETCH]", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = async () => {
        if (selectedUrl) {
            await clientLogger.info(workspaceId, `Media Selected: ${selectedUrl?.split('/').pop()}`, { url: selectedUrl }, 'SYSTEM');
            onSelect?.(selectedUrl);
            handleClose();
        }
    };

    const handleSaveEditedImage = async (blob) => {
        setIsLoading(true);
        try {
            const originalDoc = documents.find(d => d.fileUrl === selectedUrl);
            const fileName = originalDoc ? `Edited_${originalDoc.name}` : `edited_image_${Date.now()}.webp`;
            const file = new File([blob], fileName, { type: 'image/webp' });

            // 1. Upload to UploadThing
            const uploadRes = await uploader.uploadFiles("documentUploader", {
                 files: [file]
            });

            if (!uploadRes?.[0]?.url) throw new Error("Upload failed");

            const newUrl = uploadRes[0].url;
            const fileKey = uploadRes[0].key;

            // 2. Save document record in DB
            await axios.post(`/api/workspace/${workspaceId}/document`, {
                name: fileName,
                fileUrl: newUrl,
                fileKey: fileKey,
                fileType: 'image/webp',
                fileSize: blob.size,
                workspaceId,
                userId: modalData.userId || 'system', // Use current user if available
                isFolder: false
            });

            toast.success("Image refined and saved successfully!");
            await fetchDocuments(); // Refresh list
            setSelectedUrl(newUrl); // Select the new one
            setIsEditing(false);
        } catch (error) {
            console.error("[IMAGE_EDIT_SAVE]", error);
            toast.error("Failed to save edited image");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedUrl(null);
        setSearch('');
        onClose("mediaLibrary");
    };

    const filteredDocuments = documents.filter(doc =>
        doc.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="min-w-[70vw] max-w-[70vw] min-h-[70vh] h-[70vh] max-h-[70vh] bg-background border border-border/100 rounded-xl shadow-2xl p-0 overflow-hidden flex flex-col">
                <DialogHeader className="px-8 py-6 border-b border-border/10 flex flex-row items-center justify-between shrink-0">
                    <div className="space-y-1 text-left">
                        <DialogTitle className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                            <FileImage className="text-primary h-6 w-6" /> Media Library
                        </DialogTitle>
                        <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase opacity-70">
                            Select assets from your workspace documents
                        </p>
                    </div>
                    <div className="flex items-center gap-4 flex-1 max-w-md ml-8">
                        <div className="relative w-full group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search library..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 bg-muted/20 border-border/10 h-10 text-xs font-bold"
                            />
                        </div>
                    </div>

                </DialogHeader>

                <div className="flex-1 overflow-hidden bg-muted/5">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                            <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase animate-pulse">Scanning Archive...</p>
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
                            <FolderOpen className="h-16 w-16 text-muted-foreground" />
                            <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">No images found in this workspace</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-full p-8 px-10">
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                {filteredDocuments.map((doc) => (
                                    <div
                                        key={doc.id}
                                        onClick={() => setSelectedUrl(doc.fileUrl)}
                                        className={cn(
                                            "group relative cursor-pointer transition-all duration-300 rounded-xl overflow-hidden border-2",
                                            selectedUrl === doc.fileUrl
                                                ? "border-primary shadow-xl shadow-primary/20 scale-105"
                                                : "border-border/100 hover:border-primary/40 bg-card hover:shadow-lg"
                                        )}
                                    >
                                        <div className="aspect-square relative flex items-center justify-center overflow-hidden bg-muted/20 rounded-lg">
                                            <AppImage 
                                                src={doc.fileUrl} 
                                                alt={doc.name}
                                                fill
                                                className="transition-transform group-hover:scale-110 duration-500"
                                            />
                                            {selectedUrl === doc.fileUrl && (
                                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[2px] z-10">
                                                    <div className="bg-primary text-white p-2 rounded-full shadow-lg scale-110 animate-in zoom-in-50">
                                                        <Check size={20} className="stroke-[3px]" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 bg-background/80 backdrop-blur-md border-t border-border/10">
                                            <p className="text-[9px] font-bold truncate text-foreground group-hover:text-primary transition-colors tracking-tight">
                                                {doc.name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <DialogFooter className="px-8 py-6 border-t border-border/10 bg-muted/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        {selectedUrl && (
                            <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase bg-muted/30 px-3 py-1.5 rounded-md border border-border/10">
                                1 Asset Selected
                            </p>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            disabled={!selectedUrl || isLoading}
                            onClick={() => setIsEditing(true)}
                            className="h-auto p-2 text-[9px] font-bold text-primary border-primary/20 hover:bg-primary/5 ml-2"
                        >
                            <Crop size={12} className="mr-1" /> Edit Asset
                        </Button>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            className="px-6 rounded-md font-bold text-muted-foreground uppercase tracking-widest text-[10px]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={!selectedUrl}
                            onClick={handleSelect}
                            className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-extrabold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            Insert into Post
                        </Button>
                    </div>
                </DialogFooter>

                {isEditing && (
                    <div className="absolute inset-0 z-[100] bg-background">
                        <ImageEditor 
                            imageUrl={selectedUrl} 
                            onCancel={() => setIsEditing(false)}
                            onSave={handleSaveEditedImage}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
