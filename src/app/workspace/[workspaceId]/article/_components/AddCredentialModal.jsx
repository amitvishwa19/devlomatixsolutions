'use client';

import { useState, useEffect } from 'react';
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { useModal } from "@/hooks/useModal";
import axios from "@/utils/axios";
import { toast } from "sonner";
import {
 Loader2,
 Shield,
 Key,
 Plus,
 Trash2,
 Database,
 Tag,
 User,
 Activity,
 Zap
} from "lucide-react";

const PLATFORM_CONFIG = {
 FACEBOOK: ['accessToken'],
 INSTAGRAM: ['accessToken', 'igUserId'],
 TWITTER: ['bearerToken'],
 X: ['bearerToken'],
 LINKEDIN: ['accessToken'],
 WHATSAPP: ['accessToken', 'phoneNumberId'],
 YOUTUBE: ['apiKey'],
 GMAIL: ['access_token', 'refresh_token'],
 GOOGLE: ['access_token', 'refresh_token'],
 GEMINI: ['apiKey'],
};

export const AddCredentialModal = () => {
 const { isOpen, onClose, type, data, activeModals } = useModal();
 const isModalOpen = !!activeModals["addCredential"];
 const modalData = activeModals["addCredential"] || {};
 const { workspaceId, onApply, initialData } = modalData;

 const [isLoading, setIsLoading] = useState(false);
 const [isTesting, setIsTesting] = useState(false);

 // Form States
 const [platform, setPlatform] = useState('');
 const [customPlatform, setCustomPlatform] = useState('');
 const [profileName, setProfileName] = useState('');
 const [status, setStatus] = useState('disconnected');
 const [fields, setFields] = useState([{ key: '', value: '' }]);

 const isEdit = !!initialData?.id;

 // Populate form for editing
 useEffect(() => {
 if (isEdit && initialData) {
 const platformKey = initialData.platform?.toUpperCase();
 const isPreset = !!PLATFORM_CONFIG[platformKey];

 setPlatform(isPreset ? platformKey : 'CUSTOM');
 if (!isPreset) setCustomPlatform(initialData.platform || '');

 setProfileName(initialData.profileName || '');
 setStatus(initialData.status || 'disconnected');

 // Map details to fields, excluding profileName
 if (initialData.details) {
 const dynamicFields = Object.entries(initialData.details)
 .filter(([key]) => key !== 'profileName')
 .map(([key, value]) => ({ key, value }));

 setFields(dynamicFields.length > 0 ? dynamicFields : [{ key: '', value: '' }]);
 }
 } else {
 setPlatform('');
 setCustomPlatform('');
 setProfileName('');
 setStatus('disconnected');
 setFields([{ key: '', value: '' }]);
 }
 }, [isEdit, initialData, isModalOpen]);

 // Update fields when platform changes (for new credentials)
 const handlePlatformChange = (val) => {
 setPlatform(val);
 if (!isEdit) {
 if (val === 'CUSTOM') {
 setFields([{ key: '', value: '' }]);
 setCustomPlatform('');
 } else {
 const config = PLATFORM_CONFIG[val.toUpperCase()];
 if (config) {
 setFields(config.map(key => ({ key, value: '' })));
 } else {
 setFields([{ key: '', value: '' }]);
 }
 }
 }
 };

 const addField = () => {
 setFields([...fields, { key: '', value: '' }]);
 };

 const removeField = (index) => {
 if (fields.length > 1) {
 setFields(fields.filter((_, i) => i !== index));
 }
 };

 const updateField = (index, part, val) => {
 const newFields = [...fields];
 newFields[index] = { ...newFields[index], [part]: val };
 setFields(newFields);
 };

 const onSubmit = async (e) => {
 e.preventDefault();

 const finalPlatform = platform === 'CUSTOM' ? customPlatform : platform;

 if (!finalPlatform) {
 toast.error("Please provide a platform name");
 return;
 }

 const validFields = fields.filter(f => f.key.trim() !== '');
 if (validFields.length === 0) {
 toast.error("Please provide at least one credential key and value");
 return;
 }

 const hasEmptyValues = validFields.some(f => !f.value.trim());
 if (hasEmptyValues) {
 toast.error("All credential fields must have a value");
 return;
 }

 setIsLoading(true);
 try {
 const credentialsObject = {};
 // We still store profileName in JSON for backward compatibility, 
 // but the API also saves it to the 'profile' column.
 if (profileName) credentialsObject.profileName = profileName;

 validFields.forEach(f => {
 credentialsObject[f.key.trim()] = f.value;
 });

 const payload = {
 platform: finalPlatform.toUpperCase(),
 credentials: credentialsObject,
 profile: profileName,
 status: status
 };

 if (isEdit) {
 await axios.patch(`/api/workspace/${workspaceId}/social/accounts/${initialData.id}`, payload);
 toast.success(`${finalPlatform} credentials updated successfully`);
 } else {
 await axios.post(`/api/workspace/${workspaceId}/social/accounts`, payload);
 toast.success(`${finalPlatform} credentials saved successfully`);
 }

 onApply?.();
 handleClose();
 } catch (error) {
 console.error(error);
 toast.error(isEdit ? "Failed to update credentials" : "Failed to save credentials");
 } finally {
 setIsLoading(false);
 setIsTesting(false);
 }
 };

 const handleClose = () => {
 if (!isEdit) {
 setPlatform('');
 setCustomPlatform('');
 setProfileName('');
 setStatus('connected');
 setFields([{ key: '', value: '' }]);
 }
 onClose("addCredential");
 };

 return (
 <Dialog open={isModalOpen} onOpenChange={handleClose}>
 <DialogContent className=" bg-background border border-border/100 rounded-lg shadow-2xl p-0 overflow-hidden">
 <form onSubmit={onSubmit} className="flex flex-col max-h-[85vh]">
 <DialogHeader className="p-8 pb-4">
 <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
 <Database className="text-primary h-6 w-6" /> {isEdit ? "Edit Credentials" : "Add Credentials"}
 </DialogTitle>
 </DialogHeader>

 <div className="flex-1 overflow-y-auto p-8 pt-0 space-y-6 scrollbar-hide">
 <div className="p-4 bg-primary/5 border border-primary/10 rounded-md flex items-start gap-3">
 <Shield className="text-primary h-5 w-5 mt-0.5 shrink-0" />
 <p className="text-xs font-bold text-muted-foreground leading-relaxed text-left">
 Provide the <span className="text-primary font-bold">API credentials</span> for your platform. These will be stored securely and used for multi-channel publishing.
 </p>
 </div>

 {/* Top Info */}
 <div className="grid grid-cols-2 gap-4 text-left">
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-muted-foreground opacity-70 ml-1 flex items-center gap-2">
 <Tag className="w-3 h-3" /> PLATFORM
 </label>
 <Select value={platform} onValueChange={handlePlatformChange} disabled={isLoading}>
 <SelectTrigger className="bg-muted/30 border-none rounded-md focus:ring-1 focus:ring-primary h-12 font-bold text-xs ">
 <SelectValue placeholder="Select Platform" />
 </SelectTrigger>
 <SelectContent className="rounded-xl border-border/20 shadow-2xl">
 {Object.keys(PLATFORM_CONFIG).map(p => (
 <SelectItem key={p} value={p} className="font-bold text-[10px] py-3">{p}</SelectItem>
 ))}
 <SelectItem value="CUSTOM" className="font-bold text-[10px] py-3 text-muted-foreground italic">Custom / Other</SelectItem>
 </SelectContent>
 </Select>
 </div>
 {platform === 'CUSTOM' ? (
 <div className="space-y-2 animate-in fade-in slide-in-from-left-2 transition-all">
 <label className="text-[10px] font-bold text-primary ml-1 flex items-center gap-2">
 <Zap className="w-3 h-3" /> CUSTOM PLATFORM NAME
 </label>
 <Input
 disabled={isLoading}
 placeholder="e.g. TIKTOK, REDDIT"
 value={customPlatform}
 onChange={(e) => setCustomPlatform(e.target.value)}
 className="bg-primary/5 border-primary/20 rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-inner h-12 font-bold text-xs"
 />
 </div>
 ) : (
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-muted-foreground opacity-70 ml-1 flex items-center gap-2">
 <User className="w-3 h-3" /> PROFILE NAME
 </label>
 <Input
 disabled={isLoading}
 placeholder="e.g. Personal Account"
 value={profileName}
 onChange={(e) => setProfileName(e.target.value)}
 className="bg-muted/30 border-none rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-inner h-12 font-bold"
 />
 </div>
 )}
 </div>

 {platform === 'CUSTOM' && (
 <div className="space-y-2 text-left animate-in fade-in slide-in-from-top-2">
 <label className="text-[10px] font-bold text-muted-foreground opacity-70 ml-1 flex items-center gap-2">
 <User className="w-3 h-3" /> PROFILE NAME
 </label>
 <Input
 disabled={isLoading}
 placeholder="e.g. Personal Account"
 value={profileName}
 onChange={(e) => setProfileName(e.target.value)}
 className="bg-muted/30 border-none rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-inner h-12 font-bold"
 />
 </div>
 )}

 <div className="space-y-2 text-left">
 <label className="text-[10px] font-bold text-muted-foreground opacity-70 ml-1 flex items-center gap-2">
 <Activity className="w-3 h-3" /> CONNECTION STATUS
 </label>
 <Select value={status} onValueChange={setStatus} disabled={isLoading}>
 <SelectTrigger className="bg-muted/30 border-none rounded-md focus:ring-1 focus:ring-primary h-12 font-bold text-xs ">
 <SelectValue placeholder="Select Status" />
 </SelectTrigger>
 <SelectContent className="rounded-xl border-border/20 shadow-2xl">
 <SelectItem value="connected" className="font-bold text-[10px] py-3">Connected</SelectItem>
 <SelectItem value="disconnected" className="font-bold text-[10px] py-3 text-muted-foreground">Disconnected</SelectItem>
 <SelectItem value="error" className="font-bold text-[10px] py-3 text-rose-500">Error / Expired</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {/* Dynamic Fields */}
 <div className="space-y-4 text-left">
 <div className="flex items-center justify-between">
 <label className="text-[10px] font-bold text-muted-foreground opacity-70 ml-1 flex items-center gap-2">
 <Key className="w-3 h-3" /> CREDENTIAL FIELDS
 </label>
 <Button
 type="button"
 variant="outline"
 size="sm"
 onClick={addField}
 className="text-[9px] font-bold rounded-md"
 >
 <Plus className="w-3 h-3 mr-1" /> ADD FIELD
 </Button>
 </div>

 <div className="space-y-3">
 {fields.map((field, index) => (
 <div key={index} className="flex gap-2 items-end group animate-in slide-in-from-top-2 duration-300">
 <div className="flex-1 space-y-1">
 <Input
 placeholder="Key (e.g. api_key)"
 value={field.key}
 onChange={(e) => updateField(index, 'key', e.target.value)}
 className="bg-muted/10 border-dashed border-border/40 rounded-md h-10 text-[10px] font-bold"
 />
 </div>
 <div className="flex-[2] space-y-1">
 <Input
 placeholder="Value"
 value={field.value}
 onChange={(e) => updateField(index, 'value', e.target.value)}
 className="bg-muted/30 border-none rounded-md h-10 text-[10px]"
 />
 </div>
 {fields.length > 1 && (
 <Button
 type="button"
 variant="ghost"
 size="icon"
 onClick={() => removeField(index)}
 className="h-10 w-10 text-muted-foreground/30 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
 >
 <Trash2 className="w-4 h-4" />
 </Button>
 )}
 </div>
 ))}
 </div>
 </div>
 </div>

 <DialogFooter className="p-8 bg-muted/10 border-t border-border/10 flex flex-row items-center gap-3">
 <Button
 type="button"
 variant="ghost"
 onClick={handleClose}
 className="px-6 rounded-md font-bold text-muted-foreground text-[10px]"
 >
 Cancel
 </Button>
 {isEdit && (
 <Button
 type="button"
 disabled={isTesting || isLoading}
 onClick={async () => {
 setIsTesting(true);
 const toastId = toast.loading(`Testing ${platform} connection...`);
 try {
 const credentialsObject = {};
 fields.forEach(f => {
 if (f.key.trim()) credentialsObject[f.key.trim()] = f.value;
 if (profileName) credentialsObject.profileName = profileName;
 });

 const finalPlatform = platform === 'CUSTOM' ? customPlatform : platform;

 const res = await axios.post(`/api/workspace/${workspaceId}/social/accounts/${initialData.id}/test`, {
 credentials: credentialsObject,
 platform: finalPlatform.toUpperCase()
 });
 if (res.data.success) {
 toast.success(res.data.message, { id: toastId });
 } else {
 const errorData = res.data.data;
 const detailedMsg = errorData?.error?.message || res.data.message;
 console.error("[TEST_FAILED_DETAILS]", errorData);
 toast.error(detailedMsg, {
 id: toastId,
 description: errorData?.error?.type ? `Type: ${errorData.error.type}` : undefined
 });
 }
 } catch (err) {
 toast.error(err?.response?.data?.message || 'Test failed', { id: toastId });
 } finally {
 setIsTesting(false);
 }
 }}
 className="px-6 rounded-md font-bold text-[10px] border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 transition-all"
 >
 {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
 Test Connection
 </Button>
 )}
 <Button
 type="submit"
 disabled={isLoading || isTesting}
 className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px] rounded-md font-extrabold text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-95"
 >
 {isLoading ? (
 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 ) : isEdit ? "Update Credentials" : "Save Credentials"}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 );
};
