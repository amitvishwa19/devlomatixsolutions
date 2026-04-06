'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Rocket,
  Briefcase,
  MapPin,
  Users,
  Target,
  Info,
  Layout,
  Plus
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

export default function JobCreateSheet({ workspaceId, onSuccess }) {
  const [open, setOpen] = useState(false);
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
  const [description, setDescription] = useState('<h1>Job Description</h1><p>Describe the role, responsibilities, and impact here...</p>');

  const handlePublish = async () => {
    if (!title || !description) {
      toast.error("Please provide at least a title and description");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`/api/workspace/${workspaceId}/ats/jobs`, {
        title,
        description,
        categoryId,
        location,
        type,
        salaryRange,
        status: 'OPEN'
      });
      toast.success("Job position published successfully!");
      setOpen(false);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to publish job:", error);
      toast.error("Failed to publish job position");
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
    setDescription('<h1>Job Description</h1><p>Describe the role, responsibilities, and impact here...</p>');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="rounded-md px-6 font-bold bg-primary shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Create Position
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:min-w-[80%]  bg-transparent border-none p-2">
        <div className="flex flex-col h-full overflow-hidden bg-card rounded-md border h-full">
          {/* Header */}
          <div className="p-8 border-b border-white/5 bg-primary/5">
            <SheetHeader className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-primary/60 font-black uppercase mb-2">
                <Rocket className="w-4 h-4" />
                ATS Module
              </div>
              <SheetTitle className="text-xl font-bold">New Position</SheetTitle>
              <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Configure your job posting details</p>
            </SheetHeader>
          </div>

          {/* Form Content - Scrollable */}
          <ScrollArea className="flex-1">
            <div className="p-8 space-y-10">
              {/* Role Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-2">
                  <Info className="w-3.5 h-3.5" />
                  Basic Information
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground/40 ml-1 tracking-widest">Job Title</label>
                  <Input
                    placeholder="e.g. Senior Frontend Engineer"
                    className="bg-muted/20 border-border/10 h-14 rounded-md text-base font-bold focus-visible:ring-1 focus-visible:ring-primary shadow-inner"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground/40 ml-1 tracking-widest flex items-center justify-between">
                      Department
                      <span className="text-[8px] opacity-40 font-bold lowercase tracking-normal">
                        ({departments?.length || 0} available)
                      </span>
                    </label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger className="bg-muted/20 border-border/10 h-14 rounded-md text-xs font-bold shadow-inner focus:ring-1 focus:ring-primary/40">
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
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">No departments found.</p>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="text-[9px] h-auto p-0 text-primary uppercase font-black"
                              onClick={() => router.push(`/workspace/${workspaceId}/ats/departments`)}
                            >
                              Create One Now
                            </Button>
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground/40 ml-1 tracking-widest">Type</label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="bg-muted/20 border-border/10 h-14 rounded-md text-xs font-bold shadow-inner">
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
                    <label className="text-[10px] font-black uppercase text-muted-foreground/40 ml-1 tracking-widest">Location</label>
                    <Input
                      placeholder="e.g. Remote, City"
                      className="bg-muted/20 border-border/10 h-14 rounded-md text-xs font-bold shadow-inner"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground/40 ml-1 tracking-widest">Salary Range</label>
                    <Input
                      placeholder="e.g. 15L - 25L PA"
                      className="bg-muted/20 border-border/10 h-14 rounded-md text-xs font-bold shadow-inner"
                      value={salaryRange}
                      onChange={(e) => setSalaryRange(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Editor Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-2">
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
              className="h-12 rounded-md px-8 font-black uppercase text-[10px] tracking-widest border-border/40 hover:bg-muted/20 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              disabled={isSubmitting}
              className="h-12 rounded-md px-10 font-black uppercase text-[10px] tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
            >
              {isSubmitting ? "Publishing..." : "Publish Position"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
