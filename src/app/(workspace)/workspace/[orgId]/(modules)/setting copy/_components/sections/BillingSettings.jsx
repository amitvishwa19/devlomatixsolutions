import { SettingsSection } from "../SettingsSection";
import { SettingsCard } from "../SettingsCard";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Save, CreditCard, Receipt, DollarSign, FileText, Percent, Clock } from "lucide-react";
import { billingSettingsSchema } from "../../_types/settings";

export function BillingSettings() {
  const form = useForm({
    resolver: zodResolver(billingSettingsSchema),
    defaultValues: {
      currency: "usd",
      taxRate: 8.5,
      invoicePrefix: "INV",
      paymentTermsDays: 30,
      lateFeePercentage: 2.5,
      autoInvoice: true,
      insuranceIntegration: true,
      paymentReminders: true,
      taxCalculation: true,
      allowPartialPayments: true,
      enableDiscounts: true,
      maxDiscountPercentage: 25,
      requirePrepayment: false,
      enableInstallments: true,
      sendReceiptEmail: true,
    },
  });

  const onSubmit = (data) => {
    console.log("Billing settings saved:", data);
    toast({
      title: "Settings Saved",
      description: "Billing settings have been updated successfully.",
    });
  };

  return (
    <SettingsSection
      title="Billing"
      description="Configure billing, invoicing, and payment settings"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Account Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-surface-2 border border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Current Plan</p>
                  <p className="text-xs text-primary">Enterprise</p>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" className="w-full">
                Upgrade Plan
              </Button>
            </div>

            <div className="p-5 rounded-xl bg-surface-2 border border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Payment Method</p>
                  <p className="text-xs text-muted-foreground">•••• 4242</p>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" className="w-full">
                Update Card
              </Button>
            </div>
          </div>

          {/* Invoice Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Invoice Settings
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Default Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-surface-1 border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="usd">USD - US Dollar</SelectItem>
                        <SelectItem value="eur">EUR - Euro</SelectItem>
                        <SelectItem value="gbp">GBP - British Pound</SelectItem>
                        <SelectItem value="cad">CAD - Canadian Dollar</SelectItem>
                        <SelectItem value="aud">AUD - Australian Dollar</SelectItem>
                        <SelectItem value="inr">INR - Indian Rupee</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoicePrefix"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Invoice Prefix</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-surface-1 border-border" placeholder="INV" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="autoInvoice"
              render={({ field }) => (
                <SettingsCard
                  title="Auto-Generate Invoices"
                  description="Automatically create invoices after patient visits"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="sendReceiptEmail"
              render={({ field }) => (
                <SettingsCard
                  title="Email Receipts"
                  description="Automatically send receipts after payment"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Tax Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Percent className="h-4 w-4 text-primary" />
              Tax Settings
            </h4>

            <FormField
              control={form.control}
              name="taxRate"
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <FormLabel>Default Tax Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      className="bg-surface-1 border-border w-32"
                      min={0}
                      max={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taxCalculation"
              render={({ field }) => (
                <SettingsCard
                  title="Automatic Tax Calculation"
                  description="Calculate applicable taxes based on location"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Payment Terms */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Payment Terms
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentTermsDays"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Payment Terms (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-surface-1 border-border"
                        min={0}
                        max={90}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lateFeePercentage"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Late Fee (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        className="bg-surface-1 border-border"
                        min={0}
                        max={25}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="paymentReminders"
              render={({ field }) => (
                <SettingsCard
                  title="Payment Reminders"
                  description="Send automated reminders for outstanding payments"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="requirePrepayment"
              render={({ field }) => (
                <SettingsCard
                  title="Require Prepayment"
                  description="Collect payment before service is provided"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Payment Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              Payment Options
            </h4>

            <FormField
              control={form.control}
              name="allowPartialPayments"
              render={({ field }) => (
                <SettingsCard
                  title="Allow Partial Payments"
                  description="Accept payments in installments"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableInstallments"
              render={({ field }) => (
                <SettingsCard
                  title="Enable Payment Plans"
                  description="Allow patients to set up recurring payment plans"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="insuranceIntegration"
              render={({ field }) => (
                <SettingsCard
                  title="Insurance Integration"
                  description="Enable direct billing to insurance providers"
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
                  title="Enable Discounts"
                  description="Allow staff to apply discounts to invoices"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="maxDiscountPercentage"
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <FormLabel>Maximum Discount (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      className="bg-surface-1 border-border w-32"
                      min={0}
                      max={100}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">Maximum discount staff can apply</p>
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
