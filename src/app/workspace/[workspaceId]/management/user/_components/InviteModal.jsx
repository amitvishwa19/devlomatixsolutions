"use client";

import { useState, useEffect } from "react";
import axios from "@/utils/axios";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModal } from "@/hooks/useModal";
import { Copy, Check, Link as LinkIcon, Mail, RefreshCw, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const InviteModal = () => {
 const { isOpen, onClose, type, data } = useModal();
 const isModalOpen = isOpen && type === "invite";
 const workspaceId = data?.workspaceId;

 const [inviteCode, setInviteCode] = useState("");
 const [isLoadingCode, setIsLoadingCode] = useState(false);
 
 const [email, setEmail] = useState("");
 const [isSending, setIsSending] = useState(false);
 const [isCopied, setIsCopied] = useState(false);

 useEffect(() => {
 if (isModalOpen && workspaceId) {
 fetchInviteCode();
 } else {
 setInviteCode("");
 setEmail("");
 }
 }, [isModalOpen, workspaceId]);

 const fetchInviteCode = async () => {
 setIsLoadingCode(true);
 try {
 const res = await axios.get(`/api/workspace/${workspaceId}/invite`);
 setInviteCode(res.data.inviteCode);
 } catch (error) {
 console.error(error);
 toast.error("Failed to fetch invite code");
 } finally {
 setIsLoadingCode(false);
 }
 };

 const handleCopy = () => {
 const inviteLink = `${window.location.origin}/invite/${inviteCode}`;
 navigator.clipboard.writeText(inviteLink);
 setIsCopied(true);
 toast.success("Invite link copied to clipboard");
 setTimeout(() => setIsCopied(false), 2000);
 };

 const handleGenerateNewLink = async () => {
 setIsLoadingCode(true);
 try {
 const res = await axios.patch(`/api/workspace/${workspaceId}/invite`);
 setInviteCode(res.data.inviteCode);
 toast.success("New invite link generated");
 } catch (error) {
 console.error(error);
 toast.error("Failed to generate new link");
 } finally {
 setIsLoadingCode(false);
 }
 };

 const handleSendEmail = async () => {
 if (!email) return toast.error("Please enter an email address");
 setIsSending(true);
 try {
 await axios.post(`/api/workspace/${workspaceId}/invite`, { email });
 toast.success("Invitation email sent successfully");
 setEmail("");
 } catch (error) {
 console.error(error);
 toast.error("Failed to send invitation email");
 } finally {
 setIsSending(false);
 }
 };

 const inviteUrl = inviteCode ? `${window.location.origin}/invite/${inviteCode}` : "";

 return (
 <Dialog open={isModalOpen} onOpenChange={onClose}>
 <DialogContent className="sm:max-w-md bg-background border border-border/100 shadow-2xl rounded-lg overflow-hidden p-0">
 <div className="p-8 pb-4">
 <DialogHeader>
 <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
 <LinkIcon className="h-6 w-6 text-primary" />
 Invite Members
 </DialogTitle>
 <DialogDescription className="text-[10px] font-bold text-muted-foreground opacity-70">
 Share this link or send an email invitation to add collaborators.
 </DialogDescription>
 </DialogHeader>

 <div className="space-y-6 py-8">
 {/* Option 1: Share Link */}
 <div className="space-y-2 text-left">
 <Label className="text-[10px] font-bold text-muted-foreground ml-1">Share Link</Label>
 <div className="flex items-center space-x-2">
 <div className="relative flex-1">
 <Input
 readOnly
 disabled={isLoadingCode}
 value={isLoadingCode ? "GENERATING..." : inviteUrl}
 className="bg-muted/30 border-none rounded-lg h-12 text-[10px] font-bold text-foreground shadow-inner focus-visible:ring-0 truncate"
 />
 </div>
 <Button 
 size="icon" 
 onClick={handleCopy} 
 disabled={!inviteCode || isLoadingCode}
 className="shrink-0 rounded-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-12 w-12"
 >
 {isCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
 </Button>
 </div>
 <Button 
 variant="link" 
 size="sm" 
 className="text-[9px] text-muted-foreground hover:text-primary px-0 h-auto font-bold "
 onClick={handleGenerateNewLink}
 disabled={isLoadingCode}
 >
 {isLoadingCode ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
 Generate new link
 </Button>
 </div>

 {/* Option 2: Send Email */}
 <div className="space-y-2 text-left">
 <Label className="text-[10px] font-bold text-muted-foreground ml-1">Send Email Invitation</Label>
 <div className="flex space-x-2">
 <div className="relative flex-1">
 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <Input
 placeholder="colleague@company.com"
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="pl-12 bg-muted/30 border-none rounded-lg h-12 text-xs font-bold shadow-inner focus-visible:ring-1 focus-visible:ring-primary font-mono"
 />
 </div>
 <Button 
 disabled={isSending || !email || !inviteCode} 
 onClick={handleSendEmail}
 className="rounded-lg shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 h-12 px-6 font-bold text-[10px]"
 >
 {isSending ? <Loader2 className="h-4 w-4 animate-spin font-bold" /> : <Send className="h-4 w-4 mr-2" />}
 Send
 </Button>
 </div>
 </div>
 </div>
 </div>
 <div className="p-4 bg-muted/5 border-t border-border/10 text-center">
 <p className="text-[9px] font-bold text-muted-foreground opacity-50">
 Invitations are valid for 7 days.
 </p>
 </div>
 </DialogContent>
 </Dialog>
 );
};
