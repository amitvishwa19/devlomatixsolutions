import { SettingsSection } from "../SettingsSection";
import { SettingsCard } from "../SettingsCard";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generalSettingsSchema } from "../../_types/settings";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Save, Building, Globe, Clock, Monitor, Cpu, HardDrive } from "lucide-react";

export function GeneralSettings() {


  const form = useForm({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      hospitalName: "City General Hospital",
      hospitalCode: "CGH-001",
      email: "admin@citygeneral.com",
      phone: "+1 (555) 123-4567",
      address: "123 Medical Center Drive, Healthcare City, HC 12345",
      website: "https://citygeneral.com",
      timezone: "utc-5",
      language: "en",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      autoLogout: true,
      maintenanceMode: false,
      enableAnalytics: true,
      fiscalYearStart: "january",
      bedCapacity: 500,
      emergencyCapacity: 50,
      operatingRooms: 12,
      enableMultiBranch: false,
      defaultBranch: "",
      enableDarkMode: true,
      compactMode: false,
      showWelcomeScreen: true,
      enableKeyboardShortcuts: true,
      autoSaveInterval: 60,
      sessionWarningMinutes: 5,
      maxConcurrentSessions: 3,
      enableActivityLog: true,
      dataRetentionDays: 365,
      enableBackup: true,
      backupFrequency: "daily",
      backupRetentionDays: 30,
      enableDisasterRecovery: true,
      enableLoadBalancing: false,
      enableCaching: true,
      cacheExpiryMinutes: 60,
    },
  });

  const onSubmit = (data) => {
    console.log("General settings saved:", data);
    toast({
      title: "Settings Saved",
      description: "General settings have been updated successfully.",
    });
  };

  return (
    <SettingsSection
      title="General"
      description="Configure your hospital's basic settings and preferences"
      onSave={form.handleSubmit(onSubmit)}
    //onSave={() => { console.log('Save general setting') }}
    >



      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Hospital Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              Hospital Information
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hospitalName"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Hospital Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="    border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hospitalCode"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Hospital Code</FormLabel>
                    <FormControl>
                      <Input {...field} className="    border-border" placeholder="CGH-001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" className="    border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input {...field} className="    border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <AddressMapPicker
                      value={field.value}
                      onChange={(address) => field.onChange(address)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input {...field} className="    border-border" placeholder="https://" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Localization */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Localization
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Timezone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="    border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                        <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="utc+1">Central European (UTC+1)</SelectItem>
                        <SelectItem value="utc+5.5">India (UTC+5:30)</SelectItem>
                        <SelectItem value="utc+8">Singapore (UTC+8)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="    border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateFormat"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Date Format</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="    border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeFormat"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Time Format</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="    border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                        <SelectItem value="24h">24 Hour</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Capacity & Infrastructure */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              Capacity & Infrastructure
            </h4>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="bedCapacity"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Total Bed Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} className="    border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyCapacity"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Emergency Beds</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} className="    border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="operatingRooms"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Operating Rooms</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} className="    border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fiscalYearStart"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Fiscal Year Start</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="    border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="january">January</SelectItem>
                        <SelectItem value="april">April</SelectItem>
                        <SelectItem value="july">July</SelectItem>
                        <SelectItem value="october">October</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enableMultiBranch"
                render={({ field }) => (
                  <SettingsCard
                    title="Multi-Branch Support"
                    description="Enable management of multiple hospital branches"
                  >
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </SettingsCard>
                )}
              />
            </div>
          </div>

          {/* System Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              System Settings
            </h4>

            <FormField
              control={form.control}
              name="autoLogout"
              render={({ field }) => (
                <SettingsCard
                  title="Auto Logout"
                  description="Automatically log out users after period of inactivity"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sessionWarningMinutes"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Session Warning (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} className="    border-border" min={1} max={30} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxConcurrentSessions"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Max Concurrent Sessions</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} className="    border-border" min={1} max={10} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="maintenanceMode"
              render={({ field }) => (
                <SettingsCard
                  title="Maintenance Mode"
                  description="Enable this to restrict access during system maintenance"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableAnalytics"
              render={({ field }) => (
                <SettingsCard
                  title="Enable Analytics"
                  description="Collect usage analytics to improve system performance"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="enableActivityLog"
              render={({ field }) => (
                <SettingsCard
                  title="Activity Logging"
                  description="Track all user activities for audit purposes"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />
          </div>

          {/* User Interface */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Monitor className="h-4 w-4 text-primary" />
              User Interface
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="enableDarkMode"
                render={({ field }) => (
                  <SettingsCard
                    title="Dark Mode"
                    description="Enable dark theme by default"
                  >
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </SettingsCard>
                )}
              />

              <FormField
                control={form.control}
                name="compactMode"
                render={({ field }) => (
                  <SettingsCard
                    title="Compact Mode"
                    description="Use condensed UI for more data density"
                  >
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </SettingsCard>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="showWelcomeScreen"
                render={({ field }) => (
                  <SettingsCard
                    title="Welcome Screen"
                    description="Show welcome screen on login"
                  >
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </SettingsCard>
                )}
              />

              <FormField
                control={form.control}
                name="enableKeyboardShortcuts"
                render={({ field }) => (
                  <SettingsCard
                    title="Keyboard Shortcuts"
                    description="Enable keyboard shortcuts for power users"
                  >
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </SettingsCard>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="autoSaveInterval"
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <FormLabel>Auto-Save Interval (seconds)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} className="    border-border w-32" min={30} max={600} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">Automatically save form data</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Backup & Recovery */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              Backup & Recovery
            </h4>

            <FormField
              control={form.control}
              name="enableBackup"
              render={({ field }) => (
                <SettingsCard
                  title="Automatic Backups"
                  description="Enable scheduled automatic backups"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="backupFrequency"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Backup Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="    border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="backupRetentionDays"
                render={({ field }) => (
                  <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                    <FormLabel>Backup Retention (days)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} className="    border-border" min={7} max={365} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="enableDisasterRecovery"
              render={({ field }) => (
                <SettingsCard
                  title="Disaster Recovery"
                  description="Enable disaster recovery protocols and failover"
                >
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </SettingsCard>
              )}
            />

            <FormField
              control={form.control}
              name="dataRetentionDays"
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <FormLabel>Data Retention Period (days)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} className="    border-border w-32" min={30} max={3650} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">How long to keep deleted data before purging</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Performance */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              Performance
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="enableCaching"
                render={({ field }) => (
                  <SettingsCard
                    title="Enable Caching"
                    description="Cache frequently accessed data for faster loading"
                  >
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </SettingsCard>
                )}
              />

              <FormField
                control={form.control}
                name="enableLoadBalancing"
                render={({ field }) => (
                  <SettingsCard
                    title="Load Balancing"
                    description="Distribute traffic across multiple servers"
                  >
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </SettingsCard>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cacheExpiryMinutes"
              render={({ field }) => (
                <FormItem className="p-4 rounded-xl bg-surface-2 border border-border/50">
                  <FormLabel>Cache Expiry (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} className="    border-border w-32" min={5} max={1440} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">Time before cached data expires</p>
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
