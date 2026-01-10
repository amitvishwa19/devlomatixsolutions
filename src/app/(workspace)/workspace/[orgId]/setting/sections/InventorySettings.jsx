import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Package, BarChart3, AlertTriangle } from "lucide-react";
import SectionHeader from "../_components/SectionHeader";

// Supabase action imports - uncomment to use
// import { upsertInventorySettingSupabase, fetchInventorySettings } from "@/components/settings/_actions/inventory_supabase";
// import { useAction } from "@/hooks/use-action";

const inventorySchema = z.object({
  // General Settings
  skuPrefix: z.string().optional(),
  barcodeFormat: z.string().optional(),
  autoGenerateSku: z.boolean().optional(),
  trackSerialNumbers: z.boolean().optional(),
  trackBatchNumbers: z.boolean().optional(),
  // Stock Management
  stockValuationMethod: z.string().optional(),
  reorderPointCalculation: z.string().optional(),
  // Alerts & Notifications
  lowStockAlertThreshold: z.coerce.number().optional(),
  expiryAlertDays: z.coerce.number().optional(),
  dailyStockReport: z.boolean().optional(),
  autoReorderSuggestions: z.boolean().optional(),
});

// Temporary user ID - replace with actual auth user ID when auth is implemented
const TEMP_USER_ID = "temp-user-123";

export function InventorySettings() {
  // Supabase action hook - uncomment to use
  // const { execute: saveToSupabase, isLoading } = useAction(upsertInventorySettingSupabase, {
  //   onSuccess: (data) => {
  //     console.log("Saved to Supabase:", data);
  //   },
  //   onError: (error) => {
  //     console.error("Supabase save error:", error);
  //   }
  // });

  const form = useForm({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      skuPrefix: "INV-",
      barcodeFormat: "ean13",
      autoGenerateSku: true,
      trackSerialNumbers: true,
      trackBatchNumbers: true,
      stockValuationMethod: "fifo",
      reorderPointCalculation: "auto",
      lowStockAlertThreshold: 20,
      expiryAlertDays: 30,
      dailyStockReport: false,
      autoReorderSuggestions: true,
    },
  });

  const onSubmit = async (data) => {
    const toastId = toast.loading("Saving inventory settings...");
    try {
      console.log("Inventory settings:", data);

      // === SUPABASE SAVE - Uncomment to enable ===
      // await saveToSupabase({
      //   userId: TEMP_USER_ID,
      //   formData: {
      //     lowStockThreshold: data.lowStockAlertThreshold,
      //     criticalStockThreshold: 5,
      //     autoReorderEnabled: data.autoReorderSuggestions,
      //     reorderLeadTime: "7",
      //     trackBatchNumbers: data.trackBatchNumbers,
      //     trackExpiryDates: true,
      //     emailLowStockAlerts: data.dailyStockReport,
      //     emailExpiryAlerts: true,
      //   }
      // });
      // ============================================

      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Inventory settings saved successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to save settings", { id: toastId });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Inventory"
        description="Configure inventory management and tracking"
        onSave={form.handleSubmit(onSubmit)}
      />

      <ScrollArea className="flex-1 h-[60vh] p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* General Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Package className="h-4 w-4" />
                <span className="text-sm font-medium">General Settings</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="skuPrefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU Prefix</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="barcodeFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode Format</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ean13">EAN-13</SelectItem>
                          <SelectItem value="upc">UPC-A</SelectItem>
                          <SelectItem value="code128">Code 128</SelectItem>
                          <SelectItem value="qr">QR Code</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="autoGenerateSku"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto-generate SKU</FormLabel>
                        <FormDescription>Automatically create SKU for new items</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trackSerialNumbers"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Track Serial Numbers</FormLabel>
                        <FormDescription>Enable serial number tracking for equipment</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trackBatchNumbers"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Track Batch Numbers</FormLabel>
                        <FormDescription>Enable batch tracking for medications</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Stock Management */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-medium">Stock Management</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="stockValuationMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Valuation Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fifo">FIFO (First In, First Out)</SelectItem>
                          <SelectItem value="lifo">LIFO (Last In, First Out)</SelectItem>
                          <SelectItem value="average">Weighted Average</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reorderPointCalculation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reorder Point Calculation</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="auto">Automatic</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Alerts & Notifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Alerts & Notifications</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="lowStockAlertThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Low Stock Alert Threshold (%)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiryAlertDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Alert Days</FormLabel>
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
                  name="dailyStockReport"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Daily Stock Report</FormLabel>
                        <FormDescription>Send daily inventory summary via email</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="autoReorderSuggestions"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto-reorder Suggestions</FormLabel>
                        <FormDescription>Get purchase order suggestions based on usage</FormDescription>
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
