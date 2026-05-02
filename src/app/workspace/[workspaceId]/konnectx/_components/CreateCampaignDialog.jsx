import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from"@/components/ui/dialog";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Textarea } from"@/components/ui/textarea";
import { Switch } from"@/components/ui/switch";
import { useState, useEffect } from"react";



export default function CreateCampaignDialog({
 open,
 onOpenChange,
 onSave,
 editCampaign
}) {
 const [formData, setFormData] = useState({
 name:"",
 template:"",
 status:"draft",
 autoReplyEnabled: true
 });

 useEffect(() => {
 if (editCampaign) {
 setFormData({
 name: editCampaign.name,
 template: editCampaign.template,
 status: editCampaign.status,
 autoReplyEnabled: editCampaign.autoReplyEnabled
 });
 } else {
 setFormData({
 name:"",
 template:"",
 status:"draft",
 autoReplyEnabled: true
 });
 }
 }, [editCampaign, open]);

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="bg-[#111315] border-[#1F2328] text-white max-w-2xl">
 <DialogHeader>
 <DialogTitle>{editCampaign ?"Edit Campaign":"Create New Campaign"}</DialogTitle>
 <DialogDescription className="sr-only">
 {editCampaign ?"Make changes to your campaign here.":"Fill in the details to create a new WhatsApp campaign."}
 </DialogDescription>
 </DialogHeader>
 <div className="space-y-6 py-4">
 <div className="space-y-2">
 <label className="text-sm font-medium text-[#A0AEC0]">Campaign Name</label>
 <Input
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 placeholder="e.g. Summer Sale Promo"
 className="bg-[#1A1D21] border-[#2D3748] text-white"/>
 
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-[#A0AEC0]">Message Template</label>
 <Textarea
 value={formData.template}
 onChange={(e) => setFormData({ ...formData, template: e.target.value })}
 placeholder="Hi {{name}}! 👋..."
 className="bg-[#1A1D21] border-[#2D3748] text-white min-h-[150px]"/>
 
 </div>
 <div className="flex items-center justify-between p-4 bg-[#1A1D21] rounded-md border border-[#2D3748]">
 <div className="space-y-0.5">
 <label className="text-sm font-medium text-white">Auto Reply</label>
 <p className="text-xs text-[#A0AEC0]">Enable AI-powered automatic responses</p>
 </div>
 <Switch
 checked={formData.autoReplyEnabled}
 onCheckedChange={(checked) => setFormData({ ...formData, autoReplyEnabled: checked })} />
 
 </div>
 </div>
 <DialogFooter>
 <Button variant="ghost"onClick={() => onOpenChange(false)} className="text-[#A0AEC0] hover:text-white">
 Cancel
 </Button>
 <Button
 onClick={() => {
 onSave(formData);
 onOpenChange(false);
 }}
 className="bg-emerald-500 hover:bg-emerald-600 text-white">
 
 {editCampaign ?"Save Changes":"Create Campaign"}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>);

}