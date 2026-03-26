'use client';

import { useState } from 'react';
import { 
 X, 
 User, 
 Mail, 
 Phone, 
 MapPin, 
 Type,
 Sparkles,
 Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';

export const CandidateModal = ({ isOpen, onClose, workspaceId, onSuccess }) => {
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [formData, setFormData] = useState({
 name: '',
 email: '',
 phone: '',
 location: '',
 summary: '',
 skills: ''
 });

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!formData.name || !formData.email) {
 toast.error("Name and Email are required");
 return;
 }

 setIsSubmitting(true);
 try {
 const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
 await axios.post(`/api/workspace/${workspaceId}/ats/candidates`, {
 ...formData,
 skills: skillsArray
 });
 toast.success("Candidate added successfully");
 onSuccess?.();
 onClose();
 setFormData({
 name: '',
 email: '',
 phone: '',
 location: '',
 summary: '',
 skills: ''
 });
 } catch (error) {
 console.error("Failed to add candidate:", error);
 toast.error("Failed to add candidate");
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <Dialog open={isOpen} onOpenChange={onClose}>
 <DialogContent className="sm:max-w-[500px] rounded-2xl border-border/40 bg-card/95 backdrop-blur-2xl shadow-2xl p-0 overflow-hidden">
 <DialogHeader className="p-8 pb-4">
 <DialogTitle className="text-2xl font-black flex items-center gap-2">
 <User className="text-primary w-6 h-6" />
 Add New Candidate
 </DialogTitle>
 </DialogHeader>

 <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-6">
 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-[10px] font-black text-muted-foreground opacity-50 ml-1">Full Name</label>
 <Input 
 placeholder="John Doe" 
 className="bg-muted/30 border-none h-12 rounded-xl text-sm font-bold shadow-inner"
 value={formData.name}
 onChange={(e) => setFormData({...formData, name: e.target.value})}
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black text-muted-foreground opacity-50 ml-1">Email Address</label>
 <Input 
 type="email"
 placeholder="john@example.com" 
 className="bg-muted/30 border-none h-12 rounded-xl text-sm font-bold shadow-inner"
 value={formData.email}
 onChange={(e) => setFormData({...formData, email: e.target.value})}
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-[10px] font-black text-muted-foreground opacity-50 ml-1">Phone Number</label>
 <Input 
 placeholder="+91 99999 99999" 
 className="bg-muted/30 border-none h-12 rounded-xl text-sm font-bold shadow-inner"
 value={formData.phone}
 onChange={(e) => setFormData({...formData, phone: e.target.value})}
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black text-muted-foreground opacity-50 ml-1">Location</label>
 <Input 
 placeholder="Delhi, Remote" 
 className="bg-muted/30 border-none h-12 rounded-xl text-sm font-bold shadow-inner"
 value={formData.location}
 onChange={(e) => setFormData({...formData, location: e.target.value})}
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-black text-muted-foreground opacity-50 ml-1">Skills (Comma separated)</label>
 <Input 
 placeholder="React, Node.js, Next.js" 
 className="bg-muted/30 border-none h-12 rounded-xl text-sm font-bold shadow-inner"
 value={formData.skills}
 onChange={(e) => setFormData({...formData, skills: e.target.value})}
 />
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-black text-muted-foreground opacity-50 ml-1">Professional Summary</label>
 <Textarea 
 placeholder="Short overview of candidate's profile..." 
 className="bg-muted/30 border-none rounded-xl text-sm font-bold shadow-inner min-h-[100px] resize-none"
 value={formData.summary}
 onChange={(e) => setFormData({...formData, summary: e.target.value})}
 />
 </div>
 </div>

 <DialogFooter className="p-0 sm:justify-end gap-3">
 <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold">
 Cancel
 </Button>
 <Button 
 type="submit" 
 disabled={isSubmitting}
 className="bg-primary hover:bg-primary/90 rounded-xl font-black tracking-[0.2em] text-[10px] px-8 py-6 h-auto shadow-lg shadow-primary/20"
 >
 {isSubmitting ? "Adding..." : "Add Candidate"}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 );
};
