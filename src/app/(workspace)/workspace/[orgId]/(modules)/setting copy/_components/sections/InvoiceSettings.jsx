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
import { Save, FileText, Printer, Mail, Hash, Globe } from "lucide-react";

const invoiceSettingsSchema = z.object({
  invoicePrefix: z.string().min(1).max(10),
  invoiceStartNumber: z.number().int().min(1),
  defaultDueDays: z.number().int().min(0).max(90),
  defaultCurrency: z.string().min(1),
  taxIncluded: z.boolean(),
  defaultTaxRate: z.number().min(0).max(100),
  showHospitalLogo: z.boolean(),
  showHospitalAddress: z.boolean(),
  showPatientAddress: z.boolean(),
  showDoctorDetails: z.boolean(),
  showDepartment: z.boolean(),
  showItemizedServices: z.boolean(),
  showDiscounts: z.boolean(),
  showInsuranceInfo: z.boolean(),
  footerNote: z.string().max(500),
  termsAndConditions: z.string().max(2000),
  autoGenerateInvoice: z.boolean(),
  autoSendEmail: z.boolean(),
  emailTemplate: z.string(),
  enableOnlinePayment: z.boolean(),
  paymentGateway: z.string(),
  enablePartialPayment: z.boolean(),
  enableRecurringInvoice: z.boolean(),
  duplicateInvoiceWarning: z.boolean(),
  printFormat: z.string(),
  paperSize: z.string(),
});

export function InvoiceSettings() {
  const form = useForm({
    resolver: zodResolver(invoiceSettingsSchema),
    defaultValues: {
      invoicePrefix: "INV",
      invoiceStartNumber: 1001,
      defaultDueDays: 30,
      defaultCurrency: "usd",
      taxIncluded: false,
      defaultTaxRate: 8.5,
      showHospitalLogo: true,
      showHospitalAddress: true,
      showPatientAddress: true,
      showDoctorDetails: true,
      showDepartment: true,
      showItemizedServices: true,
      showDiscounts: true,
      showInsuranceInfo: true,
      footerNote: "Thank you for choosing our hospital.",
      termsAndConditions: "Payment is due within the specified period.",
      autoGenerateInvoice: true,
      autoSendEmail: false,
      emailTemplate: "default",
      enableOnlinePayment: true,
      paymentGateway: "stripe",
      enablePartialPayment: true,
      enableRecurringInvoice: false,
      duplicateInvoiceWarning: true,
      printFormat: "detailed",
      paperSize: "a4",
    },
  });

  const onSubmit = (data) => {
    console.log("Invoice settings saved:", data);
    toast({
      title: "Settings Saved",
      description: "Invoice settings have been updated successfully.",
    });
  };

  return (
    <SettingsSection
      title="Invoice"
      description="Configure invoice generation and formatting preferences"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Invoice Numbering */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary" />
              Invoice Numbering
            </h4>

            <div className="grid grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="invoiceStartNumber"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Starting Number</FormLabel>
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
              name="duplicateInvoiceWarning"
              render={({ field }) => (
                <SettingsCard
                  title="Duplicate Invoice Warning"
                  description="Warn when creating invoice for same visit/service"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Payment Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Payment Settings
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="defaultCurrency"
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
                        <SelectItem value="inr">INR - Indian Rupee</SelectItem>
                        <SelectItem value="aud">AUD - Australian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultDueDays"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Default Due Days</FormLabel>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taxIncluded"
                render={({ field }) => (
                  <SettingsCard
                    title="Tax Included in Prices"
                    description="Prices already include tax"
                  >
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </SettingsCard>
                )}
              />

              <FormField
                control={form.control}
                name="defaultTaxRate"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Default Tax Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
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
              name="enableOnlinePayment"
              render={({ field }) => (
                <SettingsCard
                  title="Online Payment"
                  description="Allow patients to pay invoices online"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enablePartialPayment"
              render={({ field }) => (
                <SettingsCard
                  title="Partial Payments"
                  description="Allow patients to make partial payments"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableRecurringInvoice"
              render={({ field }) => (
                <SettingsCard
                  title="Recurring Invoices"
                  description="Enable automated recurring invoice generation"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Invoice Display */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Invoice Display
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="showHospitalLogo"
                render={({ field }) => (
                  <SettingsCard
                    title="Show Hospital Logo"
                    description="Display logo on invoice"
                  >
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </SettingsCard>
                )}
              />

              <FormField
                control={form.control}
                name="showHospitalAddress"
                render={({ field }) => (
                  <SettingsCard
                    title="Show Hospital Address"
                    description="Display address on invoice"
                  >
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </SettingsCard>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="showPatientAddress"
                render={({ field }) => (
                  <SettingsCard
                    title="Show Patient Address"
                    description="Include patient address"
                  >
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </SettingsCard>
                )}
              />

              <FormField
                control={form.control}
                name="showDoctorDetails"
                render={({ field }) => (
                  <SettingsCard
                    title="Show Doctor Details"
                    description="Include treating doctor info"
                  >
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </SettingsCard>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="showItemizedServices"
              render={({ field }) => (
                <SettingsCard
                  title="Itemized Services"
                  description="Show detailed breakdown of services and charges"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="showInsuranceInfo"
              render={({ field }) => (
                <SettingsCard
                  title="Insurance Information"
                  description="Display insurance details and coverage"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Email & Automation */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Email & Automation
            </h4>

            <FormField
              control={form.control}
              name="autoGenerateInvoice"
              render={({ field }) => (
                <SettingsCard
                  title="Auto-Generate Invoices"
                  description="Automatically create invoices after services"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="autoSendEmail"
              render={({ field }) => (
                <SettingsCard
                  title="Auto-Send Email"
                  description="Automatically email invoices to patients"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Print Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Printer className="h-4 w-4 text-primary" />
              Print Settings
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="printFormat"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Print Format</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-surface-1 border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="summary">Summary Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paperSize"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Paper Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-surface-1 border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="a4">A4</SelectItem>
                        <SelectItem value="letter">Letter</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
