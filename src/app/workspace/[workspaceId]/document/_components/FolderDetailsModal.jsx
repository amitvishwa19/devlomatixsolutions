'use client';

import { useState, useEffect } from'react';
import { useRouter } from'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from'@/components/ui/dialog';
import { Button } from'@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from'@/components/ui/avatar';
import { Loader2, FolderOpen, FileText, Calendar, Database, HardDrive, Layers, Trash2 } from'lucide-react';
import { Badge } from'@/components/ui/badge';
import axios from'@/utils/axios';
import { format } from'date-fns';
import { toast } from'sonner';
import { AlertModal } from'@/components/global/AlertModal';

const statusStyles = {
 complete:"bg-emerald-50 text-emerald-700 border-emerald-200",
 pending:"bg-amber-50 text-amber-700 border-amber-200",
 review:"bg-blue-50 text-blue-700 border-blue-200",
 approved:"bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function FolderDetailsModal({ isOpen, onOpenChange, folder, workspaceId, onDelete }) {
 const router = useRouter();
 const [files, setFiles] = useState([]);
 const [isLoading, setIsLoading] = useState(false);
 const [isDeleting, setIsDeleting] = useState(false);
 const [isDeletingModalOpen, setIsDeletingModalOpen] = useState(false);

 useEffect(() => {
 if (!isOpen || !folder) return;

 const fetchFolderFiles = async () => {
 setIsLoading(true);
 try {
 const res = await axios.get(`/api/workspace/${workspaceId}/document?parentId=${folder.id}&isFolder=false`);
 setFiles(res.data);
 } catch (error) {
 console.error("Failed to load folder contents:", error);
 } finally {
 setIsLoading(false);
 }
 };

 fetchFolderFiles();
 }, [isOpen, folder, workspaceId]);

 if (!folder) return null;

 const navigateToFolder = () => {
 onOpenChange(false);
 router.push(`/workspace/${workspaceId}/document?folderId=${folder.id}`);
 };

 const handleDelete = async () => {
 setIsDeleting(true);
 try {
 await onDelete(folder.id);
 setIsDeletingModalOpen(false);
 onOpenChange(false);
 } catch (error) {
 console.error(error);
 toast.error("Failed to delete folder.", {
 description: error.response?.data?.message ||"An unexpected error occurred.",
 });
 } finally {
 setIsDeleting(false);
 }
 };

 const confirmDelete = () => {
 setIsDeletingModalOpen(true);
 };

 return (
 <Dialog open={isOpen} onOpenChange={onOpenChange}>
 <DialogContent className="sm:max-w-2xl rounded-md border-none shadow-2xl overflow-hidden p-0 bg-card">
 <div className="flex flex-col md:flex-row h-[500px]">
 
 {/* Left Sidebar: Folder Information */}
 <div className="w-full md:w-[280px] bg-muted/10 border-r border-border/40 p-6 flex flex-col justify-between shrink-0">
 <div>
 <div className="flex items-center gap-4 mb-6">
 <div className={`h-14 w-14 rounded-md flex items-center justify-center shadow-sm border border-border/10 ${folder.color ||'bg-blue-50 text-blue-500'}`}>
 <FolderOpen className="h-7 w-7"/>
 </div>
 <div className="flex-1 min-w-0">
 <DialogTitle className="text-xl text-foreground truncate">{folder.name}</DialogTitle>
 <DialogDescription className="sr-only">Details and contents for {folder.name}</DialogDescription>
 <Badge variant="outline"className={`${statusStyles[folder.status?.toLowerCase()] || statusStyles.approved} border-none shadow-sm text-[10px] mt-1`}>
 {folder.status ||"APPROVED"}
 </Badge>
 </div>
 </div>

 <div className="space-y-5">
 <div className="space-y-1">
 <p className="text-xs text-muted-foreground/60">Owner</p>
 <div className="flex items-center gap-2 mt-1">
 <Avatar className="h-6 w-6 border border-border/50">
 <AvatarImage src={folder.user?.avatar} />
 <AvatarFallback className="text-[10px] font-bold text-primary">{folder.user?.displayName?.charAt(0) || folder.user?.name?.charAt(0) ||'?'}</AvatarFallback>
 </Avatar>
 <span className="text-xs font-bold truncate text-foreground/80">{folder.user?.displayName || folder.user?.name || folder.owner ||'System'}</span>
 </div>
 </div>

 <div className="space-y-1">
 <p className="flex items-center gap-2 text-xs text-muted-foreground/60">
 <Calendar className="w-3.5 h-3.5"/> Date Created
 </p>
 <p className="text-xs font-bold text-foreground/80">
 {folder.createdAt ? format(new Date(folder.createdAt),'MMM d, yyyy') :'N/A'}
 </p>
 </div>

 <div className="flex gap-4">
 <div className="space-y-1">
 <p className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
 <Layers className="w-3.5 h-3.5"/> Items
 </p>
 <p className="text-xs font-bold text-foreground/80">{folder.files || 0}</p>
 </div>
 <div className="space-y-1">
 <p className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
 <HardDrive className="w-3.5 h-3.5"/> Size
 </p>
 <p className="text-xs font-bold text-foreground/80">{folder.size ||'0 B'}</p>
 </div>
 </div>
 </div>
 </div>

 <div className="space-y-2 mt-6">
 <Button 
 onClick={navigateToFolder}
 className="w-full h-11 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
 >
 Open Folder
 </Button>
 <Button 
 variant="outline"
 onClick={confirmDelete}
 disabled={isDeleting}
 className="w-full h-11 rounded-md border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive"
 >
 {isDeleting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4 mr-2"/>}
 Delete Folder
 </Button>
 </div>
 </div>

 {/* Right Side: Folder Contents & File Preview */}
 <div className="flex-1 flex flex-col bg-background relative">
 <div className="p-4 border-b border-border/40 bg-muted/5">
 <h3 className="text-sm text-muted-foreground px-2">Contents Preview</h3>
 </div>

 <div className="flex-1 overflow-y-auto p-2">
 {isLoading ? (
 <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 gap-3">
 <Loader2 className="w-8 h-8 animate-spin text-primary"/>
 <p className="text-xs font-bold">Loading items...</p>
 </div>
 ) : files.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 gap-4">
 <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
 <Database className="w-8 h-8"/>
 </div>
 <p className="text-xs font-bold">This folder is empty</p>
 </div>
 ) : (
 <div className="space-y-1">
 {files.map(file => (
 <div key={file.id} className="flex items-center justify-between p-3 rounded-md hover:bg-muted/40 transition-colors group cursor-default">
 <div className="flex items-center gap-3 overflow-hidden">
 <div className="w-10 rounded-md bg-muted flex items-center justify-center shrink-0">
 <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"/>
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-xs font-bold text-foreground/90 truncate">{file.name}</p>
 <p className="text-[11px] font-semibold text-muted-foreground opacity-80 mt-0.5">
 {(file.fileSize / 1024).toFixed(1)} KB • {file.createdAt ? format(new Date(file.createdAt),'MMM d, yyyy') :'N/A'}
 </p>
 </div>
 </div>
 <Button 
 variant="ghost"
 size="sm"
 className="opacity-0 group-hover:opacity-100 transition-opacity font-bold h-8 text-xs shrink-0"
 onClick={() => window.open(file.fileUrl,'_blank')}
 >
 View
 </Button>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 </div>
 </DialogContent>

 <AlertModal 
 isOpen={isDeletingModalOpen}
 onClose={() => setIsDeletingModalOpen(false)}
 onConfirm={handleDelete}
 loading={isDeleting}
 title="Delete Folder?"
 description={`Are you sure you want to delete"${folder.name}"? All contents will be moved to trash.`}
 />
 </Dialog>
 );
}