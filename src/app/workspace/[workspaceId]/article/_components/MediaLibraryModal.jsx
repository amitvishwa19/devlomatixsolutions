'use client';

import { useState, useEffect, useMemo, useRef } from'react';
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogFooter
} from"@/components/ui/dialog";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { useModal } from"@/hooks/useModal";
import axios from"@/utils/axios";
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
 CheckCircle2,
 UploadCloud,
} from"lucide-react";
import { ScrollArea } from"@/components/ui/scroll-area";
import { cn } from"@/lib/utils";
import AppImage from"@/components/ui/AppImage";
import { clientLogger } from"@/utils/logger";
import { ImageEditor } from'./ImageEditor';
import { toast } from'sonner';
import { Badge } from'@/components/ui/badge';
import { Separator } from'@/components/ui/separator';
import { useSession } from'next-auth/react';
import { supabase } from'@/utils/supabaseClient';

export const MediaLibraryModal = () => {
 const { data: session } = useSession();
 const { isOpen, onClose, type, data, activeModals } = useModal();
 const isModalOpen = !!activeModals["mediaLibrary"];
 const modalData = activeModals["mediaLibrary"] || {};
 const { workspaceId, onSelect } = modalData;

 const fileInputRef = useRef(null);
 const [isLoading, setIsLoading] = useState(false);
 const [isUploading, setIsUploading] = useState(false);
 const [uploadProgress, setUploadProgress] = useState(0);
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
 ['.jpg','.jpeg','.png','.gif','.webp'].includes(doc.extension?.toLowerCase())
 );
 setDocuments(images);
 } catch (error) {
 console.error("[MEDIA_LIBRARY_FETCH]", error);
 } finally {
 setIsLoading(false);
 }
 };

 const handleUploadClick = () => {
 fileInputRef.current?.click();
 };

 const handleFileUpload = async (e) => {
 const file = e.target.files?.[0];
 if (!file) return;

 if (file.size > 4 * 1024 * 1024) {
 toast.error("File size exceeds 4MB limit");
 return;
 }

 setIsUploading(true);
 setUploadProgress(10);

 try {
 const userId = session?.user?.userId || session?.user?.id;
 const fileExt = file.name.split('.').pop();
 const fileName = `${Date.now()}_${file.name.replace(/\.[^/.]+$/,"")}.${fileExt}`;
 const filePath = `workspace_${workspaceId}/media/${fileName}`;

 setUploadProgress(30);

 // Upload to Supabase Storage
 const { data: uploadData, error: uploadError } = await supabase.storage
 .from('devlomatix')
 .upload(filePath, file, {
 cacheControl:'3600',
 upsert: false
 });

 if (uploadError) throw uploadError;

 setUploadProgress(70);

 // Get Public URL
 const { data: { publicUrl } } = supabase.storage
 .from('devlomatix')
 .getPublicUrl(filePath);

 // Sync with Database
 await axios.post(`/api/workspace/${workspaceId}/document`, {
 name: file.name,
 fileUrl: publicUrl,
 fileKey: uploadData.path,
 fileSize: file.size,
 fileType: file.type,
 userId: userId,
 workspaceId: workspaceId,
 isFolder: false,
 category:"IMAGE"
 });

 setUploadProgress(100);
 toast.success("Media uploaded successfully!");
 fetchDocuments();
 setSelectedUrl(publicUrl);
 } catch (error) {
 console.error("[SUPABASE_UPLOAD_ERROR]", error);
 toast.error(error.message ||"Failed to upload media");
 } finally {
 setTimeout(() => {
 setIsUploading(false);
 setUploadProgress(0);
 }, 500);
 if (e.target) e.target.value ="";
 }
 };

 const handleSaveEditedImage = async (blob) => {
 setIsLoading(true);
 try {
 const userId = session?.user?.userId || session?.user?.id;
 const fileName = `refined_${Date.now()}.webp`;
 const filePath = `workspace_${workspaceId}/media/${fileName}`;

 const { data: uploadData, error: uploadError } = await supabase.storage
 .from('devlomatix')
 .upload(filePath, blob);

 if (uploadError) throw uploadError;

 const { data: { publicUrl } } = supabase.storage
 .from('devlomatix')
 .getPublicUrl(filePath);

 await axios.post(`/api/workspace/${workspaceId}/document`, {
 name: fileName,
 fileUrl: publicUrl,
 fileKey: uploadData.path,
 fileSize: blob.size,
 fileType:'image/webp',
 userId: userId,
 workspaceId: workspaceId,
 isFolder: false,
 category:"IMAGE"
 });

 toast.success("Image refined and saved!");
 setIsEditing(false);
 fetchDocuments();
 setSelectedUrl(publicUrl);
 } catch (error) {
 console.error(error);
 toast.error("Failed to save refined image");
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

 if (activeFilter ==='starred') return doc.isStarred;
 if (activeFilter ==='recent') {
 const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
 return new Date(doc.createdAt) > oneDayAgo;
 }
 return true;
 });
 }, [documents, search, activeFilter]);

 return (
 <Dialog open={isModalOpen} onOpenChange={handleClose}>
 <DialogContent className="min-w-[85vw] max-w-[85vw] min-h-[85vh] h-[85vh] max-h-[85vh] bg-background border border-border rounded-md shadow-2xl p-0 overflow-hidden flex flex-col">
 <input
 type="file"
 ref={fileInputRef}
 className="hidden"
 accept="image/*"
 onChange={handleFileUpload}
 />

 {/* Modern Header */}
 <DialogHeader className="px-8 py-5 border-b border-border/40 bg-muted/5 flex flex-row items-center justify-between shrink-0">
 <div className="space-y-1 text-left">
 <DialogTitle className="text-xl text-foreground flex items-center gap-3 tracking-tight uppercase">
 <Sparkles className="text-primary h-5 w-5 animate-pulse-slow"/> Media Hub 2.0
 </DialogTitle>
 <p className="text-[10px] text-muted-foreground opacity-40 tracking-widest uppercase font-black">
 Storage Provider: Supabase Cloud
 </p>
 </div>

 <div className="flex items-center gap-4 flex-1 max-w-xl mx-8">
 <div className="relative w-full group">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors opacity-50"/>
 <Input
 placeholder="Search by name or smart tags..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="pl-11 bg-background border-border/60 h-11 text-xs font-bold rounded-md shadow-inner focus-visible:ring-primary"
 />
 </div>
 </div>
 <div className="flex items-center gap-2">

 </div>
 </DialogHeader>

 <div className="flex-1 flex overflow-hidden">
 {/* Sidebar */}
 <div className="w-72 border-r border-border/40 bg-muted/2 p-6 flex flex-col gap-6 shrink-0 overflow-y-auto">
 <div className="space-y-4 mb-2">
 <p className="text-[9px] text-muted-foreground/50 tracking-widest uppercase px-2 font-black">Upload Center</p>
 <div className="bg-primary/5 rounded-md border border-primary/20 p-5 space-y-4 animate-in zoom-in-95 backdrop-blur-sm">
 <div className="flex flex-col items-center text-center space-y-2">
 <div className="w-10 bg-primary/20 rounded-md flex items-center justify-center text-primary shadow-inner">
 <UploadCloud size={20} />
 </div>
 <p className="text-[10px] font-bold text-foreground">Cloud Storage</p>
 <p className="text-[8px] text-muted-foreground px-4 opacity-60">devlomatix bucket active. Max 4MB.</p>
 </div>
 <Button
 disabled={isUploading}
 onClick={handleUploadClick}
 className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-[9px] h-9 font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95"
 >
 {isUploading ? (
 <div className="flex items-center gap-2">
 <Loader2 className="w-3 h-3 animate-spin"/>
 <span>Uploading... {uploadProgress}%</span>
 </div>
 ) : (
"Select File to Upload"
 )}
 </Button>
 {isUploading && (
 <div className="w-full bg-muted rounded-full h-1 overflow-hidden mt-2">
 <div
 className="bg-primary h-full transition-all duration-300"
 style={{ width: `${uploadProgress}%` }}
 />
 </div>
 )}
 </div>
 </div>

 <Separator className="bg-border/10"/>

 <div className="space-y-2 text-foreground">
 <p className="text-[9px] text-muted-foreground/50 tracking-widest uppercase mb-4 px-2 font-black">Library View</p>
 <Button
 variant={activeFilter ==='all'?'secondary':'ghost'}
 onClick={() => setActiveFilter('all')}
 className={cn("w-full justify-start gap-3 font-bold text-xs rounded-md transition-all", activeFilter ==='all'?"bg-primary/10 text-primary shadow-sm":"text-muted-foreground")}
 >
 <LayoutGrid size={16} /> All Assets
 </Button>
 <Button
 variant={activeFilter ==='recent'?'secondary':'ghost'}
 onClick={() => setActiveFilter('recent')}
 className={cn("w-full justify-start gap-3 font-bold text-xs rounded-md transition-all", activeFilter ==='recent'?"bg-primary/10 text-primary shadow-sm":"text-muted-foreground")}
 >
 <History size={16} /> Recently Added
 </Button>
 <Button
 variant={activeFilter ==='starred'?'secondary':'ghost'}
 onClick={() => setActiveFilter('starred')}
 className={cn("w-full justify-start gap-3 font-bold text-xs rounded-md transition-all", activeFilter ==='starred'?"bg-primary/10 text-primary shadow-sm":"text-muted-foreground")}
 >
 <Star size={16} /> Starred Items
 </Button>
 </div>

 <Separator className="bg-border/10"/>

 <div className="space-y-4">
 <p className="text-[9px] text-muted-foreground/50 tracking-widest uppercase px-2 font-black">Quick Actions</p>
 <div className="bg-indigo-500/5 rounded-md border border-indigo-500/20 p-5 space-y-4 backdrop-blur-sm">
 <div className="space-y-2">
 <p className="text-[10px] font-bold text-indigo-400">AI Enhancement</p>
 <p className="text-[8px] text-muted-foreground opacity-60">Process and upscale assets using Gemini 2.0.</p>
 </div>
 <Button size="sm"className="w-full h-8 text-[9px] bg-indigo-500 hover:bg-indigo-600 text-white rounded-md shadow-lg shadow-indigo-500/20 font-black uppercase tracking-widest">
 <Sparkles size={12} className="mr-2"/> AI Image Gen
 </Button>
 </div>
 </div>
 </div>

 {/* Content Grid */}
 <div className="flex-1 overflow-hidden relative">
 {isLoading ? (
 <div className="h-full flex flex-col items-center justify-center space-y-4">
 <div className="relative">
 <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"/>
 <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10"/>
 </div>
 <p className="text-[10px] text-primary tracking-widest uppercase animate-pulse font-black">Connecting to Storage</p>
 </div>
 ) : filteredDocuments.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
 <div className="p-8 bg-muted/20 rounded-full">
 <FolderOpen className="h-20 w-20 text-muted-foreground/30"/>
 </div>
 <div className="text-center space-y-1">
 <h3 className="text-lg text-foreground font-black">Deep Archive Empty</h3>
 <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">No matching assets found in Supabase Storage</p>
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
"group relative cursor-pointer transition-all duration-500 rounded-md overflow-hidden border-2",
 selectedUrl === doc.fileUrl
 ?"border-primary shadow-2xl shadow-primary/10 scale-[1.03] z-10"
 :"border-border/60 hover:border-primary/40 bg-card/40 hover:shadow-xl hover:translate-y-[-4px]"
 )}
 >
 <div className="aspect-square relative flex items-center justify-center overflow-hidden bg-muted/20">
 <AppImage
 src={doc.fileUrl}
 alt={doc.name}
 fill
 className="transition-transform group-hover:scale-110 duration-700 object-cover"
 />
 <div className="absolute top-2 right-2 flex gap-1 transform translate-y-[-200%] group-hover:translate-y-0 transition-transform duration-500">
 {doc.isStarred && <div className="bg-amber-500 text-white p-1 rounded-md shadow-lg"><Star size={10} fill="currentColor"/></div>}
 <div className="bg-background/80 backdrop-blur-md text-[8px] p-1 px-1.5 rounded-md border border-border/10 font-black uppercase shadow-sm">
 {doc.extension?.replace('.','') ||'IMG'}
 </div>
 </div>

 {selectedUrl === doc.fileUrl && (
 <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[2px] z-10">
 <div className="bg-primary text-white p-3 rounded-full shadow-2xl scale-110 animate-in zoom-in-50">
 <CheckCircle2 size={24} className="stroke-[3px]"/>
 </div>
 </div>
 )}
 </div>
 <div className="p-4 bg-background/90 backdrop-blur-xl border-t border-border/10">
 <p className="text-[10px] truncate text-foreground group-hover:text-primary transition-colors leading-tight mb-1 font-bold">
 {doc.name}
 </p>
 <div className="flex items-center justify-between">
 <span className="text-[8px] font-bold text-muted-foreground/60">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
 {doc.tags?.length > 0 && (
 <Badge className="h-4 text-[7px] bg-primary/10 text-primary border-none rounded-md font-black">
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
 <DialogFooter className="px-8 py-6 border-t border-border/40 bg-muted/5 flex items-center justify-between shrink-0">
 <div className="flex items-center gap-4">
 {selectedUrl && (
 <div className="flex items-center gap-3 animate-in slide-in-from-left-4">
 <div className="w-10 rounded-md overflow-hidden border border-primary/20 shadow-xl relative ring-2 ring-primary/5">
 <AppImage src={selectedUrl} alt="Selected"fill className="object-cover"/>
 </div>
 <div className="space-y-0.5">
 <p className="text-[8px] text-primary/40 tracking-[0.3em] font-black uppercase">Active Path</p>
 <p className="text-[9px] text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10 font-bold uppercase tracking-wider">
 Ready to Embed
 </p>
 </div>
 </div>
 )}
 <Button
 type="button"
 variant="outline"
 disabled={!selectedUrl || isLoading}
 onClick={() => setIsEditing(true)}
 className="h-11 px-6 text-[10px] text-primary border-primary/30 hover:bg-primary/5 rounded-[1.25rem] transition-all font-black uppercase tracking-widest shadow-sm hover:shadow-md"
 >
 <Crop size={14} className="mr-2"/> Refine Media
 </Button>
 </div>
 <div className="flex items-center gap-4">
 <Button
 type="button"
 variant="ghost"
 onClick={handleClose}
 className="px-8 h-11 rounded-[1.25rem] text-muted-foreground text-[10px] uppercase tracking-widest hover:bg-muted font-bold"
 >
 Dismiss
 </Button>
 <Button
 type="button"
 disabled={!selectedUrl}
 onClick={handleSelect}
 className="px-12 h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
 >
 Select Media
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