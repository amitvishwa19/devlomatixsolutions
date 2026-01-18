import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Users, Shield, Clock, Bell } from "lucide-react";
import SectionHeader from "../_components/SectionHeader";
import { useAction } from "@/hooks/use-action";
import { upsertGeneralSetting } from "../_actions";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAppSettings } from "@/app/(workspace)/workspace/_provider/WorkspaceProvider";
import AppEditor from "../../../(misc)/_components/AppEditor";

const staffSchema = z.object({
    // Staff ID Settings
    staffIdPrefix: z.string().optional(),
    idNumberLength: z.string().optional(),
    autoGenerateId: z.boolean().optional(),
    // Role & Permission Settings
    defaultRole: z.string().optional(),
    requireDepartmentAssignment: z.boolean().optional(),
    allowMultipleDepartments: z.boolean().optional(),
    // Schedule Settings
    defaultShiftDuration: z.string().optional(),
    allowOvertimeRequests: z.boolean().optional(),
    maxOvertimeHours: z.string().optional(),
    // Notification Settings
    sendWelcomeEmail: z.boolean().optional(),
    notifyOnScheduleChange: z.boolean().optional(),
    enableMobileApp: z.boolean().optional(),
});

const TEMP_USER_ID = "temp-user-123";

export function PrivacyPolicy() {
    const [loading, setLoading] = useState(false)
    const { data: session } = useSession()
    const appSettings = useAppSettings()


    const form = useForm({
        resolver: zodResolver(staffSchema),
        defaultValues: {
            staffIdPrefix: "STF-",
            idNumberLength: "6",
            autoGenerateId: true,
            defaultRole: "nurse",
            requireDepartmentAssignment: true,
            allowMultipleDepartments: false,
            defaultShiftDuration: "8",
            allowOvertimeRequests: true,
            maxOvertimeHours: "20",
            sendWelcomeEmail: true,
            notifyOnScheduleChange: true,
            enableMobileApp: true,
        },
    });

    useEffect(() => {
        if (appSettings?.staff) {
            form.reset({
                // Staff ID Settings
                staffIdPrefix: appSettings.staff.staffIdPrefix || "",
                idNumberLength: appSettings.staff.idNumberLength || "",
                autoGenerateId: appSettings.staff.autoGenerateId || false,

                // Role & Permission Settings
                defaultRole: appSettings.staff.defaultRole || "",
                requireDepartmentAssignment: appSettings.staff.requireDepartmentAssignment || false,
                allowMultipleDepartments: appSettings.staff.allowMultipleDepartments || false,

                // Schedule Settings
                defaultShiftDuration: appSettings.staff.defaultShiftDuration || "",
                allowOvertimeRequests: appSettings.staff.allowOvertimeRequests || false,
                maxOvertimeHours: appSettings.staff.maxOvertimeHours || "",

                // Notification Settings
                sendWelcomeEmail: appSettings.staff.sendWelcomeEmail || false,
                notifyOnScheduleChange: appSettings.staff.notifyOnScheduleChange || false,
                enableMobileApp: appSettings.staff.enableMobileApp || false,
            });
        } else {
            form.reset({
                staffIdPrefix: "",
                idNumberLength: "",
                autoGenerateId: false,
                defaultRole: "",
                requireDepartmentAssignment: false,
                allowMultipleDepartments: false,
                defaultShiftDuration: "",
                allowOvertimeRequests: false,
                maxOvertimeHours: "",
                sendWelcomeEmail: false,
                notifyOnScheduleChange: false,
                enableMobileApp: false,
            });
        }
    }, [appSettings, form]);


    const { execute } = useAction(upsertGeneralSetting, {
        onSuccess: (data) => {
            setLoading(false)
            toast.success('Staff settings saved successfully', { id: 'staff' })
        },
        onError: (error) => {
            console.log(error)
            setLoading(false)
            toast.error('Oops somethig went wrong ! try again later', { id: 'staff' })
            setLoading(false);
        }
    })

    const onSubmit = async (data) => {

        try {
            toast.loading("Saving staff settings,please wait...", { id: 'staff' });
            await execute({ userId: session.user.userId, type: 'staff', payload: data })
        } catch (error) {

        }
    };

    return (
        <div className="flex flex-col h-full">
            <SectionHeader
                title="Privacy Policy"
                description="This Privacy Policy explains how we collect, use, and protect your personal information responsibly."
                onSave={form.handleSubmit(onSubmit)}
                isSaving={loading}
            />

            <ScrollArea className="flex-1  h-[60vh] p-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* <FormField
                            control={form.control}
                            name="staffIdPrefix"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Staff ID Prefix</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        /> */}

                        <AppEditor />
                    </form>
                </Form>
            </ScrollArea>
        </div>
    );
}
