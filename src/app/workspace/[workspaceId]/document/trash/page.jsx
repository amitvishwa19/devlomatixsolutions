'use client';

import { useState, useEffect, useCallback } from'react';
import { useParams } from'next/navigation';
import axios from'@/utils/axios';
import { formatDistanceToNow } from'date-fns';
import { Button } from'@/components/ui/button';
import { Loader2, Trash2, RefreshCcw, FileText, Image as ImageIcon, FileArchive, FileSpreadsheet, Music, Video, FileIcon, Folder } from'lucide-react';
import { toast } from'sonner';

export default function TrashPage() {
 const params = useParams();
 const workspaceId = params.workspaceId;

 const [trashItems, setTrashItems] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [isActionLoading, setIsActionLoading] = useState(null);

 const fetchTrash = useCallback(async () => {
 if (!workspaceId) return;
 setIsLoading(true);
 try {
 const res = await axios.get(`/api/workspace/${workspaceId}/document?isTrash=true`);
 setTrashItems(res.data);
 } catch (error) {
 console.error(error);
 toast.error("Failed to load trash");
 } finally {
 setIsLoading(false);
 }
 }, [workspaceId]);

 useEffect(() => {
 fetchTrash();
 }, [fetchTrash]);

 const handleRestore = async (id) => {
 setIsActionLoading(id);
 try {
 await axios.patch(`/api/workspace/${workspaceId}/document/${id}`, { deletedAt: null });
 toast.success("Item restored!");
 setTrashItems(prev => prev.filter(item => item.id !== id));
 } catch (error) {
 console.error(error);
 toast.error("Failed to restore item");
 } finally {
 setIsActionLoading(null);
 }
 };

 const handlePermanentDelete = async (id) => {
 if (!confirm("Are you sure you want to permanently delete this? It cannot be recovered.")) return;
 setIsActionLoading(id);
 try {
 await axios.delete(`/api/workspace/${workspaceId}/document/${id}?force=true`);
 toast.success("Permanently deleted");
 setTrashItems(prev => prev.filter(item => item.id !== id));
 } catch (error) {
 console.error(error);
 toast.error("Failed to delete permanently");
 } finally {
 setIsActionLoading(null);
 }
 };

 const getIcon = (item) => {
 if (item.isFolder) return <Folder className="w-6 h-6 text-amber-500 fill-amber-500/20"/>;
 const type = item.fileType;
 if (type?.startsWith('image/')) return <ImageIcon className="w-6 h-6 text-emerald-500"/>;
 if (type ==='application/pdf') return <FileText className="w-6 h-6 text-rose-500"/>;
 return <FileIcon className="w-6 h-6 text-blue-500"/>;
 };

 return (
 <div className="space-y-4 h-full overflow-y-auto p-2">
 <div>
 <h1 className="text-2xl font-semibold">Recycle Bin</h1>
 <p className="text-muted-foreground text-sm mt-1 opacity-60">
 {trashItems.length} items in trash
 </p>
 </div>

 {isLoading && trashItems.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-32 space-y-4">
 <Loader2 className="h-12 w-12 text-primary animate-spin"/>
 <p className="text-sm text-muted-foreground tracking-[0.2em] animate-pulse">Loading Trash...</p>
 </div>
 ) : trashItems.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-32 text-center rounded-md border-2 border-dashed border-border/50 bg-background/50">
 <div className="w-20 h-20 bg-muted/40 rounded-md flex items-center justify-center mb-6">
 <Trash2 className="w-10 text-muted-foreground/40"/>
 </div>
 <h3 className="text-xl text-foreground/80 mb-2">Trash is empty</h3>
 <p className="text-sm text-muted-foreground/60 max-w-[280px] mx-auto mb-8 font-medium">
 Deleted files and folders will appear here where you can restore them or permanently remove them.
 </p>
 </div>
 ) : (
 <div className="bg-background/50 rounded-md border border-border/40 shadow-sm overflow-hidden animate-fade-up">
 <div className="divide-y divide-border/20">
 {trashItems.map((item) => (
 <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
 <div className="flex items-center gap-4 min-w-0">
 <div className="w-12 h-12 rounded-md bg-muted/50 flex items-center justify-center shrink-0">
 {getIcon(item)}
 </div>
 <div className="min-w-0">
 <p className="text-sm font-bold text-foreground/90 truncate">{item.name}</p>
 <p className="text-xs font-semibold text-muted-foreground tracking-wider opacity-70 mt-0.5">
 Deleted {formatDistanceToNow(new Date(item.deletedAt || new Date()))} ago
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2 mt-4 sm:mt-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
 <Button
 variant="outline"
 size="sm"
 disabled={isActionLoading === item.id}
 onClick={() => handleRestore(item.id)}
 className="h-9 px-4 rounded-md font-bold bg-background text-foreground hover:bg-muted"
 >
 {isActionLoading === item.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <RefreshCcw className="w-4 h-4 mr-2"/>}
 Restore
 </Button>
 <Button
 variant="destructive"
 size="sm"
 disabled={isActionLoading === item.id}
 onClick={() => handlePermanentDelete(item.id)}
 className="h-9 px-4 rounded-md font-bold"
 >
 {isActionLoading === item.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4 mr-2"/>}
 Delete
 </Button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 );
}