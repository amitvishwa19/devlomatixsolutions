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

export function TermsConditions() {
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
                title="Staff"
                description="Configure staff registration and management settings"
                onSave={form.handleSubmit(onSubmit)}
            />

            <ScrollArea className="flex-1  h-[60vh] p-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* Staff ID Settings */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                                <Users className="h-4 w-4" />
                                <span className="text-sm font-medium">Staff ID Settings</span>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <FormField
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
                                />
                                <FormField
                                    control={form.control}
                                    name="idNumberLength"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ID Number Length</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="4">4 digits</SelectItem>
                                                    <SelectItem value="5">5 digits</SelectItem>
                                                    <SelectItem value="6">6 digits</SelectItem>
                                                    <SelectItem value="8">8 digits</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="autoGenerateId"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Auto-generate Staff ID</FormLabel>
                                                <FormDescription>Automatically generate unique staff IDs</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Role & Permission Settings */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                                <Shield className="h-4 w-4" />
                                <span className="text-sm font-medium">Role & Permissions</span>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="defaultRole"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Default Role</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="doctor">Doctor</SelectItem>
                                                    <SelectItem value="nurse">Nurse</SelectItem>
                                                    <SelectItem value="receptionist">Receptionist</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="technician">Technician</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="requireDepartmentAssignment"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Require Department Assignment</FormLabel>
                                                <FormDescription>Staff must be assigned to a department</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="allowMultipleDepartments"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Allow Multiple Departments</FormLabel>
                                                <FormDescription>Staff can be assigned to multiple departments</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Schedule Settings */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm font-medium">Schedule Settings</span>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="defaultShiftDuration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Default Shift Duration</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="4">4 hours</SelectItem>
                                                    <SelectItem value="6">6 hours</SelectItem>
                                                    <SelectItem value="8">8 hours</SelectItem>
                                                    <SelectItem value="10">10 hours</SelectItem>
                                                    <SelectItem value="12">12 hours</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="maxOvertimeHours"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Overtime Hours (Weekly)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="10">10 hours</SelectItem>
                                                    <SelectItem value="15">15 hours</SelectItem>
                                                    <SelectItem value="20">20 hours</SelectItem>
                                                    <SelectItem value="30">30 hours</SelectItem>
                                                    <SelectItem value="unlimited">Unlimited</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="allowOvertimeRequests"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Allow Overtime Requests</FormLabel>
                                                <FormDescription>Staff can request overtime shifts</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Notification Settings */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                                <Bell className="h-4 w-4" />
                                <span className="text-sm font-medium">Notifications</span>
                            </div>

                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="sendWelcomeEmail"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Send Welcome Email</FormLabel>
                                                <FormDescription>Send onboarding email to new staff members</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="notifyOnScheduleChange"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Notify on Schedule Change</FormLabel>
                                                <FormDescription>Send notifications when schedule is updated</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="enableMobileApp"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Enable Mobile App Access</FormLabel>
                                                <FormDescription>Allow staff to use mobile app for schedules</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </form>
                </Form>
            </ScrollArea>
        </div>
    );
}
