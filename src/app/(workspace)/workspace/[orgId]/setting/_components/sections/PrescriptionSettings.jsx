import { SettingsSection } from "../SettingsSection";
import { SettingsCard } from "../SettingsCard";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { Save, FileText, AlertTriangle, RefreshCw, Printer, Pill } from "lucide-react";

const prescriptionSettingsSchema = z.object({
  prescriptionPrefix: z.string().max(10),
  enableElectronicPrescription: z.boolean(),
  requireDigitalSignature: z.boolean(),
  enableControlledSubstances: z.boolean(),
  requireDEANumber: z.boolean(),
  enableDrugInteractionCheck: z.boolean(),
  interactionSeverityLevel: z.string(),
  enableAllergyCheck: z.boolean(),
  enableDuplicateTherapyCheck: z.boolean(),
  enableDoseRangeCheck: z.boolean(),
  enableRenalDoseAdjustment: z.boolean(),
  enablePediatricDosing: z.boolean(),
  enableGeriatricWarnings: z.boolean(),
  enablePregnancyWarnings: z.boolean(),
  enableGenericSubstitution: z.boolean(),
  requireSubstitutionConsent: z.boolean(),
  defaultDispenseQuantity: z.number().int().min(1).max(365),
  enableRefills: z.boolean(),
  maxRefills: z.number().int().min(0).max(12),
  refillReminderDays: z.number().int().min(1).max(30),
  enablePriorAuthorization: z.boolean(),
  enableFormularyCheck: z.boolean(),
  enableCoverageCheck: z.boolean(),
  enableCopayEstimate: z.boolean(),
  enablePatientEducation: z.boolean(),
  printInstructions: z.boolean(),
  defaultLanguage: z.string(),
  enableMedicationGuides: z.boolean(),
  enableBlackBoxWarnings: z.boolean(),
  enablePrescriptionHistory: z.boolean(),
  historyRetentionYears: z.number().int().min(1).max(25),
  enablePDMP: z.boolean(),
  requirePDMPCheck: z.boolean(),
  enableMedicationReconciliation: z.boolean(),
  enableAdherenceTracking: z.boolean(),
  enableRefillSync: z.boolean(),
});

export function PrescriptionSettings() {
  const form = useForm({
    resolver: zodResolver(prescriptionSettingsSchema),
    defaultValues: {
      prescriptionPrefix: "RX",
      enableElectronicPrescription: true,
      requireDigitalSignature: true,
      enableControlledSubstances: true,
      requireDEANumber: true,
      enableDrugInteractionCheck: true,
      interactionSeverityLevel: "moderate",
      enableAllergyCheck: true,
      enableDuplicateTherapyCheck: true,
      enableDoseRangeCheck: true,
      enableRenalDoseAdjustment: true,
      enablePediatricDosing: true,
      enableGeriatricWarnings: true,
      enablePregnancyWarnings: true,
      enableGenericSubstitution: true,
      requireSubstitutionConsent: false,
      defaultDispenseQuantity: 30,
      enableRefills: true,
      maxRefills: 3,
      refillReminderDays: 7,
      enablePriorAuthorization: true,
      enableFormularyCheck: true,
      enableCoverageCheck: true,
      enableCopayEstimate: true,
      enablePatientEducation: true,
      printInstructions: true,
      defaultLanguage: "en",
      enableMedicationGuides: true,
      enableBlackBoxWarnings: true,
      enablePrescriptionHistory: true,
      historyRetentionYears: 10,
      enablePDMP: true,
      requirePDMPCheck: true,
      enableMedicationReconciliation: true,
      enableAdherenceTracking: true,
      enableRefillSync: false,
    },
  });

  const onSubmit = (data) => {
    console.log("Prescription settings saved:", data);
    toast({
      title: "Settings Saved",
      description: "Prescription settings have been updated successfully.",
    });
  };

  return (
    <SettingsSection
      title="Prescription"
      description="Configure prescription and medication management settings"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Electronic Prescribing */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Electronic Prescribing
            </h4>

            <FormField
              control={form.control}
              name="prescriptionPrefix"
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <FormLabel>Prescription Prefix</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-surface-1 border-border w-32" placeholder="RX" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableElectronicPrescription"
              render={({ field }) => (
                <SettingsCard
                  title="Electronic Prescriptions (e-Rx)"
                  description="Enable electronic prescription transmission"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="requireDigitalSignature"
              render={({ field }) => (
                <SettingsCard
                  title="Digital Signature Required"
                  description="Require digital signature on prescriptions"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableControlledSubstances"
              render={({ field }) => (
                <SettingsCard
                  title="Controlled Substances (EPCS)"
                  description="Enable electronic prescribing for controlled substances"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="requireDEANumber"
              render={({ field }) => (
                <SettingsCard
                  title="DEA Number Required"
                  description="Require DEA number for controlled substances"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Safety Checks */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              Safety Checks
            </h4>

            <FormField
              control={form.control}
              name="enableDrugInteractionCheck"
              render={({ field }) => (
                <SettingsCard
                  title="Drug Interaction Check"
                  description="Check for drug-drug interactions"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="interactionSeverityLevel"
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <FormLabel>Interaction Alert Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-surface-1 border-border">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="severe">Severe Only</SelectItem>
                      <SelectItem value="moderate">Moderate & Above</SelectItem>
                      <SelectItem value="mild">All Interactions</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableAllergyCheck"
              render={({ field }) => (
                <SettingsCard
                  title="Allergy Check"
                  description="Check for drug allergies"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableDuplicateTherapyCheck"
              render={({ field }) => (
                <SettingsCard
                  title="Duplicate Therapy Check"
                  description="Warn about duplicate therapeutic classes"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableDoseRangeCheck"
              render={({ field }) => (
                <SettingsCard
                  title="Dose Range Check"
                  description="Validate dosing is within safe range"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enablePregnancyWarnings"
              render={({ field }) => (
                <SettingsCard
                  title="Pregnancy Warnings"
                  description="Alert for pregnancy category risks"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableBlackBoxWarnings"
              render={({ field }) => (
                <SettingsCard
                  title="Black Box Warnings"
                  description="Display FDA black box warnings"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Refills */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              Refills
            </h4>

            <FormField
              control={form.control}
              name="enableRefills"
              render={({ field }) => (
                <SettingsCard
                  title="Enable Refills"
                  description="Allow prescription refills"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxRefills"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Maximum Refills</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-surface-1 border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="refillReminderDays"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Refill Reminder (days before)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-surface-1 border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="defaultDispenseQuantity"
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <FormLabel>Default Dispense Quantity (days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      className="bg-surface-1 border-border w-32"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Generic Substitution */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />
              Generic Substitution
            </h4>

            <FormField
              control={form.control}
              name="enableGenericSubstitution"
              render={({ field }) => (
                <SettingsCard
                  title="Generic Substitution"
                  description="Allow generic drug substitution"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="requireSubstitutionConsent"
              render={({ field }) => (
                <SettingsCard
                  title="Require Substitution Consent"
                  description="Require patient consent for substitution"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Compliance & Monitoring */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              Compliance & Monitoring
            </h4>

            <FormField
              control={form.control}
              name="enablePDMP"
              render={({ field }) => (
                <SettingsCard
                  title="PDMP Integration"
                  description="Connect to Prescription Drug Monitoring Program"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="requirePDMPCheck"
              render={({ field }) => (
                <SettingsCard
                  title="Require PDMP Check"
                  description="Require PDMP check for controlled substances"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableAdherenceTracking"
              render={({ field }) => (
                <SettingsCard
                  title="Adherence Tracking"
                  description="Track medication adherence"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableMedicationReconciliation"
              render={({ field }) => (
                <SettingsCard
                  title="Medication Reconciliation"
                  description="Enable medication reconciliation workflow"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Patient Education */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Printer className="h-4 w-4 text-primary" />
              Patient Education
            </h4>

            <FormField
              control={form.control}
              name="enablePatientEducation"
              render={({ field }) => (
                <SettingsCard
                  title="Patient Education Materials"
                  description="Provide medication education to patients"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="printInstructions"
              render={({ field }) => (
                <SettingsCard
                  title="Print Instructions"
                  description="Print medication instructions with prescription"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableMedicationGuides"
              render={({ field }) => (
                <SettingsCard
                  title="Medication Guides"
                  description="Provide FDA medication guides"
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
