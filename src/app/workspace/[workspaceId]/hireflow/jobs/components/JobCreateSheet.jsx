'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Rocket,
    Briefcase,
    MapPin,
    Users,
    Target,
    Info,
    Layout,
    Plus,
    Save,
    Loader2,
    X,
    Check,
    ChevronsUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import TipTap from '@/components/global/TipTap';
import JoditRichEditor from '@/components/global/JoditRichEditor';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import useSWR from 'swr';
import { getDepartmentsAction, createDepartmentAction } from '../../../departments/_actions/department-actions';
import { createJobAction, updateJobAction } from '../../../_actions/job-actions';

const JOB_TYPES = [
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Internship', label: 'Internship' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Hybrid', label: 'Hybrid' },
    { value: 'Temporary', label: 'Temporary' },
    { value: 'Freelance', label: 'Freelance' },
];

export default function JobCreateSheet({ workspaceId, onSuccess, data, isEdit = false, open, setOpen }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data Fetching
    const { data: departments, isLoading: isLoadingDepts, mutate: mutateDepts } = useSWR(
        open && workspaceId ? ['departments', workspaceId] : null,
        () => getDepartmentsAction(workspaceId).then(res => res.data)
    );

    // Form State
    const [title, setTitle] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [location, setLocation] = useState("");
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [isTypePopoverOpen, setIsTypePopoverOpen] = useState(false);
    const [salaryRange, setSalaryRange] = useState("");
    const [description, setDescription] = useState('');
    const [editorType, setEditorType] = useState('jodit');

    const toggleType = (val) => {
        setSelectedTypes(prev =>
            prev.includes(val) ? prev.filter(item => item !== val) : [...prev, val]
        );
    };

    // Quick Add Department State
    const [quickDeptName, setQuickDeptName] = useState("");
    const [isCreatingDept, setIsCreatingDept] = useState(false);
    const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);

    const handleQuickAddDepartment = async (nameToCreate) => {
        const targetName = (nameToCreate || quickDeptName).trim();
        if (!targetName) {
            toast.error("Department name is required");
            return;
        }

        setIsCreatingDept(true);
        try {
            const res = await createDepartmentAction(workspaceId, {
                name: targetName
            });
            if (!res.success) throw new Error(res.error);

            toast.success(`Department "${targetName}" created & selected!`);
            const newDept = res.data;
            await mutateDepts();
            if (newDept?.id) {
                setCategoryId(newDept.id);
            }
            setQuickDeptName("");
            setIsAddDeptModalOpen(false);
        } catch (error) {
            console.error("Failed to create department:", error);
            toast.error(error.message || "Failed to create department");
        } finally {
            setIsCreatingDept(false);
        }
    };

    useEffect(() => {
        if (open) {
            if (isEdit && data) {
                setTitle(data.title || "");
                setCategoryId(data.categoryId || "");
                setLocation(data.location || "");
                if (Array.isArray(data.type)) {
                    setSelectedTypes(data.type);
                } else if (typeof data.type === 'string' && data.type.trim()) {
                    setSelectedTypes(data.type.split(',').map(t => t.trim()).filter(Boolean));
                } else {
                    setSelectedTypes([]);
                }
                setSalaryRange(data.salaryRange || "");
                setDescription(data.description || '');
            } else {
                resetForm();
            }
        }
    }, [isEdit, data, open]);

    const handlePublish = async () => {
        if (!title) {
            toast.error("Please provide at least a title");
            return;
        }

        setIsSubmitting(true);
        try {
            const typeString = selectedTypes.join(', ');
            const payload = {
                title,
                description,
                categoryId,
                location,
                type: typeString || 'FULL_TIME',
                salaryRange,
                status: data?.status || 'OPEN'
            };

            if (isEdit && data?.id) {
                const res = await updateJobAction(workspaceId, data.id, payload);
                if (!res.success) throw new Error(res.error);
                toast.success("Job position updated successfully!");
            } else {
                const res = await createJobAction(workspaceId, payload);
                if (!res.success) throw new Error(res.error);
                toast.success("Job position published successfully!");
            }

            setOpen(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Failed to save job:", error);
            toast.error(error.message || "Failed to save job position");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setCategoryId("");
        setLocation("");
        setSelectedTypes([]);
        setSalaryRange("");
        setDescription('');
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent className="w-full sm:min-w-[80%] bg-transparent border-none p-2">
                <div className="flex flex-col overflow-hidden bg-card rounded-md border h-full">
                    {/* Header */}
                    <div className="p-2 border-b border-white/5 bg-primary/5">
                        <SheetHeader className="space-y-1">
                            <div className="flex items-center gap-2 text-primary/60   mb-2">
                                <Rocket className="w-4 h-4" />
                                ATS Module
                            </div>
                            <SheetTitle className="text-xl font-bold">
                                {isEdit ? "Update Position" : "New Position"}
                            </SheetTitle>
                            <p className="text-xs font-bold text-muted-foreground/60   mt-1">
                                {isEdit ? `Editing: ${data?.title}` : "Configure your job posting details"}
                            </p>
                        </SheetHeader>
                    </div>

                    {/* Form Content - Scrollable */}
                    <ScrollArea className="flex-1 h-[70vh]">
                        <div className="p-8 space-y-10">
                            {/* Role Details */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2   text-muted-foreground text-xs mb-2">
                                    <Info className="w-3.5 h-3.5" />
                                    Basic Information
                                </div>

                                <div className="space-y-2">
                                    <label className="  text-muted-foreground text-xs ml-1 ">Job Title</label>
                                    <Input
                                        placeholder="e.g. Senior Frontend Engineer"
                                        className="bg-muted/20 border rounded-md  shadow-inner"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6 items-center">
                                    <div className="space-y-2">
                                        <label className="text-muted-foreground text-xs ml-1">
                                            Department
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 min-w-0">
                                                <Select value={categoryId} onValueChange={setCategoryId}>
                                                    <SelectTrigger className="bg-muted/20 borderborder rounded-md text-xs font-bold shadow-inner focus:ring-1 focus:ring-primary/40 w-full">
                                                        <SelectValue placeholder={isLoadingDepts ? "Loading..." : "Select Department"} />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-md border bg-card/95 backdrop-blur-xl">
                                                        {/* Quick Add Header inside Select Dropdown */}
                                                        <div className="p-2 border-b border bg-muted/20" onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex items-center gap-1.5">
                                                                <Input
                                                                    placeholder="+ Quick add department..."
                                                                    value={quickDeptName}
                                                                    onChange={(e) => setQuickDeptName(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        e.stopPropagation();
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            handleQuickAddDepartment();
                                                                        }
                                                                    }}
                                                                    className="h-8 text-xs bg-background border focus-visible:ring-1 focus-visible:ring-primary"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleQuickAddDepartment();
                                                                    }}
                                                                    disabled={isCreatingDept || !quickDeptName.trim()}
                                                                    className="h-8 px-2.5 text-[11px] font-bold bg-primary text-white shrink-0"
                                                                >
                                                                    {isCreatingDept ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {departments?.map((dept) => (
                                                            <SelectItem key={dept.id} value={dept.id} className="text-xs font-bold py-2.5">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dept.color || '#3b82f6' }} />
                                                                    {dept.name}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                        {(!departments || departments.length === 0) && !isLoadingDepts && (
                                                            <div className="p-4 text-center">
                                                                <p className="opacity-40 text-xs">No departments found.</p>
                                                            </div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Add Button right after Department dropdown */}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setIsAddDeptModalOpen(true)}
                                                title="Add new department"
                                                className="h-9 w-9 shrink-0 border bg-muted/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors rounded-md"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-muted-foreground text-xs ml-1">Type (Select Multiple)</label>
                                        <Popover open={isTypePopoverOpen} onOpenChange={setIsTypePopoverOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={isTypePopoverOpen}
                                                    className="w-full justify-between bg-muted/20 border rounded-md text-xs font-bold shadow-inner h-auto min-h-[38px] py-1.5 px-3 hover:bg-muted/30"
                                                >
                                                    <div className="flex flex-wrap gap-1 items-center max-w-[90%]">
                                                        {selectedTypes.length > 0 ? (
                                                            selectedTypes.map((t) => {
                                                                const label = JOB_TYPES.find(item => item.value === t)?.label || t;
                                                                return (
                                                                    <Badge
                                                                        key={t}
                                                                        variant="secondary"
                                                                        className="text-[10px] py-0.5 px-2 bg-primary/10 text-primary border border-primary/20 flex items-center gap-1 font-bold rounded-sm"
                                                                    >
                                                                        {label}
                                                                        <span
                                                                            role="button"
                                                                            tabIndex={0}
                                                                            onPointerDown={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                            }}
                                                                            onMouseDown={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                            }}
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                toggleType(t);
                                                                            }}
                                                                            className="inline-flex items-center justify-center p-0.5 hover:bg-red-500/20 hover:text-red-500 rounded transition-colors cursor-pointer"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </span>
                                                                    </Badge>
                                                                );
                                                            })
                                                        ) : (
                                                            <span className="text-muted-foreground/60 text-xs font-normal">Select Types...</span>
                                                        )}
                                                    </div>
                                                    <ChevronsUpDown className="w-3.5 h-3.5 opacity-50 shrink-0 ml-1" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[240px] p-2 bg-card/95 border shadow-xl rounded-md backdrop-blur-xl">
                                                <div className="space-y-1">
                                                    <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/40 mb-1">
                                                        Job Types
                                                    </div>
                                                    {JOB_TYPES.map((item) => {
                                                        const isSelected = selectedTypes.includes(item.value);
                                                        return (
                                                            <div
                                                                key={item.value}
                                                                onClick={() => toggleType(item.value)}
                                                                className={`flex items-center justify-between px-2.5 py-1.5 text-xs font-bold rounded-sm cursor-pointer transition-colors ${isSelected
                                                                        ? 'bg-primary/10 text-primary font-bold'
                                                                        : 'hover:bg-muted text-foreground'
                                                                    }`}
                                                            >
                                                                <span>{item.label}</span>
                                                                {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="  text-muted-foreground text-xs ml-1 ">Location</label>
                                        <Input
                                            placeholder="e.g. Remote, City"
                                            className="bg-muted/20 border rounded-md text-xs  shadow-inner"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="  text-muted-foreground text-xs ml-1 ">Salary Range</label>
                                        <Input
                                            placeholder="e.g. 15L - 25L PA"
                                            className="bg-muted/20 border rounded-md text-xs  shadow-inner"
                                            value={salaryRange}
                                            onChange={(e) => setSalaryRange(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Editor Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2 tracking-[0.2em] text-muted-foreground text-xs">
                                        <Layout className="w-3.5 h-3.5" />
                                        Job Description
                                    </div>
                                    <div className="flex items-center gap-1 border border rounded-lg p-0.5 bg-muted/10 text-[10px] font-bold">
                                        <button
                                            type="button"
                                            onClick={() => setEditorType('jodit')}
                                            className={`px-3 py-1 rounded-md transition-all ${editorType === 'jodit'
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            Classic Editor
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditorType('tiptap')}
                                            className={`px-3 py-1 rounded-md transition-all ${editorType === 'tiptap'
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            TipTap Editor
                                        </button>
                                    </div>
                                </div>
                                <div className="min-h-[400px]">
                                    {editorType === 'jodit' ? (
                                        <JoditRichEditor data={description} onChange={setDescription} />
                                    ) : (
                                        <div className="border border-border/20 rounded-md overflow-hidden focus-within:border-primary/40 transition-colors bg-muted/5 shadow-inner animate-in fade-in duration-300">
                                            <TipTap data={description} onChange={setDescription} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Footer Actions */}
                    <div className="p-8 border-t border-white/5 bg-background/50 flex items-center justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className=" rounded-md px-8    border hover:bg-muted/20 transition-all"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePublish}
                            disabled={isSubmitting}
                            className={`rounded-md px-10 text-xs text-white shadow-lg active:scale-95 transition-all ${isEdit ? 'bg-primary hover:bg-primary/90 shadow-primary/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'}`}
                        >
                            {isSubmitting ? (isEdit ? "Saving..." : "Publishing...") : (isEdit ? "Save Changes" : "Publish Position")}
                        </Button>
                    </div>
                </div>

                {/* Quick Add Department Modal */}
                <Dialog open={isAddDeptModalOpen} onOpenChange={setIsAddDeptModalOpen}>
                    <DialogContent className="sm:max-w-[400px] bg-card border border-border/60 shadow-2xl rounded-md">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold flex items-center gap-2">
                                <Plus className="w-4 h-4 text-primary" /> Add New Department
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Create a new department and select it automatically for this job post.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 py-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground">Department Name *</label>
                                <Input
                                    placeholder="e.g. Engineering, Marketing, Sales"
                                    value={quickDeptName}
                                    onChange={(e) => setQuickDeptName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleQuickAddDepartment();
                                        }
                                    }}
                                    className="text-xs bg-muted/20 border"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setIsAddDeptModalOpen(false)} size="sm" className="h-8 text-xs font-bold">
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleQuickAddDepartment()}
                                disabled={isCreatingDept || !quickDeptName.trim()}
                                size="sm"
                                className="h-8 text-xs font-bold bg-primary text-white"
                            >
                                {isCreatingDept ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Add & Select"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </SheetContent>
        </Sheet>
    );
}


