import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useAts } from "@/ATS/context/AtsContext";
import { toast } from "sonner";

const AddJobDialog = () => {
  const { addJob } = useAts();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    title: string; department: string; location: string; type: string; salary: string; status: "open" | "closed" | "draft"; description: string;
  }>({
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    salary: "",
    status: "draft",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.department || !form.location) {
      toast.error("Please fill in all required fields");
      return;
    }
    addJob(form);
    toast.success(`Job "${form.title}" created successfully`);
    setForm({ title: "", department: "", location: "", type: "Full-time", salary: "", status: "draft", description: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Job</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Frontend Developer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept">Department *</Label>
              <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {["Engineering", "Design", "Marketing", "Sales", "Analytics", "HR"].map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Remote" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Job Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Full-time", "Part-time", "Contract", "Internship"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="salary">Salary Range</Label>
              <Input id="salary" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="e.g. $100k - $140k" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "open" | "closed" | "draft" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Job description..." rows={4} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Create Job</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddJobDialog;
