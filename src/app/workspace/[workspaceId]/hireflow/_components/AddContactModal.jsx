'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    User, 
    Phone, 
    Mail, 
    Tag, 
    Users, 
    Plus, 
    X, 
    Loader2, 
    Check, 
    UserPlus, 
    FolderPlus,
    Palette
} from 'lucide-react';
import { toast } from 'sonner';
import { 
    saveCandidateAsContactAction, 
    getContactMetaAction, 
    createContactCategoryAction 
} from '../_actions/contact-actions';

const POPULAR_TAGS = ['Candidate', 'High Priority', 'Shortlisted', 'Interviewed', 'Talent Pool', 'Engineering', 'Lead', 'Customer'];

const CATEGORY_COLORS = [
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#8b5cf6', // Purple
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#64748b', // Slate
];

export default function AddContactModal({
    isOpen,
    onOpenChange,
    candidate,
    workspaceId,
    onCategoryCreated,
    onSaved
}) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [selectedGroupIds, setSelectedGroupIds] = useState([]);

    // Category Creation State
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');
    const [localCategories, setLocalCategories] = useState([]);
    const [groups, setGroups] = useState([]);

    const [isLoadingMeta, setIsLoadingMeta] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingCategory, setIsSavingCategory] = useState(false);

    // Track open state
    const prevOpenRef = useRef(false);

    // Clean Phone number helper
    const extractCleanPhone = (raw) => {
        if (!raw) return '';
        let digits = String(raw).replace(/\D/g, '');
        if (digits.length === 11 && digits.startsWith('0')) {
            digits = digits.substring(1);
        }
        if (digits.length === 10) {
            digits = '91' + digits;
        }
        return digits;
    };

    // Load workspace meta (categories, groups)
    useEffect(() => {
        if (isOpen && workspaceId) {
            fetchMeta();
        }
    }, [isOpen, workspaceId]);

    const fetchMeta = async () => {
        setIsLoadingMeta(true);
        try {
            const res = await getContactMetaAction(workspaceId);
            if (res.success && res.data) {
                setLocalCategories(res.data.categories || []);
                setGroups(res.data.groups || []);
            }
        } catch (e) {
            console.error("[ADD_CONTACT_MODAL] Failed to fetch meta:", e);
        } finally {
            setIsLoadingMeta(false);
        }
    };

    useEffect(() => {
        const isOpening = isOpen && !prevOpenRef.current;

        if (isOpening) {
            if (candidate) {
                setName(candidate.name || '');
                setPhone(extractCleanPhone(candidate.phone));
                setEmail(candidate.email || '');

                const candCategory = candidate.departmentName || 
                                     candidate.applications?.[0]?.job?.category?.name || 
                                     candidate.applications?.[0]?.job?.department || 
                                     '';
                setCategory(candCategory);

                const candSkills = candidate.skills || candidate.tags || [];
                const initialTags = candSkills.length > 0 ? Array.from(new Set(['Candidate', ...candSkills])) : ['Candidate'];
                setTags(initialTags);
                setSelectedGroupIds([]);
            } else {
                setName('');
                setPhone('');
                setEmail('');
                setCategory('');
                setTags(['Candidate']);
                setSelectedGroupIds([]);
            }
            setTagInput('');
            setIsCreatingCategory(false);
            setNewCategoryName('');
        }

        prevOpenRef.current = isOpen;
    }, [isOpen, candidate]);

    const handleCreateCategory = async (e) => {
        e?.preventDefault?.();
        if (!newCategoryName.trim()) {
            toast.error("Category name is required");
            return;
        }

        setIsSavingCategory(true);
        try {
            const res = await createContactCategoryAction(workspaceId, {
                name: newCategoryName.trim(),
                color: newCategoryColor
            });

            if (res.success && res.data) {
                toast.success("Category created successfully!");
                setLocalCategories(prev => {
                    if (prev.some(c => c.name.toLowerCase() === res.data.name.toLowerCase())) {
                        return prev;
                    }
                    return [...prev, res.data];
                });
                setCategory(res.data.name);
                setNewCategoryName('');
                setIsCreatingCategory(false);
                onCategoryCreated?.();
            } else {
                throw new Error(res.error || "Failed to create category");
            }
        } catch (err) {
            toast.error(err?.message || "Failed to create category");
        } finally {
            setIsSavingCategory(false);
        }
    };

    const handleAddTag = (tagToAdd) => {
        const clean = (tagToAdd || tagInput).trim().replace(',', '');
        if (clean && !tags.includes(clean)) {
            setTags(prev => [...prev, clean]);
        }
        setTagInput('');
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(prev => prev.filter(t => t !== tagToRemove));
    };

    const handleKeyDownTag = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleToggleGroup = (groupId) => {
        setSelectedGroupIds(prev => 
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Contact name is required");
            return;
        }
        if (!phone.trim()) {
            toast.error("Phone number is required");
            return;
        }

        setIsLoading(true);
        try {
            const res = await saveCandidateAsContactAction(workspaceId, {
                name: name.trim(),
                phone: phone.trim(),
                email: email.trim() || undefined,
                category: category || undefined,
                tags,
                groupIds: selectedGroupIds,
                candidateId: candidate?.id,
                title: candidate?.role || candidate?.applications?.[0]?.job?.title,
                address: candidate?.location,
                notes: candidate?.summary || candidate?.aiSummary
            });

            if (res.success) {
                toast.success("Contact saved successfully!");
                onSaved?.(res.data);
                onOpenChange(false);
            } else {
                throw new Error(res.error || "Failed to save contact");
            }
        } catch (err) {
            toast.error(err?.message || "Failed to save contact");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px] bg-card border-border/60 shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-foreground">
                                Add Candidate to Contacts
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                Assign name, category, custom tags, and broadcast groups to this candidate
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <ScrollArea className="max-h-[70vh] px-6 py-4 space-y-5">
                        {/* Section 1: Basic Information */}
                        <div className="space-y-3.5">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <User className="w-3.5 h-3.5 text-primary" />
                                <span>Contact Details</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label className="text-xs font-semibold">
                                        Full Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. John Doe"
                                        className="h-9 text-xs bg-background/50 border-border/50"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        WhatsApp Phone <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                                        <Input
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="919876543210"
                                            className="h-9 pl-8 text-xs bg-background/50 border-border/50 font-mono"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="john@example.com"
                                            className="h-9 pl-8 text-xs bg-background/50 border-border/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Category / Main Segment */}
                        <div className="space-y-2.5 pt-2 border-t border-border/40">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <FolderPlus className="w-3.5 h-3.5 text-blue-400" />
                                    <span>Category / Segment</span>
                                </Label>
                                <div className="flex items-center gap-2">
                                    {category && !isCreatingCategory && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-[10px] text-muted-foreground hover:text-foreground px-1.5"
                                            onClick={() => setCategory('')}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        variant={isCreatingCategory ? "secondary" : "ghost"}
                                        size="sm"
                                        className="h-6 text-[10px] text-primary hover:text-primary gap-1 px-2 border border-primary/20 bg-primary/5 hover:bg-primary/10"
                                        onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                                    >
                                        <Plus className="w-3 h-3" />
                                        {isCreatingCategory ? "Cancel" : "Add Category"}
                                    </Button>
                                </div>
                            </div>

                            {/* Inline New Category Creation Form */}
                            {isCreatingCategory ? (
                                <div className="p-3 bg-muted/20 border border-primary/20 rounded-xl space-y-3 animate-in fade-in zoom-in duration-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                                            <Palette className="w-3.5 h-3.5 text-primary" />
                                            Create New Category
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            placeholder="Category Name (e.g. Engineering, Sales, Leadership)"
                                            className="h-8 text-xs bg-background border-border/60 flex-1"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleCreateCategory();
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="h-8 text-xs px-3 bg-primary text-primary-foreground gap-1 shrink-0 font-medium"
                                            onClick={handleCreateCategory}
                                            disabled={isSavingCategory || !newCategoryName.trim()}
                                        >
                                            {isSavingCategory ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                                            Save
                                        </Button>
                                    </div>

                                    {/* Color Picker Circles */}
                                    <div className="flex items-center gap-1.5 pt-0.5">
                                        <span className="text-[10px] text-muted-foreground mr-1">Color:</span>
                                        {CATEGORY_COLORS.map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setNewCategoryColor(c)}
                                                className={`w-5 h-5 rounded-full transition-all flex items-center justify-center ${newCategoryColor === c ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100'}`}
                                                style={{ backgroundColor: c }}
                                            >
                                                {newCategoryColor === c && <Check className="w-2.5 h-2.5 text-white" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Select 
                                    value={category || "NONE"} 
                                    onValueChange={(val) => {
                                        if (val === "CREATE_NEW") {
                                            setIsCreatingCategory(true);
                                        } else if (val === "NONE") {
                                            setCategory("");
                                        } else {
                                            setCategory(val);
                                        }
                                    }}
                                >
                                    <SelectTrigger className="h-9 text-xs bg-background/50 border-border/50">
                                        <SelectValue placeholder="Select a Category..." />
                                    </SelectTrigger>
                                    <SelectContent className="z-50">
                                        <SelectItem value="NONE" className="text-xs text-muted-foreground">None</SelectItem>
                                        {localCategories.map((cat) => (
                                            <SelectItem key={cat.id || cat.name} value={cat.name} className="text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="w-2 h-2 rounded-full shrink-0" 
                                                        style={{ backgroundColor: cat.color || '#3b82f6' }} 
                                                    />
                                                    <span>{cat.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="CREATE_NEW" className="text-xs font-semibold text-primary border-t border-border/40 mt-1 pt-1">
                                            <div className="flex items-center gap-1.5">
                                                <Plus className="w-3 h-3" />
                                                <span>+ Create new category...</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* Section 3: Custom Tags */}
                        <div className="space-y-2.5 pt-2 border-t border-border/40">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5 text-amber-400" />
                                <span>Tags & Badges</span>
                            </Label>

                            {/* Current Active Tags */}
                            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-background/40 border border-border/40 rounded-lg">
                                {tags.length === 0 ? (
                                    <span className="text-[11px] text-muted-foreground/60 italic self-center">
                                        No tags added yet. Type below or pick a preset.
                                    </span>
                                ) : (
                                    tags.map((t) => (
                                        <Badge 
                                            key={t} 
                                            variant="secondary" 
                                            className="text-[11px] font-medium gap-1 pl-2 pr-1 py-0.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                                        >
                                            {t}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(t)}
                                                className="hover:text-destructive p-0.5 rounded-full"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))
                                )}
                            </div>

                            {/* Tag Input */}
                            <div className="flex gap-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleKeyDownTag}
                                    placeholder="Type a tag and press Enter..."
                                    className="h-8 text-xs bg-background/50 border-border/50"
                                />
                                <Button 
                                    type="button" 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-8 text-xs px-2.5 gap-1 shrink-0 font-semibold"
                                    onClick={() => handleAddTag()}
                                    disabled={!tagInput.trim()}
                                >
                                    <Plus className="w-3 h-3" />
                                    Add
                                </Button>
                            </div>

                            {/* Popular Tag Presets */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[10px] text-muted-foreground font-semibold uppercase mr-1">Suggestions:</span>
                                {POPULAR_TAGS.map((pt) => {
                                    const isAdded = tags.includes(pt);
                                    return (
                                        <button
                                            key={pt}
                                            type="button"
                                            onClick={() => isAdded ? handleRemoveTag(pt) : handleAddTag(pt)}
                                            className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                                                isAdded 
                                                    ? 'bg-primary/20 border-primary/40 text-primary font-bold' 
                                                    : 'bg-muted/40 border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/70'
                                            }`}
                                        >
                                            {isAdded ? '✓ ' : '+ '}{pt}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Section 4: WhatsApp Groups Membership */}
                        <div className="space-y-2.5 pt-2 border-t border-border/40">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Broadcast Groups ({selectedGroupIds.length})</span>
                                </Label>
                                <span className="text-[10px] text-muted-foreground">
                                    {groups.length} available
                                </span>
                            </div>

                            {groups.length === 0 ? (
                                <div className="text-center py-4 px-2 border rounded-lg border-dashed border-border/40 bg-muted/10 text-xs text-muted-foreground">
                                    No broadcast groups created yet.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                                    {groups.map((group) => {
                                        const isChecked = selectedGroupIds.includes(group.id);
                                        return (
                                            <div
                                                key={group.id}
                                                onClick={() => handleToggleGroup(group.id)}
                                                className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-all select-none ${
                                                    isChecked
                                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-foreground font-semibold'
                                                        : 'bg-background/40 border-border/40 text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    <div className={`w-2 h-2 rounded-full shrink-0 ${isChecked ? 'bg-emerald-400' : 'bg-muted-foreground/40'}`} />
                                                    <span className="truncate">{group.name}</span>
                                                </div>
                                                <Checkbox
                                                    checked={isChecked}
                                                    onCheckedChange={() => handleToggleGroup(group.id)}
                                                    className="shrink-0"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <DialogFooter className="px-6 py-3.5 border-t border-border/40 bg-muted/10 flex items-center justify-between gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            className="h-9 text-xs font-semibold gap-1.5 shadow-xs bg-primary hover:bg-primary/90"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="w-3.5 h-3.5" />
                                    Save to Contacts
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
