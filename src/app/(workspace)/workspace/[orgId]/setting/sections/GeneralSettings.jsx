import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Building2, Globe, Palette, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import SectionHeader from "../_components/SectionHeader";

// Supabase action imports - uncomment to use
// import { upsertGeneralSettingSupabase, fetchGeneralSettings } from "@/components/settings/_actions/general_supabase";
// import { useAction } from "@/hooks/use-action";

const generalSchema = z.object({
  hospitalName: z.string().optional(),
  hospitalCode: z.string().optional(),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  timezone: z.string().optional(),
  language: z.string().optional(),
  dateFormat: z.string().optional(),
  timeFormat: z.string().optional(),
});

// Temporary user ID - replace with actual auth user ID when auth is implemented
const TEMP_USER_ID = "temp-user-123";

export function GeneralSettings() {
  const { theme, setTheme } = useTheme();

  // Supabase action hook - uncomment to use
  // const { execute: saveToSupabase, isLoading } = useAction(upsertGeneralSettingSupabase, {
  //   onSuccess: (data) => {
  //     console.log("Saved to Supabase:", data);
  //   },
  //   onError: (error) => {
  //     console.error("Supabase save error:", error);
  //   }
  // });

  const form = useForm({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      hospitalName: "City General Hospital",
      hospitalCode: "CGH-001",
      contactEmail: "admin@citygeneral.com",
      contactPhone: "+1 (555) 123-4567",
      website: "https://citygeneral.com",
      timezone: "America/New_York",
      language: "en",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
    },
  });

  const onSubmit = async (data) => {
    const toastId = toast.loading("Saving general settings...");
    try {
      console.log("General settings:", data);

      // === SUPABASE SAVE - Uncomment to enable ===
      // await saveToSupabase({
      //   userId: TEMP_USER_ID,
      //   formData: {
      //     hospitalName: data.hospitalName,
      //     hospitalCode: data.hospitalCode,
      //     contactEmail: data.contactEmail,
      //     contactPhone: data.contactPhone,
      //     website: data.website,
      //     timezone: data.timezone,
      //     language: data.language,
      //     dateFormat: data.dateFormat,
      //     timeFormat: data.timeFormat,
      //     theme: theme,
      //   }
      // });
      // ============================================

      // Simulate server action delay (remove when using Supabase)
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("General settings saved successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to save settings", { id: toastId });
    }
  };

  return (
    <div className="flex flex-col h-full">

      <ScrollArea className="flex-1  h-[60vh] p-4">
        <div className="space-y-8">
          {/* Theme Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Palette className="h-4 w-4" />
              <span className="text-sm font-medium">Appearance</span>
            </div>

            <div className="space-y-3">
              <Label className="text-muted-foreground">Theme</Label>
              <RadioGroup
                value={theme}
                onValueChange={setTheme}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                    <Sun className="h-4 w-4" />
                    Light
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                    <Moon className="h-4 w-4" />
                    Dark
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                    <Monitor className="h-4 w-4" />
                    System
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Hospital Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Hospital Information</span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="hospitalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hospital Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hospitalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hospital Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Localization */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm font-medium">Localization</span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="America/New_York">Eastern Time (UTC-5)</SelectItem>
                            <SelectItem value="America/Chicago">Central Time (UTC-6)</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time (UTC-7)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time (UTC-8)</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="de">Deutsch</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="dateFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Format</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="timeFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Format</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                            <SelectItem value="24h">24 Hour</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        </div>
      </ScrollArea>
    </div>
  );
}