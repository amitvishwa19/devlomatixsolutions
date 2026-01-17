import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { UserCircle, FileText, Shield } from "lucide-react";
import SectionHeader from "../_components/SectionHeader";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useAppSettings } from "@/app/(workspace)/workspace/_provider/WorkspaceProvider";
import { useAction } from "@/hooks/use-action";
import { upsertGeneralSetting } from "../_actions";

// Supabase action imports - uncomment to use
// import { upsertPatientsSettingSupabase, fetchPatientsSettings } from "@/components/settings/_actions/patients_supabase";
// import { useAction } from "@/hooks/use-action";

const patientsSchema = z.object({
  // Registration Settings
  patientIdPrefix: z.string().optional(),
  idNumberLength: z.string().optional(),
  autoGenerateId: z.boolean().optional(),
  requirePhotoUpload: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  // Medical Records
  recordRetentionPeriod: z.string().optional(),
  defaultBloodType: z.string().optional(),
  // Privacy Settings
  requireConsentForm: z.boolean().optional(),
  hipaaComplianceMode: z.boolean().optional(),
});

// Temporary user ID - replace with actual auth user ID when auth is implemented
const TEMP_USER_ID = "temp-user-123";

export function PatientsSettings() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState()
  const appSettings = useAppSettings()


  const form = useForm({
    resolver: zodResolver(patientsSchema),
    defaultValues: {
      patientIdPrefix: "PAT-",
      idNumberLength: "6",
      autoGenerateId: true,
      requirePhotoUpload: false,
      smsNotifications: true,
      recordRetentionPeriod: "10",
      defaultBloodType: "unknown",
      requireConsentForm: true,
      hipaaComplianceMode: true,
    },
  });

  useEffect(() => {
    if (appSettings?.patients) {
      form.reset({
        // Registration Settings
        patientIdPrefix: appSettings.patients.patientIdPrefix || "",
        idNumberLength: appSettings.patients.idNumberLength || "",
        autoGenerateId: appSettings.patients.autoGenerateId || false,
        requirePhotoUpload: appSettings.patients.requirePhotoUpload || false,
        smsNotifications: appSettings.patients.smsNotifications || false,

        // Medical Records
        recordRetentionPeriod: appSettings.patients.recordRetentionPeriod || "",
        defaultBloodType: appSettings.patients.defaultBloodType || "",

        // Privacy Settings
        requireConsentForm: appSettings.patients.requireConsentForm || false,
        hipaaComplianceMode: appSettings.patients.hipaaComplianceMode || false,
      });
    } else {
      form.reset({
        patientIdPrefix: "",
        idNumberLength: "",
        autoGenerateId: false,
        requirePhotoUpload: false,
        smsNotifications: false,
        recordRetentionPeriod: "",
        defaultBloodType: "",
        requireConsentForm: false,
        hipaaComplianceMode: false,
      });
    }
  }, [appSettings, form]);


  const { execute } = useAction(upsertGeneralSetting, {
    onSuccess: (data) => {
      setLoading(false)
      toast.success('Patient settings saved successfully', { id: 'patient' })
    },
    onError: (error) => {
      console.log(error)
      setLoading(false)
      toast.error('Oops somethig went wrong ! try again later', { id: 'patient' })
      setLoading(false);
    }
  })


  const onSubmit = async (data) => {

    try {
      setLoading(true)
      console.log("Patient settings:", data);
      const toastId = toast.loading("Saving patient settings...", { id: 'patient' });
      await execute({ userId: session.user.userId, type: 'patients', payload: data })


    } catch (error) {
      toast.error("Failed to save settings", { id: 'patient' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Patients"
        description="Configure patient registration and management settings"
        onSave={form.handleSubmit(onSubmit)}
        isSaving={loading}
      />

      <ScrollArea className="flex-1  h-[60vh] p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Registration Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <UserCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Registration Settings</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="patientIdPrefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient ID Prefix</FormLabel>
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
                        <FormLabel className="text-base">Auto-generate Patient ID</FormLabel>
                        <FormDescription>Automatically generate unique patient IDs</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requirePhotoUpload"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Photo Upload</FormLabel>
                        <FormDescription>Make patient photo mandatory during registration</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smsNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">SMS Notifications</FormLabel>
                        <FormDescription>Send SMS updates to patients</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Medical Records */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Medical Records</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="recordRetentionPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Record Retention Period</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="5">5 years</SelectItem>
                          <SelectItem value="7">7 years</SelectItem>
                          <SelectItem value="10">10 years</SelectItem>
                          <SelectItem value="forever">Forever</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="defaultBloodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Blood Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unknown">Unknown</SelectItem>
                          <SelectItem value="require">Require Entry</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Privacy & Consent</span>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="requireConsentForm"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Consent Form</FormLabel>
                        <FormDescription>Patients must sign consent before treatment</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hipaaComplianceMode"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">HIPAA Compliance Mode</FormLabel>
                        <FormDescription>Enable strict privacy controls</FormDescription>
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
