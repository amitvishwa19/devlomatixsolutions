import { SettingsSection } from "../SettingsSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { integrationSchema } from "../../_types/settings";
import { toast } from "@/hooks/use-toast";
import { Check, ExternalLink, Settings2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const integrations = [
  {
    id: "ehr",
    name: "Electronic Health Records",
    description: "Connect to your EHR system for seamless data sync",
    icon: "🏥",
    connected: true,
    syncFrequency: "realtime",
    lastSync: "2 minutes ago",
  },
  {
    id: "lab",
    name: "Laboratory Systems",
    description: "Integrate with lab systems for test results",
    icon: "🔬",
    connected: true,
    syncFrequency: "hourly",
    lastSync: "45 minutes ago",
  },
  {
    id: "pharmacy",
    name: "Pharmacy Network",
    description: "Direct prescription sending to pharmacies",
    icon: "💊",
    connected: false,
    syncFrequency: "realtime",
    lastSync: null,
  },
  {
    id: "insurance",
    name: "Insurance Providers",
    description: "Real-time insurance verification and claims",
    icon: "🛡️",
    connected: true,
    syncFrequency: "realtime",
    lastSync: "Just now",
  },
  {
    id: "telehealth",
    name: "Telehealth Platform",
    description: "Video consultations and remote care",
    icon: "📹",
    connected: false,
    syncFrequency: "realtime",
    lastSync: null,
  },
  {
    id: "analytics",
    name: "Analytics Dashboard",
    description: "Advanced reporting and insights",
    icon: "📊",
    connected: false,
    syncFrequency: "daily",
    lastSync: null,
  },
  {
    id: "imaging",
    name: "Medical Imaging (PACS)",
    description: "Connect to PACS for radiology images",
    icon: "🩻",
    connected: true,
    syncFrequency: "realtime",
    lastSync: "5 minutes ago",
  },
  {
    id: "billing",
    name: "External Billing System",
    description: "Sync with third-party billing software",
    icon: "💳",
    connected: false,
    syncFrequency: "hourly",
    lastSync: null,
  },
  {
    id: "hr",
    name: "HR & Payroll System",
    description: "Staff management and payroll integration",
    icon: "👥",
    connected: true,
    syncFrequency: "daily",
    lastSync: "1 hour ago",
  },
  {
    id: "inventory",
    name: "Inventory Management",
    description: "Track medical supplies and equipment",
    icon: "📦",
    connected: false,
    syncFrequency: "hourly",
    lastSync: null,
  },
];

export function IntegrationSettings() {
  const [connections, setConnections] = useState(
    integrations.reduce((acc, int) => ({
      ...acc,
      [int.id]: {
        connected: int.connected,
        syncFrequency: int.syncFrequency,
        lastSync: int.lastSync
      }
    }), {})
  );
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  const form = useForm({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      id: "",
      name: "",
      apiKey: "",
      webhookUrl: "",
      enabled: true,
      syncFrequency: "realtime",
    },
  });

  const toggleConnection = (id) => {
    setConnections({
      ...connections,
      [id]: {
        ...connections[id],
        connected: !connections[id].connected
      }
    });
    toast({
      title: connections[id].connected ? "Disconnected" : "Connected",
      description: `Integration ${connections[id].connected ? "disconnected" : "connected"} successfully.`,
    });
  };

  const openConfigDialog = (integration) => {
    setSelectedIntegration(integration);
    form.reset({
      id: integration.id,
      name: integration.name,
      apiKey: "",
      webhookUrl: "",
      enabled: connections[integration.id].connected,
      syncFrequency: connections[integration.id].syncFrequency,
    });
    setConfigDialogOpen(true);
  };

  const onSubmit = (data) => {
    console.log("Integration saved:", data);
    setConnections({
      ...connections,
      [data.id]: {
        connected: data.enabled,
        syncFrequency: data.syncFrequency || "realtime",
        lastSync: data.enabled ? "Just now" : null,
      },
    });
    toast({
      title: "Configuration Saved",
      description: "Integration settings have been updated.",
    });
    setConfigDialogOpen(false);
  };

  const syncNow = (id) => {
    toast({
      title: "Sync Started",
      description: "Data synchronization is in progress...",
    });
    setTimeout(() => {
      setConnections({
        ...connections,
        [id]: { ...connections[id], lastSync: "Just now" },
      });
      toast({
        title: "Sync Complete",
        description: "Data has been synchronized successfully.",
      });
    }, 2000);
  };

  return (
    <SettingsSection
      title="Integrations"
      description="Connect third-party services and systems"
    >
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {Object.values(connections).filter(c => c.connected).length} of {integrations.length} integrations active
        </p>
      </div>

      <div className="space-y-4">
        {integrations.map((integration) => {
          const isConnected = connections[integration.id]?.connected;
          const lastSync = connections[integration.id]?.lastSync;

          return (
            <div
              key={integration.id}
              className={cn(
                "p-5 rounded-xl border transition-all duration-200",
                isConnected
                  ? "bg-surface-2 border-primary/30"
                  : "bg-surface-2 border-border/50 hover:border-border"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-surface-3 flex items-center justify-center text-2xl">
                    {integration.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-foreground">{integration.name}</h4>
                      {isConnected && (
                        <span className="flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">
                          <Check className="h-3 w-3" />
                          Connected
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{integration.description}</p>
                    {isConnected && lastSync && (
                      <p className="text-xs text-muted-foreground mt-2">Last sync: {lastSync}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isConnected && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => syncNow(integration.id)}
                      >
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openConfigDialog(integration)}
                      >
                        <Settings2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant={isConnected ? "outline" : "default"}
                    size="sm"
                    onClick={() => isConnected ? toggleConnection(integration.id) : openConfigDialog(integration)}
                    className="gap-2"
                  >
                    {isConnected ? (
                      "Disconnect"
                    ) : (
                      <>
                        Connect
                        <ExternalLink className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedIntegration && (
                <>
                  <span className="text-2xl">{selectedIntegration.icon}</span>
                  Configure {selectedIntegration.name}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className="bg-surface-1 border-border"
                        placeholder="Enter API key"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="webhookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-surface-1 border-border"
                        placeholder="https://your-webhook-url.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="syncFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sync Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-surface-1 border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-surface-2 border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">Enable Integration</p>
                      <p className="text-xs text-muted-foreground">Activate this integration</p>
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setConfigDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Configuration
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </SettingsSection>
  );
}
