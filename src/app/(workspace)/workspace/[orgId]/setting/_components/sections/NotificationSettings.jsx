import { SettingsSection } from "../SettingsSection";
import { SettingsCard } from "../SettingsCard";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { notificationSettingsSchema } from "../../_types/settings";
import { toast } from "@/hooks/use-toast";
import { Save, Mail, Smartphone, Bell, Moon } from "lucide-react";

export function NotificationSettings() {
  const form = useForm({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true,
      emergencyAlerts: true,
      appointmentReminders: true,
      reportReady: true,
      staffUpdates: false,
      systemMaintenance: true,
      patientDischarge: true,
      labResults: true,
      prescriptionAlerts: true,
      billingNotifications: true,
      inventoryAlerts: false,
      quietHoursEnabled: true,
      quietHoursStart: "22:00",
      quietHoursEnd: "07:00",
      emailDigestFrequency: "daily",
    },
  });

  const onSubmit = (data) => {
    console.log("Notification settings saved:", data);
    toast({
      title: "Settings Saved",
      description: "Notification settings have been updated successfully.",
    });
  };

  return (
    <SettingsSection
      title="Notifications"
      description="Manage how you receive alerts and updates"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Notification Channels */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              Notification Channels
            </h4>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-surface-2 border border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Email Alerts</p>
                    <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="emailAlerts"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>

              <div className="p-4 rounded-xl bg-surface-2 border border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Smartphone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">SMS Alerts</p>
                    <p className="text-xs text-muted-foreground">Receive text message notifications</p>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="smsAlerts"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>

              <div className="p-4 rounded-xl bg-surface-2 border border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Browser and mobile push alerts</p>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="pushNotifications"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="emailDigestFrequency"
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <FormLabel>Email Digest Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-surface-1 border-border">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly Digest</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Alert Types */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              Clinical Alerts
            </h4>

            <FormField
              control={form.control}
              name="emergencyAlerts"
              render={({ field }) => (
                <SettingsCard
                  title="Emergency Alerts"
                  description="Critical alerts for urgent situations (cannot be silenced)"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="labResults"
              render={({ field }) => (
                <SettingsCard
                  title="Lab Results"
                  description="Notifications when lab test results are available"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="prescriptionAlerts"
              render={({ field }) => (
                <SettingsCard
                  title="Prescription Alerts"
                  description="Drug interaction warnings and prescription updates"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="patientDischarge"
              render={({ field }) => (
                <SettingsCard
                  title="Patient Discharge"
                  description="Notifications when patients are discharged"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Administrative Alerts */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              Administrative Alerts
            </h4>

            <FormField
              control={form.control}
              name="appointmentReminders"
              render={({ field }) => (
                <SettingsCard
                  title="Appointment Reminders"
                  description="Reminders for upcoming appointments"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="reportReady"
              render={({ field }) => (
                <SettingsCard
                  title="Report Ready"
                  description="Notifications when reports are available"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="billingNotifications"
              render={({ field }) => (
                <SettingsCard
                  title="Billing Notifications"
                  description="Payment confirmations and invoice updates"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="inventoryAlerts"
              render={({ field }) => (
                <SettingsCard
                  title="Inventory Alerts"
                  description="Low stock and supply chain notifications"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="staffUpdates"
              render={({ field }) => (
                <SettingsCard
                  title="Staff Updates"
                  description="Schedule changes and team announcements"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="systemMaintenance"
              render={({ field }) => (
                <SettingsCard
                  title="System Maintenance"
                  description="Updates about scheduled maintenance"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Quiet Hours */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Moon className="h-4 w-4 text-primary" />
              Quiet Hours
            </h4>

            <FormField
              control={form.control}
              name="quietHoursEnabled"
              render={({ field }) => (
                <SettingsCard
                  title="Enable Quiet Hours"
                  description="Silence non-critical notifications during specified hours"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quietHoursStart"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="bg-surface-1 border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quietHoursEnd"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="bg-surface-1 border-border" />
                    </FormControl>
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
