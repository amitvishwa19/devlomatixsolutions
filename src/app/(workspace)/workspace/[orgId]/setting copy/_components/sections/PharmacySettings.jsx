import { SettingsSection } from "../SettingsSection";
import { SettingsCard } from "../SettingsCard";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pharmacySettingsSchema } from "../../_types/settings";
import { toast } from "@/hooks/use-toast";
import { Save, Pill, AlertTriangle, Package, RefreshCw } from "lucide-react";

export function PharmacySettings() {
  const form = useForm({
    resolver: zodResolver(pharmacySettingsSchema),
    defaultValues: {
      enablePrescriptions: true,
      requireDoctorApproval: true,
      lowStockThreshold: 50,
      expiryWarningDays: 30,
      enableControlledSubstances: true,
      requireWitness: true,
      enableRefills: true,
      maxRefills: 3,
      enableDrugInteractionCheck: true,
      enableGenericSubstitution: true,
    },
  });

  const onSubmit = (data) => {
    console.log("Pharmacy settings saved:", data);
    toast({
      title: "Settings Saved",
      description: "Pharmacy settings have been updated successfully.",
    });
  };

  return (
    <SettingsSection
      title="Pharmacy"
      description="Configure pharmacy and prescription settings"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Prescription Management */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />
              Prescription Management
            </h4>

            <FormField
              control={form.control}
              name="enablePrescriptions"
              render={({ field }) => (
                <SettingsCard
                  title="Electronic Prescriptions"
                  description="Enable electronic prescription creation and management"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="requireDoctorApproval"
              render={({ field }) => (
                <SettingsCard
                  title="Doctor Approval Required"
                  description="Prescriptions must be approved by a licensed doctor"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableDrugInteractionCheck"
              render={({ field }) => (
                <SettingsCard
                  title="Drug Interaction Check"
                  description="Automatically check for drug interactions before dispensing"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableGenericSubstitution"
              render={({ field }) => (
                <SettingsCard
                  title="Generic Substitution"
                  description="Allow pharmacists to suggest generic alternatives"
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
                  description="Allow patients to request prescription refills"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="maxRefills"
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <FormLabel>Maximum Refills Per Prescription</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      className="bg-surface-1 border-border w-32"
                      min={0}
                      max={12}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">Set to 0 to require new prescription each time</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Controlled Substances */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              Controlled Substances
            </h4>

            <FormField
              control={form.control}
              name="enableControlledSubstances"
              render={({ field }) => (
                <SettingsCard
                  title="Controlled Substances Management"
                  description="Enable tracking and management of controlled substances"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="requireWitness"
              render={({ field }) => (
                <SettingsCard
                  title="Witness Required"
                  description="Require a witness when dispensing controlled substances"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Inventory */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Inventory Management
            </h4>

            <FormField
              control={form.control}
              name="lowStockThreshold"
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <FormLabel>Low Stock Alert Threshold</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      className="bg-surface-1 border-border w-32"
                      min={1}
                      max={1000}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">Alert when stock falls below this number</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiryWarningDays"
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <FormLabel>Expiry Warning (days before)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      className="bg-surface-1 border-border w-32"
                      min={7}
                      max={180}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">Alert before medication expires</p>
                  <FormMessage />
                </FormItem>
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
