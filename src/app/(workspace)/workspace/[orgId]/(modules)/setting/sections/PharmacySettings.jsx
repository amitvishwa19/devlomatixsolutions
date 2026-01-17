import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Pill, AlertTriangle, Package } from "lucide-react";
import SectionHeader from "../_components/SectionHeader";

// Supabase action imports - uncomment to use
// import { upsertPharmacySettingSupabase, fetchPharmacySettings } from "@/components/settings/_actions/pharmacy_supabase";
// import { useAction } from "@/hooks/use-action";

const pharmacySchema = z.object({
  // General Settings
  pharmacyName: z.string().optional(),
  licenseNumber: z.string().optional(),
  requirePrescriptionVerification: z.boolean().optional(),
  trackControlledSubstances: z.boolean().optional(),
  // Stock Alerts
  lowStockThreshold: z.coerce.number().optional(),
  criticalStockThreshold: z.coerce.number().optional(),
  emailLowStockAlerts: z.boolean().optional(),
  expiryDateAlerts: z.boolean().optional(),
  // Dispensing Settings
  defaultDispensingUnit: z.string().optional(),
  printFormat: z.string().optional(),
});

// Temporary user ID - replace with actual auth user ID when auth is implemented
const TEMP_USER_ID = "temp-user-123";

export function PharmacySettings() {
  // Supabase action hook - uncomment to use
  // const { execute: saveToSupabase, isLoading } = useAction(upsertPharmacySettingSupabase, {
  //   onSuccess: (data) => {
  //     console.log("Saved to Supabase:", data);
  //   },
  //   onError: (error) => {
  //     console.error("Supabase save error:", error);
  //   }
  // });

  const form = useForm({
    resolver: zodResolver(pharmacySchema),
    defaultValues: {
      pharmacyName: "City General Pharmacy",
      licenseNumber: "PH-12345-2024",
      requirePrescriptionVerification: true,
      trackControlledSubstances: true,
      lowStockThreshold: 50,
      criticalStockThreshold: 10,
      emailLowStockAlerts: true,
      expiryDateAlerts: true,
      defaultDispensingUnit: "tablets",
      printFormat: "label",
    },
  });

  const onSubmit = async (data) => {
    const toastId = toast.loading("Saving pharmacy settings...");
    try {
      console.log("Pharmacy settings:", data);

      // === SUPABASE SAVE - Uncomment to enable ===
      // await saveToSupabase({
      //   userId: TEMP_USER_ID,
      //   formData: {
      //     pharmacyName: data.pharmacyName,
      //     licenseNumber: data.licenseNumber,
      //     requirePrescriptionVerification: data.requirePrescriptionVerification,
      //     trackControlledSubstances: data.trackControlledSubstances,
      //     lowStockThreshold: data.lowStockThreshold,
      //     criticalStockThreshold: data.criticalStockThreshold,
      //     emailLowStockAlerts: data.emailLowStockAlerts,
      //     expiryDateAlerts: data.expiryDateAlerts,
      //     defaultDispensingUnit: data.defaultDispensingUnit,
      //     printFormat: data.printFormat,
      //   }
      // });
      // ============================================

      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Pharmacy settings saved successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to save settings", { id: toastId });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Pharmacy"
        description="Configure pharmacy and medication settings"
        onSave={form.handleSubmit(onSubmit)}
      />

      <ScrollArea className="flex-1  h-[60vh] p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* General Pharmacy Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Pill className="h-4 w-4" />
                <span className="text-sm font-medium">General Settings</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="pharmacyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pharmacy Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="requirePrescriptionVerification"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Prescription Verification</FormLabel>
                        <FormDescription>Pharmacist must verify prescriptions before dispensing</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trackControlledSubstances"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Track Controlled Substances</FormLabel>
                        <FormDescription>Enable special tracking for controlled medications</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Stock Alerts */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Stock Alerts</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="lowStockThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Low Stock Threshold</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="criticalStockThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Critical Stock Threshold</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="emailLowStockAlerts"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Email Low Stock Alerts</FormLabel>
                        <FormDescription>Send email when stock falls below threshold</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiryDateAlerts"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Expiry Date Alerts</FormLabel>
                        <FormDescription>Alert when medications are near expiry</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Dispensing Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Package className="h-4 w-4" />
                <span className="text-sm font-medium">Dispensing Settings</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="defaultDispensingUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Dispensing Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="tablets">Tablets</SelectItem>
                          <SelectItem value="ml">Milliliters</SelectItem>
                          <SelectItem value="units">Units</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="printFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Print Format</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="label">Label Only</SelectItem>
                          <SelectItem value="receipt">Receipt</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
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
