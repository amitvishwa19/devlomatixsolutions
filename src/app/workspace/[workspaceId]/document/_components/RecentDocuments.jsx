'use client'
import { useState, useEffect, useCallback } from'react';
import { useParams } from'next/navigation';
import { Badge } from'@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from'@/components/ui/card';
import { FileText, Loader2, Clock } from'lucide-react';
import axios from'@/utils/axios';
import { formatDistanceToNow } from'date-fns';
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from'@/components/ui/dropdown-menu';
import { MoreHorizontal, Share2, Download, Eye, Users } from'lucide-react';
import ShareModal from'./ShareModal';
import FileViewerModal from'./FileViewerModal';
import { EmptyState } from '@/components/global/EmptyState';

const statusStyles = {
 complete:"bg-emerald-50 text-emerald-700 border-emerald-200",
 pending:"bg-amber-50 text-amber-700 border-amber-200",
 review:"bg-blue-50 text-blue-700 border-blue-200",
 approved:"bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function RecentDocuments({ workspaceId, userId }) {
 const [recentDocs, setRecentDocs] = useState([]);
 const [loading, setLoading] = useState(true);

 const fetchRecent = useCallback(async () => {
 if (!workspaceId) return;
 try {
 setLoading(true);
 const response = await axios.get(`/api/workspace/${workspaceId}/document?limit=5&isFolder=false`);
 setRecentDocs(response.data);
 } catch (error) {
 console.error("Error fetching recent docs:", error);
 } finally {
 setLoading(false);
 }
 }, [workspaceId]);

 useEffect(() => {
 fetchRecent();
 }, [fetchRecent]);

 const toggleStar = async (e, doc) => {
 e.stopPropagation();
 try {
 await axios.patch(`/api/workspace/${workspaceId}/document/${doc.id}`, { isStarred: !doc.isStarred });
 fetchRecent();
 } catch (error) {
 console.error(error);
 }
 };

 const toggleStatus = async (e, doc) => {
 e.stopPropagation();
 const statuses = ["PENDING","REVIEW","APPROVED"];
 const currentIndex = statuses.indexOf((doc.status ||"APPROVED").toUpperCase());
 const nextStatus = statuses[(currentIndex + 1) % statuses.length];

 try {
 await axios.patch(`/api/workspace/${workspaceId}/document/${doc.id}`, { status: nextStatus });
 fetchRecent();
 } catch (error) {
 console.error(error);
 }
 };

 // Share Modal States
 const [isShareModalOpen, setIsShareModalOpen] = useState(false);
 const [fileToShare, setFileToShare] = useState(null);

 const openShareModal = (e, doc) => {
 e.stopPropagation();
 setFileToShare(doc);
 setIsShareModalOpen(true);
 };

 // File Viewer Modal States
 const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
 const [fileToView, setFileToView] = useState(null);

 const openFileViewer = (e, doc) => {
 e.stopPropagation();
 setFileToView(doc);
 setIsFileViewerOpen(true);
 };

 if (loading && recentDocs.length === 0) {
 return (
 <Card className="lg:col-span-2 shadow-sm animate-fade-up min-h-[400px] flex items-center justify-center border border-border/100 bg-card/100">
 <div className="flex flex-col items-center gap-4">
 <Loader2 className="h-8 w-8 text-primary animate-spin"/>
 <p className="text-xs text-muted-foreground">Fetching data...</p>
 </div>
 </Card>
 );
 }

 return (
 <Card className="lg:col-span-2 shadow-sm animate-fade-up overflow-hidden border border-border/100 bg-card/100"style={{ animationDelay:"350ms"}}>
 <CardHeader className="pb-4 border-b border-border/10 bg-muted/5">
 <div className="flex items-center justify-between">
 <CardTitle className="text-xs text-muted-foreground">Recent Documents</CardTitle>
 <Badge variant="outline"className="text-[10px] tracking-tighter bg-background">Last 5 Assets</Badge>
 </div>
 </CardHeader>
 <CardContent className="px-0">
 {recentDocs.length === 0 ? (
 <div className="py-8">
     <EmptyState
         icon={FileText}
         title="No Recent Documents"
         description="You haven't uploaded or accessed any documents yet."
     />
 </div>
 ) : (
 <div className="divide-y divide-border/10">
 {recentDocs.map((doc) => (
 <div
 key={doc.id}
 className="flex items-center justify-between px-8 py-5 hover:bg-muted/30 transition-all duration-200 cursor-pointer group"
 >
 <div className="flex items-center gap-5 min-w-0">
 <div
 onClick={(e) => toggleStar(e, doc)}
 className="relative w-11 h-11 bg-muted/30 rounded-md flex items-center justify-center hover:bg-amber-50 group-hover:bg-primary/10 transition-colors shrink-0 cursor-pointer"
 title="Click to Star/Unstar"
 >
 <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors"/>
 {doc.isStarred && (
 <div className="absolute -top-1 -right-1 bg-amber-100 rounded-full p-0.5 shadow-sm">
 <svg className="w-3 h-3 text-amber-500 fill-amber-500"xmlns="http://www.w3.org/2000/svg"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
 </div>
 )}
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <p className="text-xs text-foreground/80 truncate">{doc.name}</p>
 </div>
 <p className="text-[11px] font-bold text-muted-foreground tracking-wider opacity-60 flex items-center gap-2">
 <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
 <span className="w-1 h-1 rounded-full bg-muted-foreground/30"/>
 <span>Added {formatDistanceToNow(new Date(doc.createdAt))} ago</span>
 </p>
 </div>
 </div>
 <div className="flex items-center gap-6 shrink-0">
 <Badge
 onClick={(e) => toggleStatus(e, doc)}
 variant="outline"
 className={`${statusStyles[doc.status?.toLowerCase()] || statusStyles.approved} text-[9px] px-2.5 py-1 border-none shadow-sm cursor-pointer hover:opacity-80 transition-opacity`}
 title="Click to change Status"
 >
 {doc.status ||"APPROVED"}
 </Badge>
 <span className="text-[10px] text-muted-foreground opacity-40 hidden sm:block w-24 text-right tabular-nums italic">
 {new Date(doc.createdAt).toLocaleDateString()}
 </span>
 <DropdownMenu>
 <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
 <button className="p-1 rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-colors">
 <MoreHorizontal className="h-4 w-4"/>
 </button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end"className="w-40 rounded-md shadow-xl">
 <DropdownMenuItem onClick={(e) => openFileViewer(e, doc)} className="font-bold cursor-pointer py-2 text-primary focus:text-primary focus:bg-primary/10">
 <Eye className="w-4 h-4 mr-2"/> View
 </DropdownMenuItem>
 <DropdownMenuItem asChild className="font-bold cursor-pointer py-2">
 <a href={doc.fileUrl} download onClick={(e) => e.stopPropagation()}>
 <Download className="w-4 h-4 mr-2"/> Download
 </a>
 </DropdownMenuItem>
 <DropdownMenuItem onClick={(e) => openShareModal(e, doc)} className="font-bold cursor-pointer py-2 text-primary focus:text-primary focus:bg-primary/10">
 <Users className="w-4 h-4 mr-2"/> Share Access
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </div>
 ))}
 </div>
 )}
 </CardContent>
 <ShareModal
 isOpen={isShareModalOpen}
 onOpenChange={setIsShareModalOpen}
 document={fileToShare}
 workspaceId={workspaceId}
 onShareComplete={fetchRecent}
 />
 <FileViewerModal
 isOpen={isFileViewerOpen}
 onOpenChange={setIsFileViewerOpen}
 file={fileToView}
 />
 </Card>
 )
}