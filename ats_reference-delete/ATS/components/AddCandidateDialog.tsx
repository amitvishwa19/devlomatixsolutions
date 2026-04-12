import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { useAts } from "@/ATS/context/AtsContext";
import { toast } from "sonner";

const AddCandidateDialog = () => {
  const { addCandidate, jobs } = useAts();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    jobId: "",
    jobTitle: "",
    stage: "applied" as const,
    rating: 3,
    notes: [] as string[],
    skills: [] as string[],
    experience: "",
    source: "Company Website",
    skillInput: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.jobId) {
      toast.error("Please fill in all required fields");
      return;
    }
    const job = jobs.find((j) => j.id === form.jobId);
    addCandidate({
      name: form.name,
      email: form.email,
      phone: form.phone,
      jobId: form.jobId,
      jobTitle: job?.title || "",
      stage: form.stage,
      rating: form.rating,
      notes: [],
      skills: form.skills,
      experience: form.experience,
      source: form.source,
    });
    toast.success(`Candidate "${form.name}" added successfully`);
    setForm({ name: "", email: "", phone: "", jobId: "", jobTitle: "", stage: "applied", rating: 3, notes: [], skills: [], experience: "", source: "Company Website", skillInput: "" });
    setOpen(false);
  };

  const addSkill = () => {
    if (form.skillInput.trim()) {
      setForm({ ...form, skills: [...form.skills, form.skillInput.trim()], skillInput: "" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><UserPlus className="h-4 w-4" /> Add Candidate</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Candidate</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555-0100" />
            </div>
            <div className="space-y-2">
              <Label>Apply for *</Label>
              <Select value={form.jobId} onValueChange={(v) => setForm({ ...form, jobId: v })}>
                <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
                <SelectContent>
                  {jobs.filter((j) => j.status === "open").map((j) => (
                    <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Experience</Label>
              <Input value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="e.g. 5 years" />
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["LinkedIn", "Naukri", "Referral", "Company Website", "Recruiter"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex gap-2">
              <Input value={form.skillInput} onChange={(e) => setForm({ ...form, skillInput: e.target.value })} placeholder="Add a skill" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} />
              <Button type="button" variant="outline" onClick={addSkill} size="sm">Add</Button>
            </div>
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.skills.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                    {s}
                    <button type="button" onClick={() => setForm({ ...form, skills: form.skills.filter((_, j) => j !== i) })} className="hover:text-destructive">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Add Candidate</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCandidateDialog;
