'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Share2, UserX, UserPlus, Users, Check, ShieldCheck, Layers, Sparkles } from 'lucide-react';

import {
    shareCrmContactAction,
    removeCrmContactShareAction,
    updateCrmContactModulesAction
} from '../../_actions/crm-share-contact-actions';
import { getCrmTeamMembersAction } from '../../_actions/team-actions';

const MODULES_CONFIG = [
    { id: 'crm', label: 'CRM (DevX)', desc: 'Visible in CRM 360° Contacts and Deals pipeline' },
    { id: 'ats', label: 'ATS (HireFlow)', desc: 'Visible in HireFlow Candidates directory' },
    { id: 'konnectx', label: 'KonnectX (WhatsApp)', desc: 'Visible in KonnectX messaging & templates' }
];

export default function CrmShareContactModal({
    isOpen,
    onClose,
    contact,
    workspaceId,
    currentUserId,
    onShareUpdated
}) {
    const [teamMembers, setTeamMembers] = useState([]);
    const [loadingTeam, setLoadingTeam] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const [revokingUserId, setRevokingUserId] = useState(null);
    const [selectedModules, setSelectedModules] = useState(['crm']);
    const [isSavingModules, setIsSavingModules] = useState(false);

    // Sync selected modules when contact changes
    useEffect(() => {
        if (Array.isArray(contact?.moduleAccess?.modules)) {
            setSelectedModules(contact.moduleAccess.modules);
        } else {
            setSelectedModules(['crm']);
        }
    }, [contact]);

    // Load workspace users when modal opens
    useEffect(() => {
        if (!isOpen || !workspaceId) return;

        async function loadTeam() {
            setLoadingTeam(true);
            try {
                const res = await getCrmTeamMembersAction(workspaceId);
                if (res.success && res.data) {
                    setTeamMembers(res.data);
                }
            } catch (err) {
                console.error("Failed to load team members:", err);
            } finally {
                setLoadingTeam(false);
            }
        }

        loadTeam();
        setSelectedUserId('');
    }, [isOpen, workspaceId]);

    if (!contact) return null;

    const isOwner = contact.userId === currentUserId;
    const currentSharedWith = contact.sharedWith || [];
    const sharedUserIds = new Set(currentSharedWith.map(s => s.sharedWithUserId));

    // Filter available team members to exclude users already shared with and current user
    const availableMembers = teamMembers.filter(
        m => m.id !== currentUserId && !sharedUserIds.has(m.id)
    );

    const handleShare = async () => {
        if (!selectedUserId) {
            toast.error("Please select a team member to share with");
            return;
        }

        setIsSharing(true);
        try {
            const res = await shareCrmContactAction(workspaceId, {
                contactId: contact.id,
                targetUserId: selectedUserId
            });

            if (res.success) {
                toast.success(`Contact shared with ${res.data?.sharedWith?.displayName || 'team member'}`);
                setSelectedUserId('');
                if (onShareUpdated) onShareUpdated();
            } else {
                toast.error(res.error || "Failed to share contact");
            }
        } catch (err) {
            console.error("Share error:", err);
            toast.error("An error occurred while sharing contact");
        } finally {
            setIsSharing(false);
        }
    };

    const handleRemoveShare = async (sharedWithUserId, userName) => {
        setRevokingUserId(sharedWithUserId);
        try {
            const res = await removeCrmContactShareAction(workspaceId, {
                contactId: contact.id,
                sharedWithUserId
            });

            if (res.success) {
                toast.success(`Revoked share access for ${userName || 'user'}`);
                if (onShareUpdated) onShareUpdated();
            } else {
                toast.error(res.error || "Failed to revoke access");
            }
        } catch (err) {
            console.error("Revoke error:", err);
            toast.error("An error occurred while revoking share");
        } finally {
            setRevokingUserId(null);
        }
    };

    const handleModuleToggle = async (moduleId) => {
        if (!isOwner) {
            toast.error("Only the owner can modify module visibility");
            return;
        }

        let updated;
        if (selectedModules.includes(moduleId)) {
            // Prevent removing all modules
            if (selectedModules.length === 1) {
                toast.error("Contact must belong to at least one module");
                return;
            }
            updated = selectedModules.filter(m => m !== moduleId);
        } else {
            updated = [...selectedModules, moduleId];
        }

        setSelectedModules(updated);
        setIsSavingModules(true);
        try {
            const res = await updateCrmContactModulesAction(workspaceId, {
                contactId: contact.id,
                modules: updated
            });

            if (res.success) {
                toast.success(`Module visibility updated (${updated.join(', ').toUpperCase()})`);
                if (onShareUpdated) onShareUpdated();
            } else {
                toast.error(res.error || "Failed to update module visibility");
                // Revert
                setSelectedModules(contact.moduleAccess?.modules || ['crm']);
            }
        } catch (err) {
            toast.error("Failed to update module visibility");
            setSelectedModules(contact.moduleAccess?.modules || ['crm']);
        } finally {
            setIsSavingModules(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg bg-card border-border shadow-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Share2 className="w-4 h-4" />
                        </div>
                        <span>Manage Modules & Team Sharing</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Configure which app modules <strong className="text-foreground">{contact.name}</strong> appears in and which team members can access it.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Contact Identity Summary */}
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-foreground">{contact.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                                {contact.phone} {contact.email ? `• ${contact.email}` : ''}
                            </p>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-semibold">
                            {contact.type || 'CONTACT'}
                        </Badge>
                    </div>

                    {/* Section 1: Multi-Module Visibility */}
                    <div className="space-y-2 pt-1 border-t border-border/60">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-primary" />
                                <span>Module Visibility (Cross-Module Sync)</span>
                            </Label>
                            {isSavingModules && (
                                <span className="text-[10px] text-primary flex items-center gap-1 animate-pulse">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            When enabled, this record is synchronized and accessible in multiple sub-apps at once.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                            {MODULES_CONFIG.map((mod) => {
                                const checked = selectedModules.includes(mod.id);
                                return (
                                    <div
                                        key={mod.id}
                                        onClick={() => isOwner && handleModuleToggle(mod.id)}
                                        className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                                            checked
                                                ? 'bg-primary/5 border-primary text-foreground shadow-xs'
                                                : 'bg-card border-border/70 text-muted-foreground hover:border-border'
                                        } ${!isOwner ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold">{mod.label}</span>
                                            {checked && <Check className="w-3.5 h-3.5 text-primary" />}
                                        </div>
                                        <p className="text-[10px] leading-tight text-muted-foreground">
                                            {mod.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Section 2: Owner Status */}
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>
                            {isOwner ? (
                                <strong className="text-foreground">You own this contact record.</strong>
                            ) : (
                                <>
                                    Owned by <strong className="text-foreground">{contact.user?.displayName || contact.user?.email || 'Team Member'}</strong>
                                </>
                            )}
                        </span>
                    </div>

                    {/* Section 3: Share with Team Members (only if owner or admin) */}
                    {isOwner && (
                        <div className="space-y-2 pt-1 border-t border-border/60">
                            <Label className="text-xs font-semibold">Share with Team Member</Label>
                            <div className="flex items-center gap-2">
                                <Select
                                    value={selectedUserId}
                                    onValueChange={setSelectedUserId}
                                    disabled={loadingTeam || availableMembers.length === 0}
                                >
                                    <SelectTrigger className="h-9 text-xs flex-1 bg-background border-border">
                                        <SelectValue
                                            placeholder={
                                                loadingTeam
                                                    ? "Loading team members..."
                                                    : availableMembers.length === 0
                                                    ? "All team members already have access"
                                                    : "Select sales team member..."
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableMembers.map((member) => (
                                            <SelectItem key={member.id} value={member.id} className="text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span>{member.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">({member.email})</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleShare}
                                    disabled={!selectedUserId || isSharing}
                                    className="h-9 px-3.5 text-xs font-semibold gap-1.5 shrink-0"
                                >
                                    {isSharing ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <UserPlus className="w-3.5 h-3.5" />
                                    )}
                                    <span>Share</span>
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Section 4: Currently Shared List */}
                    <div className="space-y-2 pt-2 border-t border-border/60">
                        <div className="flex items-center justify-between text-xs">
                            <Label className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                                Shared Access ({currentSharedWith.length})
                            </Label>
                        </div>

                        {currentSharedWith.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic py-2.5 text-center bg-muted/20 rounded-xl border border-dashed border-border/60">
                                This contact has not been shared with any team members yet.
                            </p>
                        ) : (
                            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                {currentSharedWith.map((share) => {
                                    const u = share.sharedWith;
                                    const isRevoking = revokingUserId === share.sharedWithUserId;

                                    return (
                                        <div
                                            key={share.id}
                                            className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/70 hover:border-border transition-colors text-xs"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <Avatar className="w-7 h-7">
                                                    <AvatarImage src={u?.avatar} />
                                                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                                                        {u?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-foreground truncate text-xs">
                                                        {u?.displayName || u?.email || 'Team Member'}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground truncate">
                                                        {u?.email}
                                                    </p>
                                                </div>
                                            </div>

                                            {(isOwner || share.sharedWithUserId === currentUserId) && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    title="Revoke access"
                                                    disabled={isRevoking}
                                                    onClick={() => handleRemoveShare(share.sharedWithUserId, u?.displayName || u?.email)}
                                                >
                                                    {isRevoking ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <UserX className="w-3.5 h-3.5" />
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="pt-2">
                    <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
