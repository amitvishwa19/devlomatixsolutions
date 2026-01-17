import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Building2, Globe, Palette, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import SectionHeader from "../_components/SectionHeader";
import { useAction } from "@/hooks/use-action";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import AccessControl from "@/components/global/AccessControl";
import { useAppSettings } from "@/app/(workspace)/workspace/_provider/WorkspaceProvider";
import { upsertGeneralSetting } from "../_actions";

const generalSchema = z.object({
    id: z.string().optional(),
    hospitalName: z.string().min(1, "Hospital name is required"),
    hospitalCode: z.string().min(1, "Hospital code is required"),
    contactEmail: z.string().min(1, "Hospital email isrequired"),
    contactPhone: z.string().min(1, "Contact phone is required"),
    website: z.string().optional(),
    timezone: z.string().min(1, "Timezone is required"),
    language: z.string().min(1, "Language is required"),
    dateFormat: z.string().min(1, "Date format is required"),
    timeFormat: z.string().min(1, "Time format is required"),
});


export function GeneralSettings() {
    const { theme, setTheme } = useTheme();
    const { data: session } = useSession()
    const [loading, setLoading] = useState()
    const appSettings = useAppSettings()

    const form = useForm({
        resolver: zodResolver(generalSchema),
        defaultValues: {
            id: "",
            hospitalName: "",
            hospitalCode: "",
            contactEmail: "",
            contactPhone: "",
            website: "",
            timezone: "",
            language: "en",
            dateFormat: "MM/DD/YYYY",
            timeFormat: "12h",
        },
    });


    useEffect(() => {

        if (appSettings) {

            form.reset({
                id: appSettings?.general?.id || '',
                hospitalName: appSettings?.general?.hospitalName || "",
                hospitalCode: appSettings?.general?.hospitalCode || "",
                contactEmail: appSettings?.general?.contactEmail || "",
                contactPhone: appSettings?.general?.contactPhone || "",
                website: appSettings?.general?.website || "",
                timezone: appSettings?.general?.timezone || "",
                language: appSettings?.general?.language || "en",
                dateFormat: appSettings?.general?.dateFormat || "MM/DD/YYYY",
                timeFormat: appSettings?.general?.timeFormat || "12h",
            });
        } else {
            form.reset({
                id: "",
                hospitalName: "",
                hospitalCode: "",
                contactEmail: "",
                contactPhone: "",
                website: "",
                timezone: "",
                language: "en",
                dateFormat: "MM/DD/YYYY",
                timeFormat: "12h",
            });

        }

    }, [appSettings, form])


    const { execute } = useAction(upsertGeneralSetting, {
        onSuccess: (data) => {
            setLoading(false)
            toast.success('General settings saved successfully', { id: 'general' })
        },
        onError: (error) => {
            console.log(error)
            setLoading(false)
            toast.error('Oops somethig went wrong ! try again later', { id: 'general' })
            setLoading(false);
        }
    })

    const onSubmit = async (data) => {

        try {
            setLoading(true)
            const toastId = toast.loading("Saving general settings...", { id: 'general' });
            await execute({ userId: session.user.userId, type: 'general', payload: data })


        } catch (error) {
            toast.error("Failed to save settings", { id: 'general' });
        }
    };

    return (
        <div className="flex flex-col h-full">

            <SectionHeader
                title="General"
                description="Application general settings"
                isSaving={loading}
                onSave={form.handleSubmit(onSubmit)}
                permissions={['general_setings.edit', 'general_setings.view', 'general_setings.manage']}
            />

            <ScrollArea className="flex-1  h-[60vh] p-4">
                <div className="space-y-8">
                    {/* Theme Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <Palette className="h-4 w-4" />
                            <span className="text-sm font-medium">Appearance</span>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-muted-foreground">Theme</Label>
                            <RadioGroup
                                value={theme}
                                onValueChange={setTheme}
                                className="flex gap-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="light" id="light" />
                                    <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                                        <Sun className="h-4 w-4" />
                                        Light
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="dark" id="dark" />
                                    <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                                        <Moon className="h-4 w-4" />
                                        Dark
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="system" id="system" />
                                    <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                                        <Monitor className="h-4 w-4" />
                                        System
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                    <AccessControl permissions={["general_setings.view"]} >
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mx-1">
                                {/* Hospital Information */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Building2 className="h-4 w-4" />
                                        <span className="text-sm font-medium">Hospital Information</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="hospitalName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Hospital Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="hospitalCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Hospital Code</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="contactEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Contact Email</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="contactPhone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Contact Phone</FormLabel>
                                                    <FormControl>
                                                        <Input type="tel" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="website"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Website</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Localization */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Globe className="h-4 w-4" />
                                        <span className="text-sm font-medium">Localization</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="timezone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Timezone</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="America/New_York">Eastern Time (UTC-5)</SelectItem>
                                                            <SelectItem value="America/Chicago">Central Time (UTC-6)</SelectItem>
                                                            <SelectItem value="America/Denver">Mountain Time (UTC-7)</SelectItem>
                                                            <SelectItem value="America/Los_Angeles">Pacific Time (UTC-8)</SelectItem>
                                                            <SelectItem value="UTC">UTC</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="language"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Language</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="en">English</SelectItem>
                                                            <SelectItem value="es">Español</SelectItem>
                                                            <SelectItem value="fr">Français</SelectItem>
                                                            <SelectItem value="de">Deutsch</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="dateFormat"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Date Format</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="timeFormat"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Time Format</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                                                            <SelectItem value="24h">24 Hour</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </AccessControl >
                </div>
            </ScrollArea>
        </div>
    );
}