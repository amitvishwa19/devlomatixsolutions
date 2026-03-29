'use client'

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
 Upload,
 FileText as FileTextIcon,
 FileSpreadsheet,
 FileImage,
 File as FileIcon,
 CheckCircle2,
 Clock,
 AlertCircle,
 X,
 Plus,
 Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import axios from "@/utils/axios";
import { toast } from "sonner";
import { format } from "date-fns";

const fileIcons = {
 pdf: FileTextIcon,
 docx: FileTextIcon,
 xlsx: FileSpreadsheet,
 png: FileImage,
 jpg: FileImage,
 ai: FileIcon,
};

const statusConfig = {
 complete: { icon: CheckCircle2, label: "Complete", class: "text-emerald-600", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
 uploading: { icon: Clock, label: "Uploading", class: "text-primary", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
 failed: { icon: AlertCircle, label: "Failed", class: "text-destructive", badgeClass: "bg-red-50 text-red-700 border-red-200" },
};

export default function UploadsPage() {
 const params = useParams();
 const { data: session } = useSession();
 const workspaceId = params.workspaceId;
 const userId = session?.user?.userId;
 const fileInputRef = useRef(null);

 const [dragOver, setDragOver] = useState(false);
 const [uploadQueue, setUploadQueue] = useState([]);
 const [history, setHistory] = useState([]);
 const [loading, setLoading] = useState(true);

 const fetchHistory = useCallback(async () => {
 try {
 setLoading(true);
 const response = await axios.get(`/api/workspace/${workspaceId}/document?parentId=root`);
 // We only want files for the "Uploads" history, assuming parentId=null or root are direct uploads
 const files = response.data.filter(doc => !doc.isFolder);
 setHistory(files.map(doc => ({
 id: doc.id,
 name: doc.name,
 type: doc.name.split('.').pop().toLowerCase(),
 size: (doc.fileSize / (1024 * 1024)).toFixed(1) + " MB",
 progress: 100,
 status: "complete",
 uploadedBy: doc.user?.name || "Member",
 date: format(new Date(doc.createdAt), "yyyy-MM-dd HH:mm")
 })));
 } catch (error) {
 console.error("Error fetching history:", error);
 toast.error("Failed to load upload history");
 } finally {
 setLoading(false);
 }
 }, [workspaceId]);

 useEffect(() => {
 if (workspaceId) {
 fetchHistory();
 }
 }, [workspaceId, fetchHistory]);

 const startUpload = async (file) => {
 const uploadId = Math.random().toString(36).substr(2, 9);
 const newUpload = {
 id: uploadId,
 name: file.name,
 type: file.name.split('.').pop().toLowerCase(),
 size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
 progress: 0,
 status: "uploading",
 uploadedBy: session?.user?.name || "You",
 date: format(new Date(), "yyyy-MM-dd HH:mm")
 };

 setUploadQueue(prev => [newUpload, ...prev]);

 try {
 const fileExt = file.name.split('.').pop();
 const fileName = `${Math.random()}.${fileExt}`;
 const filePath = `${workspaceId}/${fileName}`;

 // We simulate progress since Supabase JS client doesn't support progress events natively in standard 'upload'
 // For real progress, one would need to use TUS or XMLHttpRequest.
 let progressInterval = setInterval(() => {
 setUploadQueue(current => current.map(u =>
 u.id === uploadId ? { ...u, progress: Math.min(u.progress + 10, 90) } : u
 ));
 }, 500);

 const { error: uploadError } = await supabase.storage
 .from('devlomatix')
 .upload(filePath, file);

 clearInterval(progressInterval);

 if (uploadError) throw uploadError;

 const { data: { publicUrl } } = supabase.storage
 .from('devlomatix')
 .getPublicUrl(filePath);

 await axios.post(`/api/workspace/${workspaceId}/document`, {
 name: file.name,
 fileUrl: publicUrl,
 fileKey: filePath,
 fileType: file.type,
 fileSize: file.size,
 workspaceId,
 userId: userId,
 isFolder: false,
 parentId: null
 });

 setUploadQueue(current => current.map(u =>
 u.id === uploadId ? { ...u, progress: 100, status: "complete" } : u
 ));

 toast.success(`${file.name} uploaded successfully`);
 fetchHistory();
 } catch (error) {
 console.error("Upload error:", error);
 setUploadQueue(current => current.map(u =>
 u.id === uploadId ? { ...u, status: "failed" } : u
 ));
 toast.error(`Failed to upload ${file.name}`);
 }
 };

 const handleFileSelect = (e) => {
 const files = Array.from(e.target.files);
 files.forEach(startUpload);
 };

 const handleDrop = (e) => {
 e.preventDefault();
 setDragOver(false);
 const files = Array.from(e.dataTransfer.files);
 files.forEach(startUpload);
 };

 const removeUpload = (id) => {
 setUploadQueue(prev => prev.filter(u => u.id !== id));
 };

 const combinedList = [...uploadQueue.filter(u => u.status !== "complete"), ...history];
 const activeCount = uploadQueue.filter(u => u.status === "uploading").length;
 const completedCount = history.length + uploadQueue.filter(u => u.status === "complete").length;
 const failedCount = uploadQueue.filter(u => u.status === "failed").length;

 return (
 <div className="space-y-4 h-full overflow-y-auto p-2">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-semibold ">Uploads</h1>
 <p className="text-muted-foreground text-sm mt-1">
 {combinedList.length} total uploads · {activeCount} in progress
 </p>
 </div>
 <Button
 onClick={() => fileInputRef.current?.click()}
 className="gap-2 active:scale-[0.97] transition-transform bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
 >
 <Plus className="h-4 w-4" />
 Upload Files
 </Button>
 <input
 type="file"
 ref={fileInputRef}
 onChange={handleFileSelect}
 className="hidden"
 multiple
 />
 </div>

 {/* Drop zone */}
 <Card
 className={`border-2 border-dashed p-10 text-center transition-all duration-300 animate-fade-up cursor-pointer group hover:bg-muted/5 ${dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/20"
 }`}
 onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
 onDragLeave={() => setDragOver(false)}
 onDrop={handleDrop}
 onClick={() => fileInputRef.current?.click()}
 >
 <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 border border-primary/20 group-hover:scale-110 transition-transform">
 <Upload className="h-8 w-8 text-primary shadow-sm" />
 </div>
 <p className="font-bold text-base text-foreground/80">Drop files here or click to browse</p>
 <p className="text-muted-foreground text-xs mt-2 opacity-60">PDF • DOCX • XLSX • PNG • JPG (UP TO 50 MB)</p>
 </Card>

 {/* Stats */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: "60ms" }}>
 {[
 { label: "Completed", value: completedCount, color: "text-emerald-600", bg: "bg-emerald-50" },
 { label: "In Progress", value: activeCount, color: "text-primary", bg: "bg-blue-50" },
 { label: "Failed", value: failedCount, color: "text-destructive", bg: "bg-red-50" },
 ].map((s) => (
 <Card key={s.label} className="p-5 shadow-sm border-none bg-background flex flex-col justify-between h-24 relative overflow-hidden group">
 <div className={`absolute top-0 right-0 w-24 h-24 ${s.bg} rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform`} />
 <p className="text-[10px] text-muted-foreground relative z-10">{s.label}</p>
 <p className={`text-3xl tabular-nums ${s.color} relative z-10 tracking-tighter`}>{s.value}</p>
 </Card>
 ))}
 </div>

 {/* Upload list */}
 <Card className="shadow-2xl border-border/40 overflow-hidden divide-y animate-fade-up bg-background/50 backdrop-blur-sm" style={{ animationDelay: "120ms" }}>
 {loading && combinedList.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-20 space-y-4">
 <Loader2 className="h-10 w-10 text-primary animate-spin" />
 <p className="text-xs text-muted-foreground animate-pulse">Initializing Queue...</p>
 </div>
 ) : combinedList.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-40">
 <div className="w-16 h-16 bg-muted/50 rounded-lg flex items-center justify-center">
 <Clock className="h-8 w-8 text-muted-foreground" />
 </div>
 <p className="text-sm font-bold text-muted-foreground text-center">No recent uploads<br /><span className="text-[10px] font-medium lowercase">Your upload history will appear here</span></p>
 </div>
 ) : (
 combinedList.map((upload) => {
 const Icon = fileIcons[upload.type] || FileIcon;
 const st = statusConfig[upload.status] || statusConfig.complete;
 const StatusIcon = st.icon;
 return (
 <div key={upload.id} className="flex items-center gap-5 p-5 hover:bg-muted/30 transition-all duration-200 group">
 <div className="w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center shrink-0 border border-border/20 group-hover:border-primary/20 transition-colors">
 <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
 </div>
 <div className="flex-1 min-w-0 space-y-1.5">
 <div className="flex items-center gap-3">
 <span className="font-bold text-sm truncate text-foreground/90">{upload.name}</span>
 <Badge variant="outline" className={`${st.badgeClass} text-[9px] px-2 py-0.5 border-none shadow-sm`}>
 <StatusIcon className={`h-2.5 w-2.5 mr-1.5 ${st.class}`} />
 {st.label}
 </Badge>
 </div>
 {upload.status === "uploading" && (
 <div className="flex flex-col gap-1.5">
 <Progress value={upload.progress} className="h-1.5 bg-muted overflow-hidden" />
 <div className="flex justify-between items-center text-[10px] text-muted-foreground/60 tracking-tighter">
 <span>Uploading Payload...</span>
 <span className="tabular-nums text-primary">{upload.progress}%</span>
 </div>
 </div>
 )}
 <p className="text-[10px] font-bold text-muted-foreground tracking-wider opacity-60">
 {upload.size} • {upload.uploadedBy} • {upload.date}
 </p>
 </div>
 <div className="flex items-center gap-2">
 {upload.status === "failed" && (
 <Button
 variant="outline"
 size="sm"
 onClick={() => {
 // Simplified retry: just clear from queue and the user can re-pick
 removeUpload(upload.id);
 fileInputRef.current?.click();
 }}
 className="text-[10px] h-8 bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
 >
 Retry
 </Button>
 )}
 <Button
 variant="ghost"
 size="icon"
 onClick={() => removeUpload(upload.id)}
 className="h-10 w-10 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all"
 >
 <X className="h-5 w-5" />
 </Button>
 </div>
 </div>
 );
 })
 )}
 </Card>
 </div>
 );
}
