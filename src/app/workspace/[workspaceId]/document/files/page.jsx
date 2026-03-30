'use client';

import { useState, useEffect, useCallback } from'react';
import { useParams, useRouter } from'next/navigation';
import { useSession } from'next-auth/react';
import axios from'@/utils/axios';
import { format } from'date-fns';
import { Button } from'@/components/ui/button';
import { Input } from'@/components/ui/input';
import { Badge } from'@/components/ui/badge';
import { Checkbox } from'@/components/ui/checkbox';
import {
 Plus,
 Search,
 Filter,
 MoreHorizontal,
 FileText,
 Image as ImageIcon,
 FileCode,
 Loader2,
 Music,
 Video,
 FileSpreadsheet,
 FileArchive,
 FileIcon,
 Trash2,
 Eye,
 Download,
 FolderOpen,
 FolderPlus,
 FolderOutput,
 Users
} from'lucide-react';
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from'@/components/ui/dropdown-menu';
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogDescription,
} from'@/components/ui/dialog';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from"@/components/ui/select";
import { toast } from'sonner';
import ShareModal from'../_components/ShareModal';
import FileViewerModal from'../_components/FileViewerModal';

const getFileIcon = (fileType, name ="") => {
 if (!fileType) return <FileText className="w-4 h-4 text-muted-foreground"/>;

 if (fileType.includes("pdf") || name.endsWith(".pdf")) return <FileText className="w-4 h-4 text-rose-400"/>;
 if (fileType.includes("image") || name.endsWith(".png") || name.endsWith(".jpg")) return <ImageIcon className="w-4 h-4 text-emerald-400"/>;
 if (fileType.includes("spreadsheet") || fileType.includes("excel") || name.endsWith(".xlsx") || name.endsWith(".csv")) return <FileSpreadsheet className="w-4 h-4 text-green-500"/>;
 if (fileType.includes("word") || name.endsWith(".docx") || name.endsWith(".doc")) return <FileText className="w-4 h-4 text-blue-400"/>;
 if (name.endsWith(".ai") || name.endsWith(".psd")) return <FileCode className="w-4 h-4 text-orange-400"/>;
 if (fileType.includes("video")) return <Video className="w-4 h-4 text-purple-400"/>;
 if (fileType.includes("audio")) return <Music className="w-4 h-4 text-pink-400"/>;
 if (fileType.includes("zip") || fileType.includes("rar")) return <FileArchive className="w-4 h-4 text-yellow-500"/>;

 return <FileIcon className="w-4 h-4 text-muted-foreground"/>;
};

const getStatusBadge = (status) => {
 const s = status?.toLowerCase() ||'approved';
 const baseClass ="px-3 py-0.5 rounded-full text-[11px] border-0 flex items-center justify-center min-w-[80px]";

 switch (s) {
 case'approved':
 return <Badge variant="outline"className={`${baseClass} bg-emerald-500/10 text-emerald-400`}>approved</Badge>;
 case'pending':
 return <Badge variant="outline"className={`${baseClass} bg-amber-500/10 text-amber-400`}>pending</Badge>;
 case'review':
 return <Badge variant="outline"className={`${baseClass} bg-indigo-500/10 text-indigo-400`}>review</Badge>;
 default:
 return <Badge variant="outline"className={`${baseClass} bg-emerald-500/10 text-emerald-400`}>approved</Badge>;
 }
};

export default function FilesPage() {
 const params = useParams();
 const router = useRouter();
 const { data: session } = useSession();
 const workspaceId = params.workspaceId;

 const [files, setFiles] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 const [selectedFiles, setSelectedFiles] = useState([]);
 const [filterStatus, setFilterStatus] = useState('All Status');

 // Move to folder states
 const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
 const [fileToMove, setFileToMove] = useState(null);
 const [availableFolders, setAvailableFolders] = useState([]);
 const [targetFolderId, setTargetFolderId] = useState("");
 const [newFolderName, setNewFolderName] = useState("");
 const [isCreatingFolder, setIsCreatingFolder] = useState(false);

 // Share Modal States
 const [isShareModalOpen, setIsShareModalOpen] = useState(false);
 const [fileToShare, setFileToShare] = useState(null);

 const openShareModal = (file) => {
 setFileToShare(file);
 setIsShareModalOpen(true);
 };

 // File Viewer Modal States
 const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
 const [fileToView, setFileToView] = useState(null);

 const openFileViewer = (file) => {
 setFileToView(file);
 setIsFileViewerOpen(true);
 };

 const fetchFolders = async () => {
 try {
 const res = await axios.get(`/api/workspace/${workspaceId}/document`);
 setAvailableFolders(res.data.filter(doc => doc.isFolder));
 } catch (error) {
 toast.error("Failed to load folders");
 }
 };

 const openMoveModal = (filesArray) => {
 setFileToMove(filesArray);
 setTargetFolderId("");
 setNewFolderName("");
 setIsMoveModalOpen(true);
 fetchFolders();
 };

 const handleConfirmMove = async () => {
 if (!targetFolderId && !newFolderName) {
 return toast.error("Select a folder or create a new one");
 }

 try {
 setIsCreatingFolder(true);
 let finalParentId = targetFolderId;

 if (newFolderName) {
 const res = await axios.post(`/api/workspace/${workspaceId}/document`, {
 name: newFolderName,
 workspaceId,
 userId: session?.user?.userId,
 isFolder: true,
 parentId: null
 });
 finalParentId = res.data.id;
 }

 // Move all selected files using Promise.all
 await Promise.all(
 fileToMove.map(f =>
 axios.patch(`/api/workspace/${workspaceId}/document/${f.id}`, { parentId: finalParentId })
 )
 );

 toast.success(fileToMove.length > 1 ? `${fileToMove.length} files moved successfully` :"File moved successfully");
 setIsMoveModalOpen(false);
 setSelectedFiles([]); // clear selection after moving
 fetchFiles();
 } catch (err) {
 console.error("Move error:", err);
 toast.error("Failed to move files");
 } finally {
 setIsCreatingFolder(false);
 }
 };

 const fetchFiles = useCallback(async () => {
 try {
 setLoading(true);
 const response = await axios.get(`/api/workspace/${workspaceId}/document?isFolder=false`);
 setFiles(response.data);
 } catch (error) {
 console.error("Failed to fetch files:", error);
 toast.error("Could not load documents");
 } finally {
 setLoading(false);
 }
 }, [workspaceId]);

 useEffect(() => {
 if (workspaceId) {
 fetchFiles();
 }
 }, [workspaceId, fetchFiles]);

 const handleSelectAll = (checked) => {
 if (checked) {
 setSelectedFiles(files.map(f => f.id));
 } else {
 setSelectedFiles([]);
 }
 };

 const handleSelectFile = (id, checked) => {
 if (checked) {
 setSelectedFiles(prev => [...prev, id]);
 } else {
 setSelectedFiles(prev => prev.filter(fileId => fileId !== id));
 }
 };

 const handleDelete = async (id) => {
 try {
 await axios.delete(`/api/workspace/${workspaceId}/document/${id}`);
 toast.success("File deleted successfully");
 fetchFiles();
 setSelectedFiles(prev => prev.filter(fId => fId !== id));
 } catch (error) {
 toast.error("Failed to delete file");
 }
 };

 const filteredFiles = files.filter(f => {
 const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
 const matchesStatus = filterStatus ==='All Status'|| (f.status ||'APPROVED').toLowerCase() === filterStatus.toLowerCase();
 return matchesSearch && matchesStatus;
 });

 return (
 <div className="flex flex-col h-full space-y-4 animate-fade-in w-full p-2">
 {/* Header Section */}
 <div className="flex items-start justify-between">
 <div>
 <h1 className="text-2xl font-bold text-foreground/90">Documents</h1>
 <p className="text-xs font-medium text-muted-foreground mt-1">
 {filteredFiles.length} documents · {selectedFiles.length} selected
 </p>
 </div>
 <div className="flex items-center gap-3">
 {selectedFiles.length > 0 && (
 <Button
 onClick={() => {
 const filesObjArray = filteredFiles.filter(f => selectedFiles.includes(f.id));
 openMoveModal(filesObjArray);
 }}
 className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-4 font-bold shadow-sm"
 >
 <FolderOutput className="w-4 h-4 mr-2"/> Move {selectedFiles.length} Selected
 </Button>
 )}
 <Button
 onClick={() => router.push(`/workspace/${workspaceId}/document/uploads`)}
 className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 px-6 font-bold shadow-sm"
 >
 <Plus className="w-4 h-4 mr-2"/> Upload
 </Button>
 </div>
 </div>

 {/* Filter & Search Bar */}
 <div className="flex items-center gap-4 bg-card rounded-md border p-2 shadow-sm">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
 <Input
 placeholder="Search by name or owner..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="pl-10 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm font-medium"
 />
 </div>
 <div className="w-[1px] h-6 bg-border mx-2"/>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost"className="text-muted-foreground font-semibold px-4 border-0 hover:bg-muted/50 rounded-md shrink-0">
 <Filter className="w-4 h-4 mr-2"/> {filterStatus}
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end"className="w-48 rounded-md">
 {['All Status','Approved','Pending','Review'].map(st => (
 <DropdownMenuItem
 key={st}
 onClick={() => setFilterStatus(st)}
 className="font-semibold cursor-pointer py-2 px-3"
 >
 {st}
 </DropdownMenuItem>
 ))}
 </DropdownMenuContent>
 </DropdownMenu>
 </div>

 {/* Main Table */}
 <div className="bg-card rounded-md border shadow-sm flex-1 overflow-hidden flex flex-col">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse min-w-[800px]">
 <thead>
 <tr className="border-b bg-muted/20 text-xs text-muted-foreground/80">
 <th className="p-4 w-14 text-center">
 <Checkbox
 checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
 onCheckedChange={handleSelectAll}
 className="rounded-sm border-muted-foreground/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none"
 />
 </th>
 <th className="p-4">Name</th>
 <th className="p-4">Owner</th>
 <th className="p-4">Department</th>
 <th className="p-4">Size</th>
 <th className="p-4">Status</th>
 <th className="p-4">Date</th>
 <th className="p-4 w-14"></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/50 text-sm font-semibold text-foreground/80">
 {loading ? (
 <tr>
 <td colSpan={8} className="p-10 text-center text-muted-foreground">
 <div className="flex flex-col items-center gap-3">
 <Loader2 className="w-6 h-6 animate-spin text-primary"/>
 <span className="text-xs">Loading Database...</span>
 </div>
 </td>
 </tr>
 ) : filteredFiles.length === 0 ? (
 <tr>
 <td colSpan={8} className="p-16 text-center">
 <p className="text-muted-foreground font-bold">No files found matching criteria.</p>
 </td>
 </tr>
 ) : (
 filteredFiles.map((f) => (
 <tr key={f.id} className="hover:bg-muted/10 transition-colors group">
 <td className="p-4 text-center">
 <Checkbox
 checked={selectedFiles.includes(f.id)}
 onCheckedChange={(c) => handleSelectFile(f.id, c)}
 className="rounded-sm border-muted-foreground/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none"
 />
 </td>
 <td className="p-4">
 <div className="flex items-center gap-3">
 {getFileIcon(f.fileType, f.name)}
 <span className="truncate max-w-[250px] font-bold text-foreground/90">{f.name}</span>
 </div>
 </td>
 <td className="p-4 text-muted-foreground font-medium">
 {f.user?.name ||"System"}
 </td>
 <td className="p-4 text-muted-foreground font-medium">
 {f.category || f.tags?.[0] ||"General"}
 </td>
 <td className="p-4 text-muted-foreground font-medium">
 {f.fileSize ? (f.fileSize > 1024 * 1024 ? `${(f.fileSize / (1024 * 1024)).toFixed(1)} MB` : `${(f.fileSize / 1024).toFixed(0)} KB`) :"0 KB"}
 </td>
 <td className="p-4">
 {getStatusBadge(f.status ||'approved')}
 </td>
 <td className="p-4 text-muted-foreground font-medium">
 {format(new Date(f.createdAt),"yyyy-MM-dd")}
 </td>
 <td className="p-4 text-right">
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost"size="icon"className="w-8 text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-colors">
 <MoreHorizontal className="w-4 h-4"/>
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end"className="w-40 rounded-md shadow-xl">
 <DropdownMenuItem onClick={() => openFileViewer(f)} className="font-bold cursor-pointer py-2 text-primary focus:text-primary focus:bg-primary/10">
 <Eye className="w-4 h-4 mr-2"/> View
 </DropdownMenuItem>
 <DropdownMenuItem asChild className="font-bold cursor-pointer py-2">
 <a href={f.fileUrl} download>
 <Download className="w-4 h-4 mr-2"/> Download
 </a>
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => openShareModal(f)} className="font-bold cursor-pointer py-2 text-primary focus:text-primary focus:bg-primary/10">
 <Users className="w-4 h-4 mr-2"/> Share Access
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => openMoveModal([f])} className="font-bold cursor-pointer py-2">
 <FolderOutput className="w-4 h-4 mr-2"/> Move to Folder...
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => handleDelete(f.id)} className="font-bold text-destructive hover:!text-destructive focus:!text-destructive cursor-pointer py-2">
 <Trash2 className="w-4 h-4 mr-2"/> Delete
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 <ShareModal
 isOpen={isShareModalOpen}
 onOpenChange={setIsShareModalOpen}
 document={fileToShare}
 workspaceId={workspaceId}
 onShareComplete={fetchFiles}
 />

 <FileViewerModal
 isOpen={isFileViewerOpen}
 onOpenChange={setIsFileViewerOpen}
 file={fileToView}
 />

 <Dialog open={isMoveModalOpen} onOpenChange={setIsMoveModalOpen}>
 <DialogContent className="sm:max-w-md rounded-md border-none shadow-2xl">
 <DialogHeader className="mb-4">
 <DialogTitle className="text-xl font-bold flex items-center gap-2">
 <FolderOutput className="w-5 h-5 text-primary"/>
 Move Document{fileToMove?.length > 1 ?'s':''}
 </DialogTitle>
 <DialogDescription className="font-medium">
 Choose an existing folder or create a new one to move <span className="text-foreground underline decoration-primary/50 underline-offset-2">{fileToMove?.length === 1 ? fileToMove[0].name : `${fileToMove?.length} files`}</span>
 </DialogDescription>
 </DialogHeader>

 <div className="space-y-6">
 <div className="space-y-2">
 <label className="text-xs text-muted-foreground ml-1">Select Existing Folder</label>
 <Select value={targetFolderId} onValueChange={(val) => { setTargetFolderId(val); setNewFolderName(""); }}>
 <SelectTrigger className="w-full h-11 bg-muted/30 border-none rounded-md font-bold">
 <SelectValue placeholder="-- Choose a folder --"/>
 </SelectTrigger>
 <SelectContent className="rounded-md shadow-xl">
 <SelectItem value="root"className="font-bold py-2.5">
 <div className="flex items-center gap-2">
 <FolderOpen className="w-4 h-4 text-emerald-500"/> [Root Directory]
 </div>
 </SelectItem>
 {availableFolders.map((folder) => (
 <SelectItem key={folder.id} value={folder.id} className="font-bold py-2.5">
 <div className="flex items-center gap-2">
 <FolderOpen className="w-4 h-4 text-primary"/> {folder.name}
 </div>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="relative flex items-center py-2">
 <div className="flex-grow border-t border-muted/50"></div>
 <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground/50">OR</span>
 <div className="flex-grow border-t border-muted/50"></div>
 </div>

 <div className="space-y-2">
 <label className="text-xs text-muted-foreground ml-1">Create New Folder</label>
 <div className="relative">
 <FolderPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
 <Input
 placeholder="e.g. Invoices Q3"
 value={newFolderName}
 onChange={(e) => { setNewFolderName(e.target.value); setTargetFolderId(""); }}
 className="pl-10 h-11 bg-muted/30 border-none rounded-md font-bold shadow-none focus-visible:ring-1 focus-visible:ring-primary/30"
 />
 </div>
 </div>

 <Button
 onClick={handleConfirmMove}
 disabled={(!targetFolderId && !newFolderName) || isCreatingFolder}
 className="w-full h-12 rounded-md font-bold text-xs shadow-xl shadow-primary/20"
 >
 {isCreatingFolder ? (
 <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
 ) : (
 <FolderOutput className="w-4 h-4 mr-2"/>
 )}
 Confirm Move
 </Button>
 </div>
 </DialogContent>
 </Dialog>

 </div>
 );
}