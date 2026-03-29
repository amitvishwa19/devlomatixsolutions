'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Star,
  Filter,
  LayoutGrid,
  History,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import AppImage from "@/components/ui/AppImage";
import { clientLogger } from "@/utils/logger";
import { ImageEditor } from './ImageEditor';
import { toast } from 'sonner';
import { uploader } from '@/lib/uploadthing';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
  const [activeFilter, setActiveFilter] = useState('all'); // all, starred, recent

  useEffect(() => {
    if (isModalOpen && workspaceId) {
      fetchDocuments();
    }
  }, [isModalOpen, workspaceId]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/workspace/${workspaceId}/document?isFolder=false`);
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
      onSelect?.(selectedUrl);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedUrl(null);
    setSearch('');
    onClose("mediaLibrary");
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || 
                 doc.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
      
      if (!matchesSearch) return false;

      if (activeFilter === 'starred') return doc.isStarred;
      if (activeFilter === 'recent') {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return new Date(doc.createdAt) > oneDayAgo;
      }
      return true;
    });
  }, [documents, search, activeFilter]);

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="min-w-[85vw] max-w-[85vw] min-h-[85vh] h-[85vh] max-h-[85vh] bg-background border border-border rounded-2xl shadow-2xl p-0 overflow-hidden flex flex-col">
        {/* Modern Header */}
        <DialogHeader className="px-8 py-5 border-b border-border/40 bg-muted/5 flex flex-row items-center justify-between shrink-0">
          <div className="space-y-1 text-left">
            <DialogTitle className="text-xl text-foreground flex items-center gap-3 tracking-tight uppercase">
              <Sparkles className="text-primary h-5 w-5 animate-pulse-slow" /> Media Hub 2.0
            </DialogTitle>
            <p className="text-[10px] text-muted-foreground opacity-40 tracking-widest uppercase">
              Manage & Optimize Workspace Assets
            </p>
          </div>

          <div className="flex items-center gap-4 flex-1 max-w-xl mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors opacity-50" />
              <Input
                placeholder="Search by name or smart tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 bg-background border-border/60 h-11 text-xs font-bold rounded-xl shadow-inner focus-visible:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full hover:bg-muted">
              <X className="w-5 h-5 text-muted-foreground" />
             </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* New Sidebar */}
          <div className="w-64 border-r border-border/40 bg-muted/2 p-6 flex flex-col gap-6 shrink-0">
            <div className="space-y-2">
               <p className="text-[9px] text-muted-foreground/50 tracking-widest uppercase mb-4 px-2">Library View</p>
               <Button 
                variant={activeFilter === 'all' ? 'secondary' : 'ghost'} 
                onClick={() => setActiveFilter('all')}
                className={cn("w-full justify-start gap-3 h-10 font-bold text-xs rounded-lg transition-all", activeFilter === 'all' ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground")}
               >
                 <LayoutGrid size={16} /> All Assets
               </Button>
               <Button 
                variant={activeFilter === 'recent' ? 'secondary' : 'ghost'} 
                onClick={() => setActiveFilter('recent')}
                className={cn("w-full justify-start gap-3 h-10 font-bold text-xs rounded-lg transition-all", activeFilter === 'recent' ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground")}
               >
                 <History size={16} /> Recently Added
               </Button>
               <Button 
                variant={activeFilter === 'starred' ? 'secondary' : 'ghost'} 
                onClick={() => setActiveFilter('starred')}
                className={cn("w-full justify-start gap-3 h-10 font-bold text-xs rounded-lg transition-all", activeFilter === 'starred' ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground")}
               >
                 <Star size={16} /> Starred Items
               </Button>
            </div>

            <Separator className="bg-border/10" />

            <div className="space-y-4">
              <p className="text-[9px] text-muted-foreground/50 tracking-widest uppercase px-2">Quick Actions</p>
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 space-y-3">
                <p className="text-[10px] font-bold text-primary leading-tight">Need a professional cover image?</p>
                <Button size="sm" className="w-full h-8 text-[9px] bg-primary text-primary-foreground rounded-lg shadow-lg shadow-primary/10">
                  <Sparkles size={12} className="mr-2" /> AI Image Gen
                </Button>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="flex-1 overflow-hidden relative">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                  <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
                </div>
                <p className="text-[10px] text-primary tracking-widest uppercase animate-pulse">Syncing Cloud Assets...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
                <div className="p-8 bg-muted/20 rounded-full">
                  <FolderOpen className="h-20 w-20 text-muted-foreground/30" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-lg text-foreground">Archive Empty</h3>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">No matching assets found in this workspace branch</p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-8">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedUrl(doc.fileUrl)}
                      className={cn(
                        "group relative cursor-pointer transition-all duration-500 rounded-2xl overflow-hidden border-2",
                        selectedUrl === doc.fileUrl
                          ? "border-primary shadow-2xl shadow-primary/10 scale-[1.03] z-10"
                          : "border-border/60 hover:border-primary/40 bg-card hover:shadow-xl hover:translate-y-[-4px]"
                      )}
                    >
                      <div className="aspect-square relative flex items-center justify-center overflow-hidden bg-muted/20">
                        <AppImage 
                          src={doc.fileUrl} 
                          alt={doc.name}
                          fill
                          className="transition-transform group-hover:scale-110 duration-700"
                        />
                        {/* Meta Overlay */}
                        <div className="absolute top-2 right-2 flex gap-1 transform translate-y-[-200%] group-hover:translate-y-0 transition-transform duration-500">
                          {doc.isStarred && <div className="bg-amber-500 text-white p-1 rounded-md shadow-lg"><Star size={10} fill="currentColor" /></div>}
                          <div className="bg-background/80 backdrop-blur-md text-[8px] p-1 px-1.5 rounded-md border border-border/10 uppercase shadow-sm">
                            {doc.extension?.replace('.', '') || 'IMG'}
                          </div>
                        </div>

                        {selectedUrl === doc.fileUrl && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[2px] z-10">
                            <div className="bg-primary text-white p-3 rounded-full shadow-2xl scale-110 animate-in zoom-in-50">
                              <CheckCircle2 size={24} className="stroke-[3px]" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-background/90 backdrop-blur-xl border-t border-border/10">
                        <p className="text-[10px] truncate text-foreground group-hover:text-primary transition-colors leading-tight mb-1">
                          {doc.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-bold text-muted-foreground/60">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                          {doc.tags?.length > 0 && (
                            <Badge className="h-3 text-[7px] bg-primary/10 text-primary border-none">
                              {doc.tags[0].toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Footer with Actions */}
        <DialogFooter className="px-8 py-5 border-t border-border/40 bg-muted/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {selectedUrl && (
              <div className="flex items-center gap-2 animate-in slide-in-from-left-4">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-primary/20 shadow-sm relative">
                   <AppImage src={selectedUrl} alt="Selected" fill className="object-cover" />
                </div>
                <p className="text-[9px] text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 tracking-widest uppercase">
                  Asset Selected
                </p>
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              disabled={!selectedUrl || isLoading}
              onClick={() => setIsEditing(true)}
              className="h-10 px-4 text-[10px] text-primary border-primary/30 hover:bg-primary/5 rounded-xl transition-all"
            >
              <Crop size={14} className="mr-2" /> Refine Media
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="px-6 rounded-xl text-muted-foreground text-[10px] uppercase tracking-widest hover:bg-muted"
            >
              Dismiss
            </Button>
            <Button
              type="button"
              disabled={!selectedUrl}
              onClick={handleSelect}
              className="px-10 h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
            >
              Embed into Article
            </Button>
          </div>
        </DialogFooter>

        {isEditing && (
          <div className="absolute inset-0 z-[100] bg-background animate-in slide-in-from-bottom-full duration-500">
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
