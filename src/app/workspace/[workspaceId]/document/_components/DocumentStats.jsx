'use client'
import React, { useState, useEffect, useMemo } from'react'
import { FileText, Users, HardDrive, TrendingUp, Loader2 } from"lucide-react";
import { Card, CardContent } from"@/components/ui/card";
import axios from"@/utils/axios";
import { format } from"date-fns";

export default function DocumentStats({ workspaceId, userId }) {
 const [documents, setDocuments] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchAll = async () => {
 if (!workspaceId) return;
 try {
 setLoading(true);
 const response = await axios.get(`/api/workspace/${workspaceId}/document`);
 setDocuments(response.data);
 } catch (error) {
 console.error("Error fetching stats data:", error);
 } finally {
 setLoading(false);
 }
 };
 fetchAll();
 }, [workspaceId]);

 const stats = useMemo(() => {
 if (documents.length === 0) return [
 { label:"Total Documents", value:"0", change:"+0%", icon: FileText, color:"text-primary", bg:"bg-blue-50"},
 { label:"Active Users", value:"1", change:"+0%", icon: Users, color:"text-blue-600", bg:"bg-indigo-50"},
 { label:"Storage Used", value:"0 MB", change:"0%", icon: HardDrive, color:"text-amber-600", bg:"bg-amber-50"},
 { label:"This Month", value:"0", change:"+0%", icon: TrendingUp, color:"text-emerald-600", bg:"bg-emerald-50"},
 ];

 const totalDocs = documents.length;
 const totalSize = documents.reduce((acc, doc) => acc + (doc.fileSize || 0), 0);
 const uniqueUsers = new Set(documents.map(doc => doc.userId)).size;

 const now = new Date();
 const thisMonthDocs = documents.filter(doc => {
 const date = new Date(doc.createdAt);
 return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
 }).length;

 const sizeInMb = (totalSize / (1024 * 1024)).toFixed(1);
 const storagePercent = Math.min((totalSize / (1024 * 1024 * 1024)) * 100, 100).toFixed(1); // Assuming 1GB soft limit for progress

 return [
 {
 label:"Total Documents",
 value: totalDocs.toLocaleString(),
 change: `+${((thisMonthDocs / totalDocs) * 100).toFixed(0)}%`,
 icon: FileText,
 color:"text-primary",
 bg:"bg-blue-50"
 },
 {
 label:"Active Users",
 value: uniqueUsers.toLocaleString(),
 change:"+12%", // Mocked growth
 icon: Users,
 color:"text-blue-600",
 bg:"bg-indigo-50"
 },
 {
 label:"Storage Used",
 value: sizeInMb > 1024 ? (sizeInMb / 1024).toFixed(1) +"GB": sizeInMb +"MB",
 change: `${storagePercent}%`,
 icon: HardDrive,
 color:"text-amber-600",
 bg:"bg-amber-50"
 },
 {
 label:"This Month",
 value: thisMonthDocs.toLocaleString(),
 change:"+8.1%",
 icon: TrendingUp,
 color:"text-emerald-600",
 bg:"bg-emerald-50"
 },
 ];
 }, [documents]);

 if (loading && documents.length === 0) {
 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {[1, 2, 3, 4].map((i) => (
 <Card key={i} className="h-28 border-none bg-background shadow-sm flex items-center justify-center">
 <Loader2 className="h-6 w-6 text-primary/20 animate-spin"/>
 </Card>
 ))}
 </div>
 );
 }

 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {stats.map((stat, i) => (
 <Card
 key={stat.label}
 className="animate-fade-up border shadow-sm bg-background"
 style={{ animationDelay: `${i * 100}ms` }}
 >
 <CardContent className="">
 <div className="flex items-start justify-between">
 <div>
 <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
 <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
 <div className="flex items-center gap-2 mt-1">
 <span className={`text-xs font-medium ${stat.color}`}>{stat.change}</span>
 <span className="text-[10px] text-muted-foreground opacity-60">from last month</span>
 </div>
 </div>
 <div className={`${stat.bg} p-3 rounded-md`}>
 <stat.icon className={`h-5 w-5 ${stat.color}`} />
 </div>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 )
}