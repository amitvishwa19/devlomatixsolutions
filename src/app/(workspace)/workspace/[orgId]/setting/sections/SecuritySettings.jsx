import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Shield, Key, Lock, History } from "lucide-react";
import SectionHeader from "../_components/SectionHeader";

// Supabase action imports - uncomment to use
// import { upsertSecuritySettingSupabase, fetchSecuritySettings } from "@/components/settings/_actions/security_supabase";
// import { useAction } from "@/hooks/use-action";

const securitySchema = z.object({
  // Password Policy
  minPasswordLength: z.string().optional(),
  passwordExpiry: z.string().optional(),
  requireUppercase: z.boolean().optional(),
  requireNumbers: z.boolean().optional(),
  requireSpecialChars: z.boolean().optional(),
  // Authentication
  twoFactorAuth: z.boolean().optional(),
  sessionTimeout: z.string().optional(),
  failedLoginLockout: z.string().optional(),
});

const mockSessions = [
  { id: "1", device: "Chrome on Windows", ip: "192.168.1.100", location: "New York, US", lastActive: "Active now", current: true },
  { id: "2", device: "Safari on iPhone", ip: "192.168.1.105", location: "New York, US", lastActive: "2 hours ago", current: false },
  { id: "3", device: "Firefox on MacOS", ip: "192.168.1.110", location: "Boston, US", lastActive: "1 day ago", current: false },
];

// Temporary user ID - replace with actual auth user ID when auth is implemented
const TEMP_USER_ID = "temp-user-123";

export function SecuritySettings() {
  // Supabase action hook - uncomment to use
  // const { execute: saveToSupabase, isLoading } = useAction(upsertSecuritySettingSupabase, {
  //   onSuccess: (data) => {
  //     console.log("Saved to Supabase:", data);
  //   },
  //   onError: (error) => {
  //     console.error("Supabase save error:", error);
  //   }
  // });

  const form = useForm({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      minPasswordLength: "8",
      passwordExpiry: "90",
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      twoFactorAuth: true,
      sessionTimeout: "30",
      failedLoginLockout: "5",
    },
  });

  const onSubmit = async (data) => {
    const toastId = toast.loading("Saving security settings...");
    try {
      console.log("Security settings:", data);

      // === SUPABASE SAVE - Uncomment to enable ===
      // await saveToSupabase({
      //   userId: TEMP_USER_ID,
      //   formData: {
      //     minPasswordLength: data.minPasswordLength,
      //     passwordExpiry: data.passwordExpiry,
      //     requireUppercase: data.requireUppercase,
      //     requireNumbers: data.requireNumbers,
      //     requireSpecialChars: data.requireSpecialChars,
      //     twoFactorAuth: data.twoFactorAuth,
      //     sessionTimeout: data.sessionTimeout,
      //     failedLoginLockout: data.failedLoginLockout,
      //   }
      // });
      // ============================================

      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Security settings saved successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to save settings", { id: toastId });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Security"
        description="Manage security settings and access controls"
        onSave={form.handleSubmit(onSubmit)}
      />

      <ScrollArea className="flex-1  h-[60vh] p-4">
        <div className="space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Password Policy */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Key className="h-4 w-4" />
                  <span className="text-sm font-medium">Password Policy</span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="minPasswordLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Password Length</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="6">6 characters</SelectItem>
                            <SelectItem value="8">8 characters</SelectItem>
                            <SelectItem value="10">10 characters</SelectItem>
                            <SelectItem value="12">12 characters</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="passwordExpiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password Expiry</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="60">60 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                            <SelectItem value="never">Never</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <FormField
                    control={form.control}
                    name="requireUppercase"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Require Uppercase Letters</FormLabel>
                          <FormDescription>Password must contain uppercase letters</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="requireNumbers"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Require Numbers</FormLabel>
                          <FormDescription>Password must contain numbers</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="requireSpecialChars"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Require Special Characters</FormLabel>
                          <FormDescription>Password must contain special characters</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Authentication */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm font-medium">Authentication</span>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="twoFactorAuth"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
                          <FormDescription>Require 2FA for all users</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sessionTimeout"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Session Timeout</FormLabel>
                          <FormDescription>Auto logout after inactivity</FormDescription>
                        </div>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="never">Never</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="failedLoginLockout"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Failed Login Lockout</FormLabel>
                          <FormDescription>Lock account after failed attempts</FormDescription>
                        </div>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="3">3 attempts</SelectItem>
                            <SelectItem value="5">5 attempts</SelectItem>
                            <SelectItem value="10">10 attempts</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>

          {/* Active Sessions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <History className="h-4 w-4" />
                <span className="text-sm font-medium">Active Sessions</span>
              </div>
              <Button variant="outline" size="sm">
                Revoke All Other Sessions
              </Button>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        {session.device}
                        {session.current && <Badge className="ml-2">Current</Badge>}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{session.ip}</TableCell>
                      <TableCell>{session.location}</TableCell>
                      <TableCell className="text-muted-foreground">{session.lastActive}</TableCell>
                      <TableCell className="text-right">
                        {!session.current && (
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            Revoke
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
