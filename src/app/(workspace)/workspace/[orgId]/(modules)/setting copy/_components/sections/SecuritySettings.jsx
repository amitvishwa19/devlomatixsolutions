import { SettingsSection } from "../SettingsSection";
import { SettingsCard } from "../SettingsCard";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { securitySettingsSchema } from "../../_types/settings";
import { toast } from "@/hooks/use-toast";
import { Save, Shield, Key, Lock, History, Smartphone, Database } from "lucide-react";

export function SecuritySettings() {
  const form = useForm({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      twoFactor: true,
      sessionTimeout: "30",
      passwordExpiry: "90",
      minPasswordLength: 12,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true,
      ipWhitelist: false,
      auditLog: true,
      failedLoginAttempts: 5,
      lockoutDuration: 15,
      enforceDeviceLimit: true,
      maxDevices: 3,
      requireVpn: false,
      encryptBackups: true,
    },
  });

  const onSubmit = (data) => {
    console.log("Security settings saved:", data);
    toast({
      title: "Settings Saved",
      description: "Security settings have been updated successfully.",
    });
  };

  return (
    <SettingsSection
      title="Security"
      description="Configure security settings and access controls"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Security Status */}
          <div className="p-5 rounded-xl bg-surface-2 border border-primary/20 glow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground">Security Status</h4>
                <p className="text-xs text-success">All systems secure</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" className="gap-2">
                <Key className="h-3.5 w-3.5" />
                Change Password
              </Button>
              <Button type="button" variant="outline" size="sm" className="gap-2">
                <History className="h-3.5 w-3.5" />
                View Audit Log
              </Button>
            </div>
          </div>

          {/* Authentication */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Authentication
            </h4>

            <FormField
              control={form.control}
              name="twoFactor"
              render={({ field }) => (
                <SettingsCard
                  title="Two-Factor Authentication"
                  description="Require 2FA for all user accounts"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="sessionTimeout"
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <FormLabel>Session Timeout</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-surface-1 border-border">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="failedLoginAttempts"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Max Failed Login Attempts</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-surface-1 border-border"
                        min={3}
                        max={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lockoutDuration"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Lockout Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-surface-1 border-border"
                        min={5}
                        max={60}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Password Policy */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              Password Policy
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="passwordExpiry"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Password Expiry</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-surface-1 border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minPasswordLength"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Minimum Password Length</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-surface-1 border-border"
                        min={8}
                        max={32}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="requireSpecialChars"
              render={({ field }) => (
                <SettingsCard
                  title="Require Special Characters"
                  description="Passwords must include at least one special character"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="requireNumbers"
              render={({ field }) => (
                <SettingsCard
                  title="Require Numbers"
                  description="Passwords must include at least one number"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="requireUppercase"
              render={({ field }) => (
                <SettingsCard
                  title="Require Uppercase"
                  description="Passwords must include uppercase and lowercase letters"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Device & Access Control */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" />
              Device & Access Control
            </h4>

            <FormField
              control={form.control}
              name="enforceDeviceLimit"
              render={({ field }) => (
                <SettingsCard
                  title="Enforce Device Limit"
                  description="Limit the number of devices per user account"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="maxDevices"
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <FormLabel>Maximum Devices Per User</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      className="bg-surface-1 border-border w-32"
                      min={1}
                      max={10}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ipWhitelist"
              render={({ field }) => (
                <SettingsCard
                  title="IP Whitelist"
                  description="Restrict access to specific IP addresses only"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="requireVpn"
              render={({ field }) => (
                <SettingsCard
                  title="Require VPN"
                  description="Require VPN connection for remote access"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* Audit & Backup */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Audit & Backup
            </h4>

            <FormField
              control={form.control}
              name="auditLog"
              render={({ field }) => (
                <SettingsCard
                  title="Audit Logging"
                  description="Track all user actions and system changes"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="encryptBackups"
              render={({ field }) => (
                <SettingsCard
                  title="Encrypt Backups"
                  description="Encrypt all system backups with AES-256"
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
