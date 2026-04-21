'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  CheckCircle2,
  Loader2,
  FileText,
  Paperclip,
  ArrowRight,
  MapPin,
  Briefcase,
  DollarSign,
  Info,
  ListChecks,
  Gift
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import axios from 'axios';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const ApplyModal = ({ job, isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    portfolioUrl: ""
  });

  if (!job) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeUrl) {
      toast.error("Please upload your resume");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`/api/public/jobs/${job.id}/apply`, {
        ...formData,
        resumeUrl
      });

      if (response.data.success) {
        setIsSuccess(true);
        toast.success(response.data.message || "Application submitted successfully!");
      } else {
        toast.error(response.data.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("[APPLY_ERROR]", error);
      toast.error(error.response?.data?.error || "Internal Server Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF or Word documents are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      setResumeUrl(publicUrl);
      toast.success("Resume uploaded successfully!");
    } catch (error) {
      console.error("[UPLOAD_ERROR]", error);
      toast.error("Failed to upload resume to Supabase");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setResumeUrl("");
    setFormData({ name: "", email: "", phone: "", portfolioUrl: "" });
    onClose();
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md bg-background border-none rounded-3xl p-8 overflow-hidden">
          <div className="flex flex-col items-center text-center space-y-6 py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center"
            >
              <CheckCircle2 size={48} className="text-primary" />
            </motion.div>
            <div className="space-y-2">
              <h2 className="text-2xl tracking-tight">Application Sent!</h2>
              <p className="text-sm font-medium text-muted-foreground opacity-70">
                Thanks for applying to the <span className="text-primary font-bold">{job.title}</span> position at Devlomatix. We'll be in touch soon!
              </p>
            </div>
            <Button onClick={handleClose} className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]">
              Got it, thanks!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl min-h-[80vh] max-h-[90vh] min-w-[60vw] bg-background rounded-3xl p-0 overflow-hidden flex flex-col border">
        <div className="flex flex-col md:flex-row h-full min-h-[80vh] overflow-hidden">


          {/* Left Panel: Job Details */}
          <div className="flex-1 p-8 overflow-y-auto border-r border-border/40 scrollbar-hide h-[80vh] bg-card">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold px-3 py-1 rounded-full">{job.department}</Badge>
                <DialogTitle className="text-3xl tracking-tight leading-tight">{job.title}</DialogTitle>
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <MapPin size={14} className="text-primary" /> {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Briefcase size={14} className="text-primary" /> {job.type}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <DollarSign size={14} className="text-primary" /> {job.salaryRange || job.salary || 'Competitive'}
                  </div>
                </div>
              </div>

              <Separator className="bg-border/40" />

              <div className="space-y-6">
                <section className="space-y-3">
                  <h4 className="text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                    <Info size={14} /> About the Role
                  </h4>
                  <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed">
                    {job.description}
                  </p>
                </section>

                <section className="space-y-3">
                  <h4 className="text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                    <ListChecks size={14} /> Requirements
                  </h4>
                  <ul className="space-y-2">
                    {job?.requirements?.map((req, i) => (
                      <li key={i} className="text-sm font-medium text-muted-foreground/80 flex gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-3">
                  <h4 className="text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                    <Gift size={14} /> Benefits
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {job?.benefits?.map((benefit, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] font-bold border-primary/20 bg-primary/5 text-primary px-3 py-1.5 rounded-lg">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Right Panel: Application Form */}
          <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
            <div className="space-y-8">
              <div className="space-y-1">
                <h3 className="text-xl tracking-tight">Apply Now</h3>
                <p className="text-xs font-bold text-muted-foreground opacity-60">Complete the form below to start your journey.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground opacity-50 ml-1">Full Name</label>
                  <Input 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Amit Sharma" 
                    className="bg-muted/30 border-none h-12 rounded-xl text-sm font-bold focus-visible:ring-1 focus-visible:ring-primary shadow-inner" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground opacity-50 ml-1">Email</label>
                    <Input 
                      required 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="laksh@example.com" 
                      className="bg-muted/30 border-none h-12 rounded-xl text-sm font-bold focus-visible:ring-1 focus-visible:ring-primary shadow-inner" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground opacity-50 ml-1">Phone</label>
                    <Input 
                      required 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 97123 40450" 
                      className="bg-muted/30 border-none h-12 rounded-xl text-sm font-bold focus-visible:ring-1 focus-visible:ring-primary shadow-inner" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground opacity-50 ml-1">Portfolio / LinkedIn</label>
                  <Input 
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    placeholder="https://..." 
                    className="bg-muted/30 border-none h-12 rounded-xl text-sm font-bold focus-visible:ring-1 focus-visible:ring-primary shadow-inner" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground opacity-50 ml-1">Resume (PDF/Word only)</label>
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center gap-3 bg-muted/20 ${resumeUrl ? 'border-primary/50 bg-primary/5' : 'border-border/60 hover:border-primary/40'}`}
                  >
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-[11px] font-bold text-primary">Uploading...</p>
                      </div>
                    ) : resumeUrl ? (
                      <>
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                          <FileText size={20} />
                        </div>
                        <div className="text-center">
                          <p className="text-[11px] truncate max-w-[200px]">Resume Uploaded</p>
                          <p className="text-[9px] font-bold text-muted-foreground opacity-60">Click to replace</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-muted/40 rounded-xl flex items-center justify-center text-muted-foreground">
                          <Upload size={20} />
                        </div>
                        <div className="text-center">
                          <p className="text-[11px]">Upload your Resume</p>
                          <p className="text-[9px] font-bold text-muted-foreground opacity-60">PDF or Word (.doc, .docx) documents only</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Submit Application
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </div>
                    )}
                  </Button>
                  <p className="text-[9px] font-bold text-muted-foreground text-center mt-4 opacity-40">
                    By submitting, you agree to our recruitment privacy policy.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
