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
    Save
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
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import axios from 'axios';
import TipTap from '@/components/global/TipTap';
import { ScrollArea } from '@/components/ui/scroll-area';
import useSWR from 'swr';

const fetcher = url => axios.get(url).then(res => res.data);

export default function JobCreateSheet({ workspaceId, onSuccess, data, isEdit = false, open, setOpen }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data Fetching
    const { data: departments, isLoading: isLoadingDepts } = useSWR(
        open ? `/api/workspace/${workspaceId}/ats/departments` : null,
        fetcher
    );

    // Form State
    const [title, setTitle] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [location, setLocation] = useState("");
    const [type, setType] = useState("");
    const [salaryRange, setSalaryRange] = useState("");
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (open) {
            if (isEdit && data) {
                setTitle(data.title || "");
                setCategoryId(data.categoryId || "");
                setLocation(data.location || "");
                setType(data.type || "");
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
            const payload = {
                title,
                description,
                categoryId,
                location,
                type,
                salaryRange,
                status: data?.status || 'OPEN'
            };

            if (isEdit && data?.id) {
                await axios.put(`/api/workspace/${workspaceId}/ats/jobs/${data.id}`, payload);
                toast.success("Job position updated successfully!");
            } else {
                await axios.post(`/api/workspace/${workspaceId}/ats/jobs`, payload);
                toast.success("Job position published successfully!");
            }

            setOpen(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Failed to save job:", error.response?.data || error);
            const errMsg = error.response?.data?.message || error.response?.data?.error || "Failed to save job position";
            toast.error(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setCategoryId("");
        setLocation("");
        setType("");
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
                                <div className="flex items-center gap-2   text-muted-foreground/40 mb-2">
                                    <Info className="w-3.5 h-3.5" />
                                    Basic Information
                                </div>

                                <div className="space-y-2">
                                    <label className="  text-muted-foreground/40 ml-1 ">Job Title</label>
                                    <Input
                                        placeholder="e.g. Senior Frontend Engineer"
                                        className="bg-muted/20 border rounded-md  shadow-inner"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6 items-center">
                                    <div className="space-y-2">
                                        <label className="  text-muted-foreground/40 ml-1 ">
                                            Department
                                        </label>
                                        <Select value={categoryId} onValueChange={setCategoryId}>
                                            <SelectTrigger className="bg-muted/20 borderborder rounded-md text-xs font-bold shadow-inner focus:ring-1 focus:ring-primary/40">
                                                <SelectValue placeholder={isLoadingDepts ? "Loading..." : "Select Department"} />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-md border-border/40 bg-card/90 backdrop-blur-xl">
                                                {departments?.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.id} className="text-xs font-bold py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dept.color || '#3b82f6' }} />
                                                            {dept.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                                {(!departments || departments.length === 0) && !isLoadingDepts && (
                                                    <div className="p-8 text-center space-y-2">
                                                        <p className="   opacity-40">No departments found.</p>
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="  text-muted-foreground/40 ml-1 ">Type</label>
                                        <Select value={type} onValueChange={setType}>
                                            <SelectTrigger className="bg-muted/20 border rounded-md text-xs font-bold shadow-inner">
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-md border-border/40 bg-card/90 backdrop-blur-xl">
                                                <SelectItem value="FULL_TIME">Full-time</SelectItem>
                                                <SelectItem value="PART_TIME">Part-time</SelectItem>
                                                <SelectItem value="CONTRACT">Contract</SelectItem>
                                                <SelectItem value="INTERNSHIP">Internship</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="  text-muted-foreground/40 ml-1 ">Location</label>
                                        <Input
                                            placeholder="e.g. Remote, City"
                                            className="bg-muted/20 border rounded-md text-xs  shadow-inner"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="  text-muted-foreground/40 ml-1 ">Salary Range</label>
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
                                <div className="flex items-center gap-2   tracking-[0.2em] text-muted-foreground/40 mb-2">
                                    <Layout className="w-3.5 h-3.5" />
                                    Job Description
                                </div>
                                <div className="min-h-[400px] border border-border/20 rounded-md overflow-hidden focus-within:border-primary/40 transition-colors bg-muted/5 shadow-inner">
                                    <TipTap data={description} onChange={setDescription} />
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Footer Actions */}
                    <div className="p-8 border-t border-white/5 bg-background/50 flex items-center justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className=" rounded-md px-8    border-border/40 hover:bg-muted/20 transition-all"
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
            </SheetContent>
        </Sheet>
    );
}


