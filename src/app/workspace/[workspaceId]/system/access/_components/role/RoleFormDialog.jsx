import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, } from "@/components/ui/sheet";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Loader, Save, ShieldUser, Check } from "lucide-react";
import { toast } from "sonner";

import { useAccess } from "../../_provider/accessProvider";
import { upsertRole } from "../../_action/upsert-role";
import { useSession } from "next-auth/react";
import { useAction } from "@/hooks/use-action";
import { GeneralRoleForm } from "./_components/GeneralRoleForm";

/* ------------------ Schema ------------------ */

const roleSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(2).max(50),
    description: z.string().min(10).max(200),
    color: z.string(),
    permissions: z.array(z.any()), // FULL permission objects
});


/* ================== COMPONENT ================== */

export function RoleFormDialog({ isOpen, mode, onClose, role, onSubmit, }) {
    const { permissions } = useAccess();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);


    const form = useForm({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            id: "",
            title: "",
            description: "",
            color: "#0d9488",
            permissions: [],
        },
    });

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
            });
        }
    }, [role, permissions]);



    const { execute } = useAction(upsertRole, {
        onSuccess: (data) => {
            console.log('Role from server action', data.role)
            toast.success("Role saved", { id: "role-data" });
            onSubmit?.(data?.role);
            handleOpenChange()
        },
        onError: () => {
            toast.error("Failed to save role", { id: "role-data" });
            setLoading(false);
        },
    });


    const handleSubmit = async (values) => {
        console.log('values', values)
        setLoading(true);
        toast.loading(`${role ? "Updating" : "Creating"} Role, please wait...`, { id: "role-data" });
        await execute({ userId: session?.user?.userId, formData: values });

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
                                onSubmit={form.handleSubmit(handleSubmit)}
                                className="flex flex-col flex-1 overflow-hidden"
                            >
                                <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
                                    <TabsList className="mx-6 mt-4 justify-start w-fit">
                                        <TabsTrigger value="general">General</TabsTrigger>
                                        <TabsTrigger value="navigations">Navigations</TabsTrigger>
                                    </TabsList>

                                    <TabsContent id='general-content' value="general" className="flex-1 overflow-hidden m-0 border-0">
                                        <GeneralRoleForm form={form} />
                                    </TabsContent>

                                    <TabsContent value="navigations" className="flex-1 overflow-hidden m-0 border-0">
                                        <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground space-y-4">
                                            <div className="p-4 rounded-full bg-muted/20 border border-border/50">
                                                <Check className="w-8 h-8 opacity-20" />
                                            </div>
                                            <p className="text-xs font-medium uppercase tracking-widest opacity-50">Navigation Access coming soon</p>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <SheetFooter className="p-4 border-t bg-muted/5 flex-row justify-end items-center gap-4">
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