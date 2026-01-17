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

import { Save, Package, AlertTriangle, BarChart3, Truck, QrCode } from "lucide-react";

const inventorySettingsSchema = z.object({
  lowStockThreshold: z.number().int().min(1).max(1000),
  criticalStockThreshold: z.number().int().min(1).max(500),
  autoReorderEnabled: z.boolean(),
  reorderPoint: z.number().int().min(1).max(500),
  reorderQuantity: z.number().int().min(1).max(10000),
  enableExpiryTracking: z.boolean(),
  expiryWarningDays: z.number().int().min(7).max(365),
  enableBatchTracking: z.boolean(),
  enableSerialTracking: z.boolean(),
  enableBarcodeScanning: z.boolean(),
  barcodeFormat: z.string(),
  enableQRCodes: z.boolean(),
  enableLocationTracking: z.boolean(),
  defaultWarehouse: z.string(),
  enableMultiWarehouse: z.boolean(),
  enableTransferBetweenLocations: z.boolean(),
  requireTransferApproval: z.boolean(),
  enableCycleCount: z.boolean(),
  cycleCountFrequency: z.string(),
  enableABCAnalysis: z.boolean(),
  enableFIFO: z.boolean(),
  enableLIFO: z.boolean(),
  valuationMethod: z.string(),
  enableMinMaxLevels: z.boolean(),
  enableSafetyStock: z.boolean(),
  enableLeadTimeTracking: z.boolean(),
  defaultLeadTimeDays: z.number().int().min(1).max(90),
  enableSupplierManagement: z.boolean(),
  enablePurchaseOrders: z.boolean(),
  requirePOApproval: z.boolean(),
  poApprovalThreshold: z.number().min(0).max(100000),
  enableGoodsReceipt: z.boolean(),
  enableQualityCheck: z.boolean(),
  enableReturnManagement: z.boolean(),
});

export function InventorySettings() {
  const form = useForm({
    resolver: zodResolver(inventorySettingsSchema),
    defaultValues: {
      lowStockThreshold: 50,
      criticalStockThreshold: 10,
      autoReorderEnabled: true,
      reorderPoint: 30,
      reorderQuantity: 100,
      enableExpiryTracking: true,
      expiryWarningDays: 30,
      enableBatchTracking: true,
      enableSerialTracking: false,
      enableBarcodeScanning: true,
      barcodeFormat: "code128",
      enableQRCodes: true,
      enableLocationTracking: true,
      defaultWarehouse: "main",
      enableMultiWarehouse: false,
      enableTransferBetweenLocations: true,
      requireTransferApproval: true,
      enableCycleCount: true,
      cycleCountFrequency: "monthly",
      enableABCAnalysis: true,
      enableFIFO: true,
      enableLIFO: false,
      valuationMethod: "average",
      enableMinMaxLevels: true,
      enableSafetyStock: true,
      enableLeadTimeTracking: true,
      defaultLeadTimeDays: 7,
      enableSupplierManagement: true,
      enablePurchaseOrders: true,
      requirePOApproval: true,
      poApprovalThreshold: 1000,
      enableGoodsReceipt: true,
      enableQualityCheck: true,
      enableReturnManagement: true,
    },
  });

  const onSubmit = (data) => {
    console.log("Inventory settings saved:", data);
    toast({
      title: "Settings Saved",
      description: "Inventory settings have been updated successfully.",
    });
  };

  return (
    <SettingsSection
      title="Inventory"
      description="Configure inventory management and stock control preferences"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Stock Alerts */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              Stock Alerts
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lowStockThreshold"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Low Stock Threshold</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-surface-1 border-border"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">Alert when stock falls below</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="criticalStockThreshold"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Critical Stock Threshold</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-surface-1 border-border"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">Urgent alert threshold</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="enableExpiryTracking"
              render={({ field }) => (
                <SettingsCard
                  title="Expiry Tracking"
                  description="Track expiration dates for perishable items"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="expiryWarningDays"
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <FormLabel>Expiry Warning Days</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      className="bg-surface-1 border-border w-32"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">Days before expiry to send alert</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Auto Reorder */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              Auto Reorder
            </h4>

            <FormField
              control={form.control}
              name="autoReorderEnabled"
              render={({ field }) => (
                <SettingsCard
                  title="Automatic Reordering"
                  description="Automatically create purchase orders when stock is low"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reorderPoint"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Reorder Point</FormLabel>
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
                name="reorderQuantity"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Reorder Quantity</FormLabel>
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
              name="enableLeadTimeTracking"
              render={({ field }) => (
                <SettingsCard
                  title="Lead Time Tracking"
                  description="Track supplier delivery lead times"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Tracking & Identification */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <QrCode className="h-4 w-4 text-primary" />
              Tracking & Identification
            </h4>

            <FormField
              control={form.control}
              name="enableBatchTracking"
              render={({ field }) => (
                <SettingsCard
                  title="Batch Tracking"
                  description="Track items by batch/lot number"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableSerialTracking"
              render={({ field }) => (
                <SettingsCard
                  title="Serial Number Tracking"
                  description="Track individual items by serial number"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableBarcodeScanning"
              render={({ field }) => (
                <SettingsCard
                  title="Barcode Scanning"
                  description="Enable barcode scanning for inventory operations"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableQRCodes"
              render={({ field }) => (
                <SettingsCard
                  title="QR Codes"
                  description="Generate and scan QR codes for items"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Warehouse & Location */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Warehouse & Location
            </h4>

            <FormField
              control={form.control}
              name="enableLocationTracking"
              render={({ field }) => (
                <SettingsCard
                  title="Location Tracking"
                  description="Track item storage locations within warehouse"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableMultiWarehouse"
              render={({ field }) => (
                <SettingsCard
                  title="Multi-Warehouse"
                  description="Manage inventory across multiple warehouses"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableTransferBetweenLocations"
              render={({ field }) => (
                <SettingsCard
                  title="Inter-Location Transfers"
                  description="Allow transfers between locations/warehouses"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="requireTransferApproval"
              render={({ field }) => (
                <SettingsCard
                  title="Transfer Approval Required"
                  description="Require manager approval for transfers"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Valuation & Analysis */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Valuation & Analysis
            </h4>

            <FormField
              control={form.control}
              name="valuationMethod"
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <FormLabel>Inventory Valuation Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-surface-1 border-border">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="average">Weighted Average</SelectItem>
                      <SelectItem value="fifo">FIFO (First In, First Out)</SelectItem>
                      <SelectItem value="lifo">LIFO (Last In, First Out)</SelectItem>
                      <SelectItem value="specific">Specific Identification</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableABCAnalysis"
              render={({ field }) => (
                <SettingsCard
                  title="ABC Analysis"
                  description="Categorize inventory by value/importance"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableCycleCount"
              render={({ field }) => (
                <SettingsCard
                  title="Cycle Counting"
                  description="Enable periodic inventory cycle counts"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Purchasing */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              Purchasing
            </h4>

            <FormField
              control={form.control}
              name="enablePurchaseOrders"
              render={({ field }) => (
                <SettingsCard
                  title="Purchase Orders"
                  description="Enable purchase order management"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="requirePOApproval"
              render={({ field }) => (
                <SettingsCard
                  title="PO Approval Required"
                  description="Require approval for purchase orders"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableGoodsReceipt"
              render={({ field }) => (
                <SettingsCard
                  title="Goods Receipt"
                  description="Track receipt of ordered goods"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableQualityCheck"
              render={({ field }) => (
                <SettingsCard
                  title="Quality Check on Receipt"
                  description="Require quality inspection when receiving goods"
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
