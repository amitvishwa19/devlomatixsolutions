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
  Loader2,
  Briefcase
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
import { DeleteConfirmDialog } from '@/app/workspace/_components/DeleteConfirmDialog';
import {
  getDepartmentsAction,
  createDepartmentAction,
  updateDepartmentAction,
  deleteDepartmentAction
} from "./_actions/department-actions";

export default function DepartmentsPage() {
  const { workspaceId } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit State
  const [editingDepartment, setEditingDepartment] = useState(null);

  // Delete Modal State
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: departments, error, isLoading, mutate } = useSWR(
    workspaceId ? ['departments', workspaceId] : null,
    () => getDepartmentsAction(workspaceId).then(res => res.data)
  );

  const handleOpenCreate = () => {
    setEditingDepartment(null);
    setName("");
    setDescription("");
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDepartment(dept);
    setName(dept.name || "");
    setDescription(dept.description || "");
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Department name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingDepartment) {
        const res = await updateDepartmentAction(workspaceId, editingDepartment.id, {
          name: name.trim(),
          description: description.trim()
        });
        if (!res.success) throw new Error(res.error);
        toast.success("Department updated successfully!");
      } else {
        const res = await createDepartmentAction(workspaceId, {
          name: name.trim(),
          description: description.trim()
        });
        if (!res.success) throw new Error(res.error);
        toast.success("Department created successfully!");
      }

      setIsDialogOpen(false);
      setName("");
      setDescription("");
      setEditingDepartment(null);
      mutate();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save department");
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
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground opacity-60">
            <Link href={`/workspace/${workspaceId}/hireflow`} className="hover:text-primary transition-colors">HireFlow</Link>
            <ChevronRight size={12} />
            <Link href={`/workspace/${workspaceId}/hireflow/jobs`} className="hover:text-primary transition-colors">Jobs</Link>
            <ChevronRight size={12} />
            <span className="text-primary font-medium">Departments</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">HireFlow Departments</h1>
              <p className="text-xs text-muted-foreground">
                Manage organizational departments and functional units for job categorizations.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="rounded-lg h-9 font-semibold bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Department
        </Button>
      </div>

      {/* Main Table */}
      <div className="bg-card/40 backdrop-blur-xl border border-border/40 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20 text-xs font-semibold text-muted-foreground">
                <th className="p-4 pl-6">Department Name</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-center">Active Jobs</th>
                <th className="p-4 text-center">Created Date</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && departments?.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {departments.map((dept, i) => (
                    <motion.tr
                      key={dept.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-border/20 hover:bg-muted/10 transition-colors group"
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-foreground">{dept.name}</h4>
                            <p className="text-[10px] text-muted-foreground font-mono">{dept.slug || 'functional-unit'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 max-w-sm">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {dept.description || <span className="italic opacity-50">No description provided</span>}
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant="secondary" className="text-xs font-semibold gap-1 px-2 py-0.5">
                          <Briefcase size={12} className="opacity-60" />
                          {dept._count?.jobs || 0} Jobs
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs text-muted-foreground font-mono">
                          {new Date(dept.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-60 group-hover:opacity-100">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 rounded-xl border-border/40 bg-card/95 backdrop-blur-xl">
                            <DropdownMenuItem
                              className="text-xs font-semibold p-2.5 gap-2 cursor-pointer"
                              onClick={() => handleOpenEdit(dept)}
                            >
                              <Edit2 size={14} className="opacity-60" /> Edit Info
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-xs font-semibold p-2.5 gap-2 text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                              onClick={() => setDepartmentToDelete(dept)}
                            >
                              <Trash2 size={14} /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                <tr>
                  <td colSpan="5" className="p-16 text-center">
                    {isLoading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground">Loading Departments...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <div className="p-3 bg-muted/30 rounded-full">
                          <Building2 size={32} className="opacity-40" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">No departments found</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Create your first department to start organizing job postings.</p>
                        </div>
                        <Button
                          onClick={handleOpenCreate}
                          size="sm"
                          className="mt-2 text-xs font-semibold"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5" />
                          Add Department
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Department Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[440px] bg-card border border-border/60 shadow-2xl rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-3 bg-muted/20 border-b border-border/40">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              {editingDepartment ? "Edit Department" : "Create Department"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingDepartment
                ? "Update functional area details for this workspace."
                : "Add a new functional area to your recruitment pipeline."}
            </DialogDescription>
          </DialogHeader>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Department Name</label>
              <Input
                placeholder="e.g. Engineering, Sales, Operations"
                className="h-10 text-xs rounded-lg bg-background border-border/50"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Description (Optional)</label>
              <Textarea
                placeholder="Briefly describe this department..."
                className="min-h-[100px] text-xs rounded-lg bg-background border-border/50 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="p-4 pt-0 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="h-9 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting || !name.trim()}
              className="h-9 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                editingDepartment ? "Update Department" : "Create Department"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Standard Delete Department Confirmation Modal */}
      <DeleteConfirmDialog
        isOpen={!!departmentToDelete}
        onClose={() => setDepartmentToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Department"
        entityName={departmentToDelete?.name}
        description={
          <>
            Are you sure you want to delete department <span className="font-bold text-foreground">{departmentToDelete?.name}</span>?
            Any job postings assigned to this department will remain intact but will be unassigned.
          </>
        }
        confirmText="Delete Department"
        isDeleting={isDeleting}
      />
    </div>
  );
}
