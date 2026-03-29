"use client";

import { useState, useEffect } from "react";
import axios from "@/utils/axios";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModal } from "@/hooks/useModal";
import { UserPlus, Mail, Lock, User, Loader2, Eye, EyeOff, Check } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

export const AddUserModal = () => {
 const { isOpen, onClose, type, data } = useModal();
 const isModalOpen = isOpen && type === "addUser";
 const { workspaceId, roles, onApply } = data || {};

 const [isLoading, setIsLoading] = useState(false);
 const [showPassword, setShowPassword] = useState(false);
 
 const [formData, setFormData] = useState({
 displayName: "",
 email: "",
 password: "",
 roleIds: []
 });

 useEffect(() => {
 if (!isModalOpen) {
 setFormData({
 displayName: "",
 email: "",
 password: "",
 roleIds: []
 });
 setShowPassword(false);
 }
 }, [isModalOpen]);

 const handleRoleToggle = (roleId) => {
 setFormData(prev => ({
 ...prev,
 roleIds: prev.roleIds.includes(roleId)
 ? prev.roleIds.filter(id => id !== roleId)
 : [...prev.roleIds, roleId]
 }));
 };

 const onSubmit = async (e) => {
 e.preventDefault();
 if (!formData.email || !formData.password) return toast.error("Email and password are required");
 
 setIsLoading(true);
 try {
 await axios.post(`/api/workspace/${workspaceId}/management/user`, formData);
 toast.success("User created successfully");
 onClose();
 onApply?.();
 } catch (error) {
 console.error(error);
 toast.error(error.response?.data?.message || "Failed to create user");
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <Dialog open={isModalOpen} onOpenChange={onClose}>
 <DialogContent className="sm:max-w-md bg-background border border-border/100 shadow-2xl rounded-md overflow-hidden p-0">
 <form onSubmit={onSubmit}>
 <div className="p-8 pb-4">
 <DialogHeader>
 <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
 <UserPlus className="h-6 w-6 text-primary" />
 Create User
 </DialogTitle>
 <DialogDescription className="text-[10px] font-bold text-muted-foreground opacity-70">
 Manually create a new account and assign access roles.
 </DialogDescription>
 </DialogHeader>

 <div className="space-y-5 py-8">
 {/* Display Name */}
 <div className="space-y-2 text-left">
 <Label className="text-[10px] font-bold text-muted-foreground ml-1">Full Name</Label>
 <div className="relative">
 <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <Input
 placeholder="John Doe"
 value={formData.displayName}
 onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
 className="pl-12 bg-muted/30 border-none rounded-md h-12 text-xs font-bold shadow-inner focus-visible:ring-1 focus-visible:ring-primary"
 />
 </div>
 </div>

 {/* Email */}
 <div className="space-y-2 text-left">
 <Label className="text-[10px] font-bold text-muted-foreground ml-1">Email Address *</Label>
 <div className="relative">
 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <Input
 type="email"
 required
 placeholder="john@example.com"
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 className="pl-12 bg-muted/30 border-none rounded-md h-12 text-xs font-bold shadow-inner focus-visible:ring-1 focus-visible:ring-primary font-mono"
 />
 </div>
 </div>

 {/* Password */}
 <div className="space-y-2 text-left">
 <Label className="text-[10px] font-bold text-muted-foreground ml-1">Password *</Label>
 <div className="relative">
 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <Input
 type={showPassword ? "text" : "password"}
 required
 placeholder="••••••••"
 value={formData.password}
 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
 className="pl-12 pr-12 bg-muted/30 border-none rounded-md h-12 text-xs font-bold shadow-inner focus-visible:ring-1 focus-visible:ring-primary"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
 >
 {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
 </button>
 </div>
 </div>

 {/* Role Selection */}
 <div className="space-y-2 text-left">
 <Label className="text-[10px] font-bold text-muted-foreground ml-1">Assign Roles</Label>
 <div className="max-h-[140px] overflow-y-auto pr-2 space-y-2">
 {(!roles || roles.length === 0) && (
 <p className="text-[9px] font-bold text-muted-foreground px-2 py-4 bg-muted/20 border border-dashed border-border/40 rounded-md text-center">No roles available. Create roles first.</p>
 )}
 {roles?.map((role) => (
 <div 
 key={role.id} 
 className={`flex items-center justify-between p-3 rounded-md border transition-all cursor-pointer ${formData.roleIds.includes(role.id) ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-muted/10 border-border/10 hover:bg-muted/20'}`} 
 onClick={() => handleRoleToggle(role.id)}
 >
 <div className="flex items-center gap-2">
 <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: role.color || '#primary' }} />
 <span className="text-[10px] font-bold ">{role.title}</span>
 </div>
 <Checkbox 
 id={role.id} 
 checked={formData.roleIds.includes(role.id)}
 onCheckedChange={() => {}} // handled by parent div
 className="border-primary/50 data-[state=checked]:bg-primary rounded-full h-4 w-4"
 />
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>

 <DialogFooter className="p-8 bg-muted/5 border-t border-border/10">
 <Button
 type="button"
 variant="ghost"
 onClick={onClose}
 className="rounded-md font-bold px-6 h-11 text-[10px] "
 >
 Cancel
 </Button>
 <Button
 type="submit"
 disabled={isLoading || !formData.email || !formData.password}
 className="rounded-md font-bold px-8 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all h-11 text-[10px] "
 >
 {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
 Create User
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 );
};
