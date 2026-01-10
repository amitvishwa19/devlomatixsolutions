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
import { Receipt, CreditCard, FileText } from "lucide-react";
import SectionHeader from "../_components/SectionHeader";

// Supabase action imports - uncomment to use
// import { upsertInvoiceSettingSupabase, fetchInvoiceSettings } from "@/components/settings/_actions/invoice_supabase";
// import { useAction } from "@/hooks/use-action";

const invoiceSchema = z.object({
  // Invoice Settings
  invoicePrefix: z.string().optional(),
  nextInvoiceNumber: z.coerce.number().optional(),
  dueDatePeriod: z.string().optional(),
  currency: z.string().optional(),
  invoiceNotes: z.string().optional(),
  // Tax Settings
  taxRate: z.coerce.number().optional(),
  taxId: z.string().optional(),
  includeTaxInPrice: z.boolean().optional(),
  showTaxBreakdown: z.boolean().optional(),
  // Payment Options
  acceptCash: z.boolean().optional(),
  acceptCard: z.boolean().optional(),
  acceptInsurance: z.boolean().optional(),
  allowPartialPayments: z.boolean().optional(),
});

// Temporary user ID - replace with actual auth user ID when auth is implemented
const TEMP_USER_ID = "temp-user-123";

export function InvoiceSettings() {
  // Supabase action hook - uncomment to use
  // const { execute: saveToSupabase, isLoading } = useAction(upsertInvoiceSettingSupabase, {
  //   onSuccess: (data) => {
  //     console.log("Saved to Supabase:", data);
  //   },
  //   onError: (error) => {
  //     console.error("Supabase save error:", error);
  //   }
  // });

  const form = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoicePrefix: "INV-",
      nextInvoiceNumber: 1001,
      dueDatePeriod: "30",
      currency: "usd",
      invoiceNotes: "Thank you for choosing City General Hospital. Payment is due within the specified period.",
      taxRate: 0,
      taxId: "",
      includeTaxInPrice: false,
      showTaxBreakdown: true,
      acceptCash: true,
      acceptCard: true,
      acceptInsurance: true,
      allowPartialPayments: true,
    },
  });

  const onSubmit = async (data) => {
    const toastId = toast.loading("Saving invoice settings...");
    try {
      console.log("Invoice settings:", data);

      // === SUPABASE SAVE - Uncomment to enable ===
      // await saveToSupabase({
      //   userId: TEMP_USER_ID,
      //   formData: {
      //     invoicePrefix: data.invoicePrefix,
      //     nextInvoiceNumber: data.nextInvoiceNumber,
      //     dueDatePeriod: data.dueDatePeriod,
      //     currency: data.currency,
      //     invoiceNotes: data.invoiceNotes,
      //     taxRate: data.taxRate,
      //     taxId: data.taxId,
      //     includeTaxInPrice: data.includeTaxInPrice,
      //     showTaxBreakdown: data.showTaxBreakdown,
      //     acceptCash: data.acceptCash,
      //     acceptCard: data.acceptCard,
      //     acceptInsurance: data.acceptInsurance,
      //     allowPartialPayments: data.allowPartialPayments,
      //   }
      // });
      // ============================================

      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Invoice settings saved successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to save settings", { id: toastId });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Invoice"
        description="Configure invoice templates and billing options"
        onSave={form.handleSubmit(onSubmit)}
      />

      <ScrollArea className="flex-1  h-[60vh] p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Invoice Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Receipt className="h-4 w-4" />
                <span className="text-sm font-medium">Invoice Settings</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="invoicePrefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Prefix</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nextInvoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Invoice Number</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dueDatePeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date Period</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Due on receipt</SelectItem>
                          <SelectItem value="7">Net 7 days</SelectItem>
                          <SelectItem value="15">Net 15 days</SelectItem>
                          <SelectItem value="30">Net 30 days</SelectItem>
                          <SelectItem value="60">Net 60 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="usd">USD ($)</SelectItem>
                          <SelectItem value="eur">EUR (€)</SelectItem>
                          <SelectItem value="gbp">GBP (£)</SelectItem>
                          <SelectItem value="inr">INR (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="invoiceNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Notes</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[80px]" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Tax Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Tax Settings</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID / GST Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter tax ID" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="includeTaxInPrice"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Include Tax in Price</FormLabel>
                        <FormDescription>Show prices inclusive of tax</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="showTaxBreakdown"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Show Tax Breakdown</FormLabel>
                        <FormDescription>Display detailed tax calculation on invoice</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-medium">Payment Options</span>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="acceptCash"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Accept Cash Payments</FormLabel>
                        <FormDescription>Allow cash payments at reception</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="acceptCard"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Accept Card Payments</FormLabel>
                        <FormDescription>Enable credit/debit card payments</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="acceptInsurance"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Accept Insurance</FormLabel>
                        <FormDescription>Process insurance claims directly</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="allowPartialPayments"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Allow Partial Payments</FormLabel>
                        <FormDescription>Enable patients to pay in installments</FormDescription>
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
