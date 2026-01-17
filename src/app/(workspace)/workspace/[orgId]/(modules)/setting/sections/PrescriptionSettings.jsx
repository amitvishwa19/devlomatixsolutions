import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { FileText, Shield, Printer } from "lucide-react";
import SectionHeader from "../_components/SectionHeader";

// Supabase action imports - uncomment to use
// import { upsertPrescriptionSettingSupabase, fetchPrescriptionSettings } from "@/components/settings/_actions/prescription_supabase";
// import { useAction } from "@/hooks/use-action";

const prescriptionSchema = z.object({
  // Template Settings
  prescriptionPrefix: z.string().optional(),
  defaultValidityPeriod: z.string().optional(),
  defaultInstructions: z.string().optional(),
  footerText: z.string().optional(),
  // Validation Rules
  checkDrugInteractions: z.boolean().optional(),
  allergyWarnings: z.boolean().optional(),
  dosageValidation: z.boolean().optional(),
  requireDigitalSignature: z.boolean().optional(),
  // Print Settings
  paperSize: z.string().optional(),
  copies: z.string().optional(),
});

// Temporary user ID - replace with actual auth user ID when auth is implemented
const TEMP_USER_ID = "temp-user-123";

export function PrescriptionSettings() {
  // Supabase action hook - uncomment to use
  // const { execute: saveToSupabase, isLoading } = useAction(upsertPrescriptionSettingSupabase, {
  //   onSuccess: (data) => {
  //     console.log("Saved to Supabase:", data);
  //   },
  //   onError: (error) => {
  //     console.error("Supabase save error:", error);
  //   }
  // });

  const form = useForm({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      prescriptionPrefix: "RX-",
      defaultValidityPeriod: "30",
      defaultInstructions: "Take as directed by physician. Keep out of reach of children.",
      footerText: "This prescription is valid for the period mentioned above. For refills, please contact your physician.",
      checkDrugInteractions: true,
      allergyWarnings: true,
      dosageValidation: true,
      requireDigitalSignature: true,
      paperSize: "a5",
      copies: "2",
    },
  });

  const onSubmit = async (data) => {
    const toastId = toast.loading("Saving prescription settings...");
    try {
      console.log("Prescription settings:", data);

      // === SUPABASE SAVE - Uncomment to enable ===
      // await saveToSupabase({
      //   userId: TEMP_USER_ID,
      //   formData: {
      //     prescriptionPrefix: data.prescriptionPrefix,
      //     defaultValidityPeriod: data.defaultValidityPeriod,
      //     defaultInstructions: data.defaultInstructions,
      //     footerText: data.footerText,
      //     checkDrugInteractions: data.checkDrugInteractions,
      //     allergyWarnings: data.allergyWarnings,
      //     dosageValidation: data.dosageValidation,
      //     requireDigitalSignature: data.requireDigitalSignature,
      //     paperSize: data.paperSize,
      //     copies: data.copies,
      //   }
      // });
      // ============================================

      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Prescription settings saved successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to save settings", { id: toastId });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Prescription"
        description="Configure prescription templates and rules"
        onSave={form.handleSubmit(onSubmit)}
      />

      <ScrollArea className="flex-1  h-[60vh] p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Template Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Template Settings</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="prescriptionPrefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prescription Prefix</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="defaultValidityPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Validity Period</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="defaultInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Instructions</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[80px]" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="footerText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Footer Text</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[80px]" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Validation Rules */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Validation Rules</span>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="checkDrugInteractions"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Check Drug Interactions</FormLabel>
                        <FormDescription>Warn when prescribing conflicting medications</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="allergyWarnings"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Allergy Warnings</FormLabel>
                        <FormDescription>Check patient allergies before prescribing</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dosageValidation"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Dosage Validation</FormLabel>
                        <FormDescription>Validate dosage against recommended limits</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requireDigitalSignature"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Digital Signature</FormLabel>
                        <FormDescription>Doctor must digitally sign prescriptions</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Print Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Printer className="h-4 w-4" />
                <span className="text-sm font-medium">Print Settings</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="paperSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paper Size</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="a4">A4</SelectItem>
                          <SelectItem value="a5">A5</SelectItem>
                          <SelectItem value="letter">Letter</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="copies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Copies</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 Copy</SelectItem>
                          <SelectItem value="2">2 Copies</SelectItem>
                          <SelectItem value="3">3 Copies</SelectItem>
                        </SelectContent>
                      </Select>
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
