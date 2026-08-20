'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Building2,
  MoreHorizontal,
  ChevronRight,
  Search,
  Trash2,
  Edit2,
  Info,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import useSWR from 'swr';
import { getDepartmentsAction, createDepartmentAction, deleteDepartmentAction } from "./_actions/department-actions";

export default function DepartmentsPage() {
  const { workspaceId } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal State
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New Department Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: departments, error, isLoading, mutate } = useSWR(
    workspaceId ? ['departments', workspaceId] : null,
    () => getDepartmentsAction(workspaceId).then(res => res.data)
  );

  const handleCreate = async () => {
    if (!name) {
      toast.error("Department name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createDepartmentAction(workspaceId, {
        name,
        description
      });
      if (!res.success) throw new Error(res.error);
      toast.success("Department created successfully!");
      setIsDialogOpen(false);
      setName("");
      setDescription("");
      mutate();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to create department");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!departmentToDelete) return;

    setIsDeleting(true);
    try {
      const res = await deleteDepartmentAction(departmentToDelete.id, workspaceId);
      if (res?.success) {
        toast.success(res.message || "Department deleted successfully!");
        setDepartmentToDelete(null);
        mutate();
      } else {
        toast.error(res?.error || "Failed to delete department");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete department");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted-foreground opacity-40 uppercase">
            <Link href={`/workspace/${workspaceId}/hireflow`} className="hover:text-primary transition-colors">HireFlow</Link>
            <ChevronRight size={10} />
            <Link href={`/workspace/${workspaceId}/hireflow/jobs`} className="hover:text-primary transition-colors">Jobs</Link>
            <ChevronRight size={10} />
            <span className="text-primary/60">Departments</span>
          </div>
          <h1 className="text-xl font-bold italic  flex items-center gap-3">
            <Building2 className="text-primary" size={24} />
            Department Categories
          </h1>
          <p className="text-[10px]   text-muted-foreground opacity-40">
            Manage functional units using the unified hierarchy system.
            <Link href={`/workspace/${workspaceId}/category`} className="text-primary ml-2 hover:underline  italic">View Full Hierarchy →</Link>
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-md px-6 font-bold bg-primary shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              New Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card/90 backdrop-blur-2xl border-border/40 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl  italic">Create Department</DialogTitle>
              <DialogDescription className="text-xs font-bold text-muted-foreground/60  mt-1">
                Add a new functional area to your ATS
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <label className="text-[10px]  uppercase text-muted-foreground/40 ml-1 tracking-widest">Department Name</label>
                <Input
                  placeholder="e.g. Engineering, Sales"
                  className="bg-muted/20 border-border/10 h-12 rounded-md font-bold shadow-inner"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px]  uppercase text-muted-foreground/40 ml-1 tracking-widest">Description (Optional)</label>
                <Textarea
                  placeholder="Briefly describe this department..."
                  className="bg-muted/20 border-border/10 min-h-[100px] rounded-md font-bold shadow-inner p-4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={isSubmitting}
                className="w-full h-12 rounded-md  uppercase text-[10px] tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                {isSubmitting ? "Creating..." : "Save Department"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Table */}
      <div className="bg-card/30 backdrop-blur-xl border border-border/40 rounded-md overflow-hidden shadow-2xl shadow-black/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/10">
                <th className="p-6 text-[10px] tracking-[0.2em] text-muted-foreground opacity-40 uppercase">Department</th>
                <th className="p-6 text-[10px] tracking-[0.2em] text-muted-foreground opacity-40 uppercase">Description</th>
                <th className="p-6 text-[10px] tracking-[0.2em] text-muted-foreground opacity-40 uppercase text-center">Created At</th>
                <th className="p-6 text-[10px] tracking-[0.2em] text-muted-foreground opacity-40"></th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && departments?.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {departments.map((dept, i) => (
                    <motion.tr
                      key={dept.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border/10 hover:bg-primary/5 transition-colors group cursor-default"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold group-hover:text-primary transition-colors tracking-tight">{dept.name}</h4>
                            <p className="text-[10px]  uppercase text-muted-foreground/40 tracking-wider">Functional Unit</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 max-w-xs">
                        <p className="text-xs font-medium text-muted-foreground line-clamp-2">
                          {dept.description || "No description provided."}
                        </p>
                      </td>
                      <td className="p-6 text-center">
                        <span className="text-[10px]  uppercase tracking-wider text-muted-foreground/60">
                          {new Date(dept.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md opacity-40 group-hover:opacity-100">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-md border-border/40 bg-card/90 backdrop-blur-xl">
                              <DropdownMenuItem className="text-xs font-bold  p-3 gap-2">
                                <Edit2 size={14} className="opacity-40" /> Edit Info
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-xs font-bold p-3 gap-2 text-rose-500 cursor-pointer"
                                onClick={() => setDepartmentToDelete(dept)}
                              >
                                <Trash2 size={14} className="opacity-40" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    {isLoading ? (
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        <p className="text-[10px]  ">Loading Departments...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <Info size={40} />
                        <div>
                          <p className="text-xs font-bold italic">No departments found.</p>
                          <p className="text-[10px]   mt-1">Create your first functional area above.</p>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Department Confirmation Modal */}
      <Dialog open={!!departmentToDelete} onOpenChange={(open) => !open && setDepartmentToDelete(null)}>
        <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-2xl border-destructive/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Delete Department
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-muted-foreground mt-2">
              Are you sure you want to delete <span className="font-bold text-foreground">{departmentToDelete?.name}</span>?
              Any job postings assigned to this department will remain intact but will be unassigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setDepartmentToDelete(null)}
              disabled={isDeleting}
              className="rounded-md font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="rounded-md font-bold"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                </span>
              ) : (
                "Delete Department"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
