import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Plug, MessageSquare, CreditCard, Mail, Cloud, FileText, Smartphone, Loader2 } from "lucide-react";
import SectionHeader from "../_components/SectionHeader";
import { upsertCredentialSettingSupabase } from "../_actions/credentials_supabase";




const integrationsSchema = z.object({
  twilioSms: z.boolean().optional(),
  sendGridEmail: z.boolean().optional(),
  stripePayments: z.boolean().optional(),
  paypal: z.boolean().optional(),
  googleCalendar: z.boolean().optional(),
  microsoft365: z.boolean().optional(),
  slack: z.boolean().optional(),
  awsS3: z.boolean().optional(),
});

const integrations = [
  { id: "twilioSms", name: "Twilio SMS", description: "Send SMS notifications to patients", icon: Smartphone, category: "Communication", oauth: false },
  { id: "sendGridEmail", name: "SendGrid Email", description: "Email delivery service", icon: Mail, category: "Communication", oauth: false },
  { id: "stripePayments", name: "Stripe Payments", description: "Accept online payments", icon: CreditCard, category: "Payments", oauth: false },
  { id: "paypal", name: "PayPal", description: "Alternative payment gateway", icon: CreditCard, category: "Payments", oauth: false },
  { id: "googleCalendar", name: "Google Calendar", description: "Sync appointments with Google Calendar", icon: Cloud, category: "Productivity", oauth: true, provider: "google" },
  { id: "microsoft365", name: "Microsoft 365", description: "Office suite integration", icon: FileText, category: "Productivity", oauth: false },
  { id: "slack", name: "Slack", description: "Team notifications and alerts", icon: MessageSquare, category: "Communication", oauth: false },
  { id: "awsS3", name: "AWS S3", description: "Cloud storage for medical records", icon: Cloud, category: "Storage", oauth: false },
];

// Temporary user ID - replace with actual auth user ID when auth is implemented
const TEMP_USER_ID = "temp-user-123";

export function IntegrationsSettings() {
  const [connectingProvider, setConnectingProvider] = useState(null);
  const [connectedProviders, setConnectedProviders] = useState({});

  const form = useForm({
    resolver: zodResolver(integrationsSchema),
    defaultValues: {
      twilioSms: true,
      sendGridEmail: true,
      stripePayments: true,
      paypal: false,
      googleCalendar: false,
      microsoft365: false,
      slack: false,
      awsS3: true,
    },
  });

  const handleGoogleConnect = async (integrationId) => {
    setConnectingProvider(integrationId);
    const toastId = toast.loading("Connecting to Google...");

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;

      // The OAuth flow will redirect, so we set up a listener for when user returns
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.provider_token) {
          // Save credentials to database
          const credentialData = {
            userId: TEMP_USER_ID,
            formData: {
              serviceName: 'Google Calendar',
              accessToken: session.provider_token,
              refreshToken: session.provider_refresh_token || '',
              isActive: true,
            },
          };

          const result = await upsertCredentialSettingSupabase(credentialData);

          if (result.data) {
            setConnectedProviders(prev => ({ ...prev, [integrationId]: true }));
            form.setValue(integrationId, true);
            toast.success("Google Calendar connected successfully!", { id: toastId });
          } else {
            toast.error("Failed to save Google credentials", { id: toastId });
          }

          subscription.unsubscribe();
        }
      });

    } catch (error) {
      console.error("Google OAuth error:", error);
      toast.error("Failed to connect to Google", { id: toastId });
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleDisconnect = async (integrationId, serviceName) => {
    const toastId = toast.loading(`Disconnecting ${serviceName}...`);

    try {
      // Sign out from OAuth provider
      await supabase.auth.signOut();

      setConnectedProviders(prev => ({ ...prev, [integrationId]: false }));
      form.setValue(integrationId, false);
      toast.success(`${serviceName} disconnected successfully`, { id: toastId });
    } catch (error) {
      console.error("Disconnect error:", error);
      toast.error(`Failed to disconnect ${serviceName}`, { id: toastId });
    }
  };

  const onSubmit = async (data) => {
    const toastId = toast.loading("Saving integration settings...");
    try {
      console.log("Integrations settings:", data);
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Integration settings saved successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to save settings", { id: toastId });
    }
  };

  const categories = [...new Set(integrations.map(i => i.category))];

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Integrations"
        description="Connect third-party services and applications"
        onSave={form.handleSubmit(onSubmit)}
      />

      <ScrollArea className="flex-1  h-[60vh] p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {categories.map(category => (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Plug className="h-4 w-4" />
                  <span className="text-sm font-medium">{category}</span>
                </div>

                <div className="space-y-3">
                  {integrations.filter(i => i.category === category).map((integration) => {
                    const IconComponent = integration.icon;
                    const fieldValue = form.watch(integration.id);
                    const isConnecting = connectingProvider === integration.id;
                    const isOAuthConnected = connectedProviders[integration.id];

                    return (
                      <FormField
                        key={integration.id}
                        control={form.control}
                        name={integration.id}
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                            <div className="flex items-center gap-4">
                              <div className="p-2 rounded-lg bg-muted">
                                <IconComponent className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <FormLabel className="text-base">{integration.name}</FormLabel>
                                  <Badge variant={fieldValue || isOAuthConnected ? "default" : "secondary"}>
                                    {fieldValue || isOAuthConnected ? "Connected" : "Not Connected"}
                                  </Badge>
                                </div>
                                <FormDescription>{integration.description}</FormDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {integration.oauth ? (
                                <>
                                  {isOAuthConnected || fieldValue ? (
                                    <>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDisconnect(integration.id, integration.name)}
                                      >
                                        Disconnect
                                      </Button>
                                      <Button type="button" variant="outline" size="sm">
                                        Configure
                                      </Button>
                                    </>
                                  ) : (
                                    <Button
                                      type="button"
                                      variant="default"
                                      size="sm"
                                      onClick={() => handleGoogleConnect(integration.id)}
                                      disabled={isConnecting}
                                      className="gap-2"
                                    >
                                      {isConnecting ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                          Connecting...
                                        </>
                                      ) : (
                                        <>
                                          <svg className="h-4 w-4" viewBox="0 0 24 24">
                                            <path
                                              fill="currentColor"
                                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                              fill="currentColor"
                                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                              fill="currentColor"
                                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            />
                                            <path
                                              fill="currentColor"
                                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                          </svg>
                                          Connect with Google
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </>
                              ) : (
                                <>
                                  {fieldValue && (
                                    <Button type="button" variant="outline" size="sm">
                                      Configure
                                    </Button>
                                  )}
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </>
                              )}
                            </div>
                          </FormItem>
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </form>
        </Form>
      </ScrollArea>
    </div>
  );
}