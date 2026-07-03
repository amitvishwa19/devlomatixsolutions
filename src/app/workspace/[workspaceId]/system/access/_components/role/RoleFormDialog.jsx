import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, } from "@/components/ui/sheet";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Loader, Save, ShieldUser, ShieldPlus, Plus, Check, Workflow } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

import { useAccess } from "@/providers/WorkspaceProvider";
import { upsertRole } from "../../_action/upsert-role";
import { useSession } from "next-auth/react";
import { useAction } from "@/hooks/use-action";
import { SecurityFlow } from "../shared/SecurityFlow";
import { GeneralRoleForm } from "./GeneralRoleForm";
import { RoleInfo } from "./RoleInfo";
import { NavigationPermissionForm } from "../permission/NavigationPermissionForm";

/* ------------------ Schema ------------------ */

const roleSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(2).max(50),
    description: z.string().max(200).optional(),
    color: z.string(),
    permissions: z.array(z.any()), // FULL permission objects
    parentId: z.string().optional().nullable(),
});


/* ================== COMPONENT ================== */

export function RoleFormDialog({ isOpen, mode, onClose, role, onSubmit, }) {
    const { permissions, roles, resolveRolePermissions } = useAccess();
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            id: "",
            title: "",
            description: "",
            color: "#0d9488",
            permissions: [],
            parentId: "none",
        },
    });

    const currentFormPermissions = form.watch("permissions") || [];
    const activePermissions = currentFormPermissions.filter(p => p.status);

    useEffect(() => {
        if (!permissions?.length) return;

        if (role) {
            // EDIT MODE
            const rolePermissionIds = new Set(
                role.permissions.map((p) => (typeof p === "string" ? p : p.id))
            );

            form.reset({
                id: role.id,
                title: role.title,
                description: role.description,
                color: role.color,
                permissions: permissions.map((p) => ({
                    ...p,
                    status: rolePermissionIds.has(p.id),
                })),
                parentId: role.parentId || "none",
            });
        } else {
            // ADD MODE (ALL UNCHECKED)
            form.reset({
                id: "",
                title: "",
                description: "",
                color: "#0d9488",
                permissions: permissions.map((p) => ({
                    ...p,
                    status: false,
                })),
                parentId: "none",
            });
        }
    }, [role, permissions]);



    const { execute } = useAction(upsertRole, {
        onSuccess: (data) => {
            console.log('Role from server action', data.role)
            toast.success("Role saved", { id: "role-data" });
            update(); // PRODUCTION GRADE: Refresh session data immediately
            onSubmit?.(data?.role);
            handleOpenChange()
        },
        onError: (error) => {
            const errorMsg = typeof error === 'string' ? error : (error?.message || "Failed to save role");
            toast.error(errorMsg, { id: "role-data" });
            setLoading(false);
        },
    });


    const handleSubmit = async (values) => {
        setLoading(true);
        toast.loading("Saving role...", { id: "role-data" });

        const payload = {
            ...values,
            parentId: values.parentId === "none" ? null : values.parentId
        };

        await execute({ formData: payload });
    };


    const handleOpenChange = () => {
        onClose()
        setLoading(false)
        form.reset()
    }

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetContent className="min-w-[620px] bg-transparent border-0 shadow-none p-2">
                <div className="bg-card rounded-md flex flex-col h-full border overflow-hidden shadow-2xl">
                    <SheetHeader className="border-b p-6 bg-muted/5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-md bg-primary/10 border border-primary/20 shadow-inner">
                                <ShieldUser className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold tracking-tight">
                                    {role ? "Edit Role" : "Create Role"}
                                </SheetTitle>
                                <SheetDescription className="text-sm opacity-70">
                                    Define role details and structural permissions
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    <div id='tabbed-content' className="flex-1 flex flex-col overflow-hidden">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(handleSubmit, () => {
                                    toast.error("Please fix the form errors", { id: "role-data" });
                                })}
                                className="flex flex-col flex-1 overflow-hidden"
                            >
                                <ScrollArea className="flex-1 h-[82vh]">
                                    <Accordion id='role-accordian' type="single" collapsible defaultValue="role-info" className="px-4 py-2 space-y-2">

                                        {/* Role Information */}
                                        <AccordionItem value="role-info" className="border border-primary/20 rounded-lg bg-card/50 overflow-hidden group/item">
                                            <AccordionTrigger className="px-4 bg-muted/40 hover:bg-muted/50 transition-colors group-data-[state=open]/item:border-b border-primary/10 cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-md bg-primary/10 border border-primary/20 group-data-[state=open]/item:bg-primary/20 transition-colors">
                                                        <ShieldUser className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div className="text-left py-1">
                                                        <h4 className="text-sm font-bold tracking-tight">Role Information</h4>
                                                        <p className="text-[10px] text-muted-foreground opacity-60">Identity and visual signature</p>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-0 pb-0">
                                                <RoleInfo form={form} />
                                            </AccordionContent>
                                        </AccordionItem>

                                        {/* Permissions Assignment */}
                                        <AccordionItem value="role-permissions" className="border border-primary/20 rounded-lg bg-card/50 overflow-hidden group/item">
                                            <AccordionTrigger className="px-4 bg-muted/40 hover:bg-muted/50 transition-colors cursor-pointer group-data-[state=open]/item:border-b border-primary/10">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-md bg-primary/10 border border-primary/20 group-data-[state=open]/item:bg-primary/20 transition-colors">
                                                        <ShieldPlus className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div className="text-left py-1">
                                                        <h4 className="text-sm font-bold tracking-tight">Permissions Assignment</h4>
                                                        <p className="text-[10px] text-muted-foreground opacity-60">Operation scopes and access levels</p>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-0 pb-0">
                                                <GeneralRoleForm form={form} />
                                            </AccordionContent>
                                        </AccordionItem>

                                        {/* Security Flow Analysis */}
                                        <AccordionItem value="flow" className="border border-primary/20 rounded-lg bg-card/50 overflow-hidden group/item">
                                            <AccordionTrigger className="px-4 bg-muted/40 hover:bg-muted/50 transition-colors cursor-pointer group-data-[state=open]/item:border-b border-primary/10">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-md bg-primary/10 border border-primary/20 group-data-[state=open]/item:bg-primary/20 transition-colors">
                                                        <Workflow className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div className="text-left py-1">
                                                        <h4 className="text-sm font-bold tracking-tight">Security Impact Analysis</h4>
                                                        <p className="text-[10px] text-muted-foreground opacity-60">Visualize structural reach & inheritance</p>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-0 pb-0">
                                                <SecurityFlow
                                                    role={form.getValues()}
                                                    activePermissions={activePermissions}
                                                />
                                            </AccordionContent>
                                        </AccordionItem>

                                        {/* Navigation Access */}
                                        <AccordionItem value="role-navigation" className="border border-primary/20 rounded-lg bg-card/50 overflow-hidden group/item">
                                            <AccordionTrigger className="px-4 bg-muted/40 hover:bg-muted/50 transition-colors cursor-pointer group-data-[state=open]/item:border-b border-primary/10">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-md bg-primary/10 border border-primary/20 group-data-[state=open]/item:bg-primary/20 transition-colors">
                                                        <Plus className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div className="text-left py-1">
                                                        <h4 className="text-sm font-bold tracking-tight">Navigation Access</h4>
                                                        <p className="text-[10px] text-muted-foreground opacity-60">UI sidebar routes and menu assignment</p>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-0 pb-0">
                                                <NavigationPermissionForm form={form} />
                                            </AccordionContent>
                                        </AccordionItem>

                                    </Accordion>
                                </ScrollArea>

                                <SheetFooter className="p-2 pt-4 border-t bg-muted/5 flex-row justify-end items-center gap-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => handleOpenChange()}
                                        disabled={loading}
                                        className="rounded-md font-bold text-xs uppercase tracking-widest px-8"
                                    >
                                        Discard
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="rounded-md   px-8 shadow-xl shadow-primary/20"
                                    >
                                        {loading ? (
                                            <Loader className="w-5 h-5 animate-spin mr-2" />
                                        ) : (
                                            <Save className="w-4 h-4 mr-2" />
                                        )}
                                        {role ? "Update Role" : "Save Role"}
                                    </Button>
                                </SheetFooter>
                            </form>
                        </Form>
                    </div>



                </div>
            </SheetContent>
        </Sheet>
    );
}