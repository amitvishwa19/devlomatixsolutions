import { SettingsSection } from "../SettingsSection";
import { SettingsCard } from "../SettingsCard";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { staffSettingsSchema } from "../../_types/settings";
import { toast } from "@/hooks/use-toast";
import { Save, Users, Clock, Shield } from "lucide-react";

export function StaffSettings() {
  const form = useForm({
    resolver: zodResolver(staffSettingsSchema),
    defaultValues: {
      defaultRole: "nurse",
      maxShiftHours: 12,
      minBreakMinutes: 30,
      overtimeThreshold: 40,
      requireApproval: true,
      allowSelfSchedule: false,
      breakReminder: true,
      allowShiftSwap: true,
      requireCertification: true,
      trackAttendance: true,
      enableOvertimeAlerts: true,
    },
  });

  const onSubmit = (data) => {
    console.log("Staff settings saved:", data);
    toast({
      title: "Settings Saved",
      description: "Staff settings have been updated successfully.",
    });
  };

  return (
    <SettingsSection
      title="Staff"
      description="Configure staff management and scheduling preferences"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Role & Scheduling */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Role & Onboarding
            </h4>

            <FormField
              control={form.control}
              name="defaultRole"
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <FormLabel>Default Role for New Staff</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-surface-1 border-border">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="technician">Technician</SelectItem>
                      <SelectItem value="admin">Administrative</SelectItem>
                      <SelectItem value="support">Support Staff</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                      <SelectItem value="resident">Resident</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requireApproval"
              render={({ field }) => (
                <SettingsCard
                  title="Require Manager Approval"
                  description="New staff registrations require manager approval before access"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="requireCertification"
              render={({ field }) => (
                <SettingsCard
                  title="Require Certification Verification"
                  description="Staff must upload valid certifications before starting work"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Shift Management */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Shift Management
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxShiftHours"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Maximum Shift Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-surface-1 border-border w-full"
                        min={4}
                        max={24}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">Maximum consecutive hours per shift</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minBreakMinutes"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Minimum Break Time (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-surface-1 border-border w-full"
                        min={0}
                        max={120}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">Mandatory break per shift</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="overtimeThreshold"
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <FormLabel>Weekly Overtime Threshold (hours)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      className="bg-surface-1 border-border w-32"
                      min={20}
                      max={60}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">Hours after which overtime pay applies</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowSelfSchedule"
              render={({ field }) => (
                <SettingsCard
                  title="Self-Scheduling"
                  description="Allow staff members to manage their own schedules"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="allowShiftSwap"
              render={({ field }) => (
                <SettingsCard
                  title="Shift Swapping"
                  description="Allow staff to swap shifts with colleagues"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="breakReminder"
              render={({ field }) => (
                <SettingsCard
                  title="Break Reminders"
                  description="Send notifications to remind staff about mandatory breaks"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Attendance & Monitoring */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Attendance & Monitoring
            </h4>

            <FormField
              control={form.control}
              name="trackAttendance"
              render={({ field }) => (
                <SettingsCard
                  title="Track Attendance"
                  description="Monitor staff clock-in and clock-out times"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableOvertimeAlerts"
              render={({ field }) => (
                <SettingsCard
                  title="Overtime Alerts"
                  description="Alert managers when staff approach overtime threshold"
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
