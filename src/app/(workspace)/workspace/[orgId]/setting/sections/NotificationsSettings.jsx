import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";
import SectionHeader from "../_components/SectionHeader";

// Supabase action imports - uncomment to use
// import { upsertNotificationsSettingSupabase, fetchNotificationsSettings } from "@/components/settings/_actions/notifications_supabase";
// import { useAction } from "@/hooks/use-action";

const notificationsSchema = z.object({
  // Email Notifications
  emailAppointmentConfirmations: z.boolean().optional(),
  emailAppointmentReminders: z.boolean().optional(),
  emailInvoiceBilling: z.boolean().optional(),
  emailLabResults: z.boolean().optional(),
  // SMS Notifications
  smsAppointmentReminders: z.boolean().optional(),
  smsPrescriptionReady: z.boolean().optional(),
  smsPaymentConfirmations: z.boolean().optional(),
  // In-App Notifications
  inAppNewPatient: z.boolean().optional(),
  inAppEmergencyAlerts: z.boolean().optional(),
  inAppLowInventory: z.boolean().optional(),
  inAppScheduleChanges: z.boolean().optional(),
  // Schedule
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
});

// Temporary user ID - replace with actual auth user ID when auth is implemented
const TEMP_USER_ID = "temp-user-123";

export function NotificationsSettings() {
  // Supabase action hook - uncomment to use
  // const { execute: saveToSupabase, isLoading } = useAction(upsertNotificationsSettingSupabase, {
  //   onSuccess: (data) => {
  //     console.log("Saved to Supabase:", data);
  //   },
  //   onError: (error) => {
  //     console.error("Supabase save error:", error);
  //   }
  // });

  const form = useForm({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      emailAppointmentConfirmations: true,
      emailAppointmentReminders: true,
      emailInvoiceBilling: true,
      emailLabResults: true,
      smsAppointmentReminders: true,
      smsPrescriptionReady: true,
      smsPaymentConfirmations: false,
      inAppNewPatient: true,
      inAppEmergencyAlerts: true,
      inAppLowInventory: true,
      inAppScheduleChanges: true,
      quietHoursStart: "22:00",
      quietHoursEnd: "07:00",
    },
  });

  const onSubmit = async (data) => {
    const toastId = toast.loading("Saving notification settings...");
    try {
      console.log("Notifications settings:", data);

      // === SUPABASE SAVE - Uncomment to enable ===
      // await saveToSupabase({
      //   userId: TEMP_USER_ID,
      //   formData: {
      //     emailAppointmentConfirmations: data.emailAppointmentConfirmations,
      //     emailAppointmentReminders: data.emailAppointmentReminders,
      //     emailInvoiceBilling: data.emailInvoiceBilling,
      //     emailLabResults: data.emailLabResults,
      //     smsAppointmentReminders: data.smsAppointmentReminders,
      //     smsPrescriptionReady: data.smsPrescriptionReady,
      //     smsPaymentConfirmations: data.smsPaymentConfirmations,
      //     inAppNewPatient: data.inAppNewPatient,
      //     inAppEmergencyAlerts: data.inAppEmergencyAlerts,
      //     inAppLowInventory: data.inAppLowInventory,
      //     inAppScheduleChanges: data.inAppScheduleChanges,
      //     quietHoursStart: data.quietHoursStart,
      //     quietHoursEnd: data.quietHoursEnd,
      //   }
      // });
      // ============================================

      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Notification settings saved successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to save settings", { id: toastId });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Notifications"
        description="Configure notification preferences and channels"
        onSave={form.handleSubmit(onSubmit)}
      />

      <ScrollArea className="flex-1  h-[60vh] p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Email Notifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Mail className="h-4 w-4" />
                <span className="text-sm font-medium">Email Notifications</span>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="emailAppointmentConfirmations"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Appointment Confirmations</FormLabel>
                        <FormDescription>Send email when appointments are booked</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emailAppointmentReminders"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Appointment Reminders</FormLabel>
                        <FormDescription>Send reminder emails before appointments</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emailInvoiceBilling"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Invoice & Billing</FormLabel>
                        <FormDescription>Send invoices and payment receipts via email</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emailLabResults"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Lab Results Ready</FormLabel>
                        <FormDescription>Notify when lab results are available</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* SMS Notifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Smartphone className="h-4 w-4" />
                <span className="text-sm font-medium">SMS Notifications</span>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="smsAppointmentReminders"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Appointment Reminders</FormLabel>
                        <FormDescription>Send SMS reminders before appointments</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smsPrescriptionReady"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Prescription Ready</FormLabel>
                        <FormDescription>Notify when prescription is ready for pickup</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smsPaymentConfirmations"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Payment Confirmations</FormLabel>
                        <FormDescription>Send payment confirmation via SMS</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* In-App Notifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">In-App Notifications</span>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="inAppNewPatient"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">New Patient Registration</FormLabel>
                        <FormDescription>Alert when new patients register</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inAppEmergencyAlerts"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Emergency Alerts</FormLabel>
                        <FormDescription>Critical emergency notifications</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inAppLowInventory"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Low Inventory Alerts</FormLabel>
                        <FormDescription>Notify when stock runs low</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inAppScheduleChanges"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Staff Schedule Changes</FormLabel>
                        <FormDescription>Alert on schedule modifications</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Notification Schedule */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm font-medium">Notification Schedule</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="quietHoursStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quiet Hours Start</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="20:00">8:00 PM</SelectItem>
                          <SelectItem value="21:00">9:00 PM</SelectItem>
                          <SelectItem value="22:00">10:00 PM</SelectItem>
                          <SelectItem value="23:00">11:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quietHoursEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quiet Hours End</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="06:00">6:00 AM</SelectItem>
                          <SelectItem value="07:00">7:00 AM</SelectItem>
                          <SelectItem value="08:00">8:00 AM</SelectItem>
                          <SelectItem value="09:00">9:00 AM</SelectItem>
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
