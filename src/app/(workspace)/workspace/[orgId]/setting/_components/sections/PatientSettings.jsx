import { SettingsSection } from "../SettingsSection";
import { SettingsCard } from "../SettingsCard";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSettingsSchema } from "../../_types/settings";
import { toast } from "@/hooks/use-toast";
import { Save, User, Shield, FileText } from "lucide-react";

export function PatientSettings() {
  const form = useForm({
    resolver: zodResolver(patientSettingsSchema),
    defaultValues: {
      requireIdVerification: true,
      autoAssignPatientId: true,
      patientIdPrefix: "PAT",
      retentionYears: 10,
      enablePatientPortal: true,
      allowOnlinePayments: true,
      requireEmergencyContact: true,
      enableMedicalHistory: true,
      hipaaCompliance: true,
      consentRequired: true,
      photoRequired: false,
      allowDataExport: true,
    },
  });

  const onSubmit = (data) => {
    console.log("Patient settings saved:", data);
    toast({
      title: "Settings Saved",
      description: "Patient settings have been updated successfully.",
    });
  };

  return (
    <SettingsSection
      title="Patients"
      description="Configure patient management and privacy settings"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient Registration */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Patient Registration
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patientIdPrefix"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Patient ID Prefix</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-surface-1 border-border" placeholder="PAT" />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">e.g., PAT-00001</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="retentionYears"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Record Retention (years)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-surface-1 border-border"
                        min={5}
                        max={100}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="autoAssignPatientId"
              render={({ field }) => (
                <SettingsCard
                  title="Auto-assign Patient ID"
                  description="Automatically generate patient IDs on registration"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="requireIdVerification"
              render={({ field }) => (
                <SettingsCard
                  title="Require ID Verification"
                  description="Patients must provide valid identification"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="photoRequired"
              render={({ field }) => (
                <SettingsCard
                  title="Patient Photo Required"
                  description="Require photo for patient identification"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="requireEmergencyContact"
              render={({ field }) => (
                <SettingsCard
                  title="Require Emergency Contact"
                  description="Patients must provide emergency contact information"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Patient Portal */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Patient Portal
            </h4>

            <FormField
              control={form.control}
              name="enablePatientPortal"
              render={({ field }) => (
                <SettingsCard
                  title="Enable Patient Portal"
                  description="Allow patients to access their records online"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="allowOnlinePayments"
              render={({ field }) => (
                <SettingsCard
                  title="Online Payments"
                  description="Allow patients to pay bills through the portal"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableMedicalHistory"
              render={({ field }) => (
                <SettingsCard
                  title="View Medical History"
                  description="Allow patients to view their complete medical history"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="allowDataExport"
              render={({ field }) => (
                <SettingsCard
                  title="Data Export"
                  description="Allow patients to download their medical records"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Privacy & Compliance */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Privacy & Compliance
            </h4>

            <FormField
              control={form.control}
              name="hipaaCompliance"
              render={({ field }) => (
                <SettingsCard
                  title="HIPAA Compliance Mode"
                  description="Enforce strict HIPAA compliance protocols"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="consentRequired"
              render={({ field }) => (
                <SettingsCard
                  title="Consent Required"
                  description="Require patient consent before sharing information"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </SettingsSection>
  );
}
