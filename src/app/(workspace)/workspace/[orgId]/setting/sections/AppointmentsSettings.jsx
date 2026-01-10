import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Calendar, Clock, Bell } from "lucide-react";
import SectionHeader from "../_components/SectionHeader";


// Supabase action imports - uncomment to use
// import { upsertAppointmentsSettingSupabase, fetchAppointmentsSettings } from "@/components/settings/_actions/appointments_supabase";
// import { useAction } from "@/hooks/use-action";

const appointmentsSchema = z.object({
  // Scheduling Settings
  defaultDuration: z.string().optional(),
  bufferTime: z.string().optional(),
  advanceBookingLimit: z.string().optional(),
  cancellationNotice: z.string().optional(),
  // Working Hours
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  allowWeekendAppointments: z.boolean().optional(),
  allowOnlineBooking: z.boolean().optional(),
  // Reminders
  sendSmsReminders: z.boolean().optional(),
  sendEmailReminders: z.boolean().optional(),
  reminderTime: z.string().optional(),
});

// Temporary user ID - replace with actual auth user ID when auth is implemented
const TEMP_USER_ID = "temp-user-123";

export function AppointmentsSettings() {
  // Supabase action hook - uncomment to use
  // const { execute: saveToSupabase, isLoading } = useAction(upsertAppointmentsSettingSupabase, {
  //   onSuccess: (data) => {
  //     console.log("Saved to Supabase:", data);
  //   },
  //   onError: (error) => {
  //     console.error("Supabase save error:", error);
  //   }
  // });

  const form = useForm({
    resolver: zodResolver(appointmentsSchema),
    defaultValues: {
      defaultDuration: "30",
      bufferTime: "10",
      advanceBookingLimit: "30",
      cancellationNotice: "24",
      openingTime: "08:00",
      closingTime: "18:00",
      allowWeekendAppointments: false,
      allowOnlineBooking: true,
      sendSmsReminders: true,
      sendEmailReminders: true,
      reminderTime: "24",
    },
  });

  const onSubmit = async (data) => {
    const toastId = toast.loading("Saving appointment settings...");
    try {
      console.log("Appointments settings:", data);

      // === SUPABASE SAVE - Uncomment to enable ===
      // await saveToSupabase({
      //   userId: TEMP_USER_ID,
      //   formData: {
      //     defaultDuration: data.defaultDuration,
      //     bufferTime: data.bufferTime,
      //     maxAdvanceBooking: data.advanceBookingLimit,
      //     allowSameDayBooking: true,
      //     workingHoursStart: data.openingTime,
      //     workingHoursEnd: data.closingTime,
      //     emailReminder: data.sendEmailReminders,
      //     smsReminder: data.sendSmsReminders,
      //     reminderTime: data.reminderTime,
      //   }
      // });
      // ============================================

      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Appointment settings saved successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to save settings", { id: toastId });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Appointments"
        description="Configure appointment scheduling and management"
        onSave={form.handleSubmit(onSubmit)}
      />

      <ScrollArea className="flex-1  h-[60vh] p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Scheduling Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Scheduling Settings</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="defaultDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Appointment Duration</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
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
                  name="bufferTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buffer Time Between Appointments</FormLabel>
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

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="advanceBookingLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Advance Booking Limit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cancellationNotice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cancellation Notice Required</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">No notice required</SelectItem>
                          <SelectItem value="2">2 hours</SelectItem>
                          <SelectItem value="24">24 hours</SelectItem>
                          <SelectItem value="48">48 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Working Hours */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Working Hours</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="openingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="closingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="allowWeekendAppointments"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Allow Weekend Appointments</FormLabel>
                        <FormDescription>Enable scheduling on Saturdays and Sundays</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="allowOnlineBooking"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Allow Online Booking</FormLabel>
                        <FormDescription>Patients can book appointments online</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Reminders */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">Reminders</span>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="sendSmsReminders"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Send SMS Reminders</FormLabel>
                        <FormDescription>Notify patients via SMS before appointments</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sendEmailReminders"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Send Email Reminders</FormLabel>
                        <FormDescription>Notify patients via email before appointments</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reminderTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reminder Time Before Appointment</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 hour</SelectItem>
                          <SelectItem value="2">2 hours</SelectItem>
                          <SelectItem value="24">24 hours</SelectItem>
                          <SelectItem value="48">48 hours</SelectItem>
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
