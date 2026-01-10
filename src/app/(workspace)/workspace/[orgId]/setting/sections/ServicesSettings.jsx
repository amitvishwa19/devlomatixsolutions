import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Stethoscope, DollarSign, Clock, Settings } from "lucide-react";
import SectionHeader from "../_components/SectionHeader";

const servicesSchema = z.object({
  // Service ID Settings
  serviceCodePrefix: z.string().optional(),
  codeNumberLength: z.string().optional(),
  autoGenerateCode: z.boolean().optional(),
  // Pricing Settings
  defaultCurrency: z.string().optional(),
  taxRate: z.string().optional(),
  includeTaxInPrice: z.boolean().optional(),
  allowDiscounts: z.boolean().optional(),
  maxDiscountPercent: z.string().optional(),
  // Duration Settings
  defaultDuration: z.string().optional(),
  bufferTimeBetweenServices: z.string().optional(),
  allowCustomDuration: z.boolean().optional(),
  // General Settings
  requireDepartmentAssignment: z.boolean().optional(),
  trackServiceUsage: z.boolean().optional(),
  showInactiveServices: z.boolean().optional(),
});

const TEMP_USER_ID = "temp-user-123";

export function ServicesSettings() {
  const form = useForm({
    resolver: zodResolver(servicesSchema),
    defaultValues: {
      serviceCodePrefix: "SVC-",
      codeNumberLength: "4",
      autoGenerateCode: true,
      defaultCurrency: "USD",
      taxRate: "10",
      includeTaxInPrice: false,
      allowDiscounts: true,
      maxDiscountPercent: "20",
      defaultDuration: "30",
      bufferTimeBetweenServices: "5",
      allowCustomDuration: true,
      requireDepartmentAssignment: true,
      trackServiceUsage: true,
      showInactiveServices: false,
    },
  });

  const onSubmit = async (data) => {
    const toastId = toast.loading("Saving service settings...");
    try {
      console.log("Service settings:", data);
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Service settings saved successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to save settings", { id: toastId });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Services"
        description="Configure service codes, pricing, and duration settings"
        onSave={form.handleSubmit(onSubmit)}
      />

      <ScrollArea className="flex-1  h-[60vh] p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Service ID Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Stethoscope className="h-4 w-4" />
                <span className="text-sm font-medium">Service Code Settings</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="serviceCodePrefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Code Prefix</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="codeNumberLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code Number Length</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="3">3 digits</SelectItem>
                          <SelectItem value="4">4 digits</SelectItem>
                          <SelectItem value="5">5 digits</SelectItem>
                          <SelectItem value="6">6 digits</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="autoGenerateCode"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto-generate Service Code</FormLabel>
                        <FormDescription>Automatically generate unique service codes</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Pricing Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Pricing Settings</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="defaultCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="CAD">CAD ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate (%)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="5">5%</SelectItem>
                          <SelectItem value="10">10%</SelectItem>
                          <SelectItem value="15">15%</SelectItem>
                          <SelectItem value="18">18%</SelectItem>
                          <SelectItem value="20">20%</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxDiscountPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Discount (%)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="5">5%</SelectItem>
                          <SelectItem value="10">10%</SelectItem>
                          <SelectItem value="15">15%</SelectItem>
                          <SelectItem value="20">20%</SelectItem>
                          <SelectItem value="25">25%</SelectItem>
                          <SelectItem value="50">50%</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="includeTaxInPrice"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Include Tax in Display Price</FormLabel>
                        <FormDescription>Show prices with tax already included</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="allowDiscounts"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Allow Discounts</FormLabel>
                        <FormDescription>Enable discounts on service pricing</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Duration Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Duration Settings</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="defaultDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Duration</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="20">20 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bufferTimeBetweenServices"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buffer Time Between Services</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">No buffer</SelectItem>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="allowCustomDuration"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Allow Custom Duration</FormLabel>
                        <FormDescription>Allow overriding default service duration</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* General Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">General Settings</span>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="requireDepartmentAssignment"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Department Assignment</FormLabel>
                        <FormDescription>Services must be linked to a department</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trackServiceUsage"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Track Service Usage</FormLabel>
                        <FormDescription>Record usage statistics for analytics</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="showInactiveServices"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Show Inactive Services</FormLabel>
                        <FormDescription>Display inactive services in listings</FormDescription>
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
