import { SettingsSection } from "../SettingsSection";
import { SettingsCard } from "../SettingsCard";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { Save, Stethoscope, DollarSign, Clock, Tag, Layers } from "lucide-react";

const servicesSettingsSchema = z.object({
  enableServiceCatalog: z.boolean(),
  requireServiceCode: z.boolean(),
  serviceCodePrefix: z.string().max(10),
  enableServiceCategories: z.boolean(),
  enableServicePackages: z.boolean(),
  enablePriceList: z.boolean(),
  defaultPriceList: z.string(),
  enableMultiplePriceLists: z.boolean(),
  enableDynamicPricing: z.boolean(),
  enableDiscounts: z.boolean(),
  maxDiscountPercentage: z.number().min(0).max(100),
  requireDiscountApproval: z.boolean(),
  discountApprovalThreshold: z.number().min(0).max(100),
  enableServiceDuration: z.boolean(),
  defaultServiceDuration: z.number().int().min(5).max(480),
  enablePreparationTime: z.boolean(),
  enableFollowUpServices: z.boolean(),
  enableBundledServices: z.boolean(),
  enableRecurringServices: z.boolean(),
  enableServiceNotes: z.boolean(),
  requireServiceNotes: z.boolean(),
  enableServiceConsent: z.boolean(),
  enableServiceRatings: z.boolean(),
  enableWaitingList: z.boolean(),
  enablePriorityQueue: z.boolean(),
  enableResourceAllocation: z.boolean(),
  enableEquipmentTracking: z.boolean(),
  enableRoomAllocation: z.boolean(),
  enableStaffAssignment: z.boolean(),
  autoAssignStaff: z.boolean(),
  enableServiceReports: z.boolean(),
  enableCostTracking: z.boolean(),
  enableProfitAnalysis: z.boolean(),
});

export function ServicesSettings() {
  const form = useForm({
    resolver: zodResolver(servicesSettingsSchema),
    defaultValues: {
      enableServiceCatalog: true,
      requireServiceCode: true,
      serviceCodePrefix: "SVC",
      enableServiceCategories: true,
      enableServicePackages: true,
      enablePriceList: true,
      defaultPriceList: "standard",
      enableMultiplePriceLists: true,
      enableDynamicPricing: false,
      enableDiscounts: true,
      maxDiscountPercentage: 25,
      requireDiscountApproval: true,
      discountApprovalThreshold: 15,
      enableServiceDuration: true,
      defaultServiceDuration: 30,
      enablePreparationTime: true,
      enableFollowUpServices: true,
      enableBundledServices: true,
      enableRecurringServices: true,
      enableServiceNotes: true,
      requireServiceNotes: false,
      enableServiceConsent: true,
      enableServiceRatings: true,
      enableWaitingList: true,
      enablePriorityQueue: true,
      enableResourceAllocation: true,
      enableEquipmentTracking: true,
      enableRoomAllocation: true,
      enableStaffAssignment: true,
      autoAssignStaff: false,
      enableServiceReports: true,
      enableCostTracking: true,
      enableProfitAnalysis: true,
    },
  });

  const onSubmit = (data) => {
    console.log("Services settings saved:", data);
    toast({
      title: "Settings Saved",
      description: "Services settings have been updated successfully.",
    });
  };

  return (
    <SettingsSection
      title="Services"
      description="Configure medical services and procedures catalog"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Service Catalog */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              Service Catalog
            </h4>

            <FormField
              control={form.control}
              name="enableServiceCatalog"
              render={({ field }) => (
                <SettingsCard
                  title="Service Catalog"
                  description="Enable centralized service catalog management"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="requireServiceCode"
                render={({ field }) => (
                  <SettingsCard
                    title="Require Service Code"
                    description="Each service must have a unique code"
                  >
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </SettingsCard>
                )}
              />

              <FormField
                control={form.control}
                name="serviceCodePrefix"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Service Code Prefix</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-surface-1 border-border" placeholder="SVC" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="enableServiceCategories"
              render={({ field }) => (
                <SettingsCard
                  title="Service Categories"
                  description="Organize services into categories"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableServicePackages"
              render={({ field }) => (
                <SettingsCard
                  title="Service Packages"
                  description="Create bundled service packages"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Pricing
            </h4>

            <FormField
              control={form.control}
              name="enablePriceList"
              render={({ field }) => (
                <SettingsCard
                  title="Price Lists"
                  description="Enable price list management"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableMultiplePriceLists"
              render={({ field }) => (
                <SettingsCard
                  title="Multiple Price Lists"
                  description="Support different prices for insurance, cash, etc."
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableDynamicPricing"
              render={({ field }) => (
                <SettingsCard
                  title="Dynamic Pricing"
                  description="Adjust prices based on time, demand, etc."
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableDiscounts"
              render={({ field }) => (
                <SettingsCard
                  title="Discounts"
                  description="Allow discounts on services"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxDiscountPercentage"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Max Discount (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        className="bg-surface-1 border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountApprovalThreshold"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Approval Threshold (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        className="bg-surface-1 border-border"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">Discounts above this need approval</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Duration & Scheduling */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Duration & Scheduling
            </h4>

            <FormField
              control={form.control}
              name="enableServiceDuration"
              render={({ field }) => (
                <SettingsCard
                  title="Service Duration"
                  description="Track expected duration for each service"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="defaultServiceDuration"
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <FormLabel>Default Duration (minutes)</FormLabel>
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

            <FormField
              control={form.control}
              name="enablePreparationTime"
              render={({ field }) => (
                <SettingsCard
                  title="Preparation Time"
                  description="Track preparation time before services"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableWaitingList"
              render={({ field }) => (
                <SettingsCard
                  title="Waiting List"
                  description="Enable waiting list for busy services"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enablePriorityQueue"
              render={({ field }) => (
                <SettingsCard
                  title="Priority Queue"
                  description="Allow priority scheduling for urgent cases"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Resource Management */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Resource Management
            </h4>

            <FormField
              control={form.control}
              name="enableResourceAllocation"
              render={({ field }) => (
                <SettingsCard
                  title="Resource Allocation"
                  description="Allocate resources to services"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableRoomAllocation"
              render={({ field }) => (
                <SettingsCard
                  title="Room Allocation"
                  description="Assign rooms/spaces for services"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableEquipmentTracking"
              render={({ field }) => (
                <SettingsCard
                  title="Equipment Tracking"
                  description="Track equipment needed for services"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableStaffAssignment"
              render={({ field }) => (
                <SettingsCard
                  title="Staff Assignment"
                  description="Assign staff to perform services"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="autoAssignStaff"
              render={({ field }) => (
                <SettingsCard
                  title="Auto-Assign Staff"
                  description="Automatically assign available staff"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              Additional Options
            </h4>

            <FormField
              control={form.control}
              name="enableServiceConsent"
              render={({ field }) => (
                <SettingsCard
                  title="Service Consent"
                  description="Require patient consent before services"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableServiceRatings"
              render={({ field }) => (
                <SettingsCard
                  title="Service Ratings"
                  description="Allow patients to rate services"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableCostTracking"
              render={({ field }) => (
                <SettingsCard
                  title="Cost Tracking"
                  description="Track costs associated with services"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableProfitAnalysis"
              render={({ field }) => (
                <SettingsCard
                  title="Profit Analysis"
                  description="Analyze profitability of services"
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
