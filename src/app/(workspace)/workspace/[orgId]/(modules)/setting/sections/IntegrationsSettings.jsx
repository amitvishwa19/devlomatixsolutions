"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormDescription, FormControl, } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleTrigger, CollapsibleContent, } from "@/components/ui/collapsible";
import { Plug, Smartphone, Mail, CreditCard, Cloud, FileText, MessageSquare, ChevronDown, Check, Calendar, Settings2, Link, Loader, } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import SectionHeader from "../_components/SectionHeader";
import { upsertGeneralSetting } from "../_actions";
import { useAction } from "@/hooks/use-action";
import { useAppSettings } from "@/app/(workspace)/workspace/_provider/WorkspaceProvider";


// Unified integration schema
const integrationSchema = z.object({
    twilio: z.object({
        accountSid: z.string().min(1, "Account SID is required"),
        authToken: z.string().min(1, "Auth Token is required"),
        phoneNumber: z.string().min(1, "Phone Number is required").regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
    }).optional(),
    sendgrid: z.object({
        apiKey: z.string().min(1, "API Key is required"),
        fromEmail: z.string().email("Invalid email address"),
    }).optional(),
    gmail: z.object({
        clientId: z.string().min(1, "Client ID is required"),
        clientSecret: z.string().min(1, "Client Secret is required"),
    }).optional(),
    slack: z.object({
        webhookUrl: z.string().url("Invalid URL format").min(1, "Webhook URL is required"),
        channel: z.string().min(1, "Channel is required"),
    }).optional(),
    stripe: z.object({
        publishableKey: z.string().min(1, "Publishable Key is required").startsWith("pk_", "Must start with pk_"),
        secretKey: z.string().min(1, "Secret Key is required").startsWith("sk_", "Must start with sk_"),
        webhookSecret: z.string().min(1, "Webhook Secret is required").startsWith("whsec_", "Must start with whsec_"),
    }).optional(),
    paypal: z.object({
        clientId: z.string().min(1, "Client ID is required"),
        clientSecret: z.string().min(1, "Client Secret is required"),
    }).optional(),
    razorpay: z.object({
        keyId: z.string().min(1, "Key ID is required").startsWith("rzp_", "Must start with rzp_"),
        keySecret: z.string().min(1, "Key Secret is required"),
    }).optional(),
    google_calendar: z.object({
        calendarId: z.string().min(1, "Calendar ID is required"),
    }).optional(),
    microsoft365: z.object({
        tenantId: z.string().min(1, "Tenant ID is required"),
        clientId: z.string().min(1, "Client ID is required"),
    }).optional(),
    aws_s3: z.object({
        accessKeyId: z.string().min(1, "Access Key ID is required"),
        secretAccessKey: z.string().min(1, "Secret Access Key is required"),
        bucketName: z.string().min(1, "Bucket Name is required"),
        region: z.string().min(1, "Region is required"),
    }).optional(),
});

// Icon mapping
const iconMap = {
    twilio: MessageSquare,
    sendgrid: Mail,
    gmail: Mail,
    slack: MessageSquare,
    stripe: CreditCard,
    paypal: CreditCard,
    razorpay: CreditCard,
    google_calendar: Calendar,
    microsoft365: FileText,
    aws_s3: Cloud,
};

// Configuration fields for each integration
const configFields = {
    twilio: [
        { key: "accountSid", label: "Account SID", placeholder: "Enter your Twilio Account SID", type: "text" },
        { key: "authToken", label: "Auth Token", placeholder: "Enter your Auth Token", type: "password" },
        { key: "phoneNumber", label: "Phone Number", placeholder: "+1234567890", type: "text" },
    ],
    sendgrid: [
        { key: "apiKey", label: "API Key", placeholder: "Enter your SendGrid API Key", type: "password" },
        { key: "fromEmail", label: "From Email", placeholder: "noreply@example.com", type: "email" },
    ],
    gmail: [
        { key: "clientId", label: "Client ID", placeholder: "Enter your Google Client ID", type: "text" },
        { key: "clientSecret", label: "Client Secret", placeholder: "Enter your Client Secret", type: "password" },
    ],
    slack: [
        { key: "webhookUrl", label: "Webhook URL", placeholder: "https://hooks.slack.com/...", type: "url" },
        { key: "channel", label: "Channel", placeholder: "#notifications", type: "text" },
    ],
    stripe: [
        { key: "publishableKey", label: "Publishable Key", placeholder: "pk_live_...", type: "text" },
        { key: "secretKey", label: "Secret Key", placeholder: "sk_live_...", type: "password" },
        { key: "webhookSecret", label: "Webhook Secret", placeholder: "whsec_...", type: "password" },
    ],
    paypal: [
        { key: "clientId", label: "Client ID", placeholder: "Enter your PayPal Client ID", type: "text" },
        { key: "clientSecret", label: "Client Secret", placeholder: "Enter your Client Secret", type: "password" },
    ],
    razorpay: [
        { key: "keyId", label: "Key ID", placeholder: "rzp_live_...", type: "text" },
        { key: "keySecret", label: "Key Secret", placeholder: "Enter your Key Secret", type: "password" },
    ],
    google_calendar: [
        { key: "calendarId", label: "Calendar ID", placeholder: "primary", type: "text" },
    ],
    microsoft365: [
        { key: "tenantId", label: "Tenant ID", placeholder: "Enter your Microsoft Tenant ID", type: "text" },
        { key: "clientId", label: "Client ID", placeholder: "Enter your Client ID", type: "text" },
    ],
    aws_s3: [
        { key: "accessKeyId", label: "Access Key ID", placeholder: "Enter your AWS Access Key", type: "text" },
        { key: "secretAccessKey", label: "Secret Access Key", placeholder: "Enter your Secret Key", type: "password" },
        { key: "bucketName", label: "Bucket Name", placeholder: "my-bucket", type: "text" },
        { key: "region", label: "Region", placeholder: "us-east-1", type: "text" },
    ],
};

const initialIntegrations = [
    // Communication
    {
        id: "twilio",
        name: "Twilio SMS",
        description: "Send SMS notifications to patients",
        category: "communication",
        isConnected: true,
        icon: "twilio",
        configurable: true,
    },
    {
        id: "sendgrid",
        name: "SendGrid Email",
        description: "Email delivery service",
        category: "communication",
        isConnected: true,
        icon: "sendgrid",
        configurable: true,
    },
    {
        id: "gmail",
        name: "Gmail",
        description: "Send emails via Gmail API",
        category: "communication",
        isConnected: false,
        icon: "gmail",
        configurable: true,
    },
    {
        id: "slack",
        name: "Slack",
        description: "Team notifications and alerts",
        category: "communication",
        isConnected: false,
        icon: "slack",
        configurable: true,
    },
    // Payments
    {
        id: "stripe",
        name: "Stripe Payments",
        description: "Accept online payments",
        category: "payments",
        isConnected: true,
        icon: "stripe",
        configurable: true,
    },
    {
        id: "paypal",
        name: "PayPal",
        description: "Alternative payment gateway",
        category: "payments",
        isConnected: false,
        icon: "paypal",
        configurable: true,
    },
    {
        id: "razorpay",
        name: "Razorpay",
        description: "Payment gateway for India",
        category: "payments",
        isConnected: false,
        icon: "razorpay",
        configurable: true,
    },
    // Productivity
    {
        id: "google_calendar",
        name: "Google Calendar",
        description: "Sync appointments with Google Calendar",
        category: "productivity",
        isConnected: false,
        icon: "google_calendar",
        configurable: true,
    },
    {
        id: "microsoft365",
        name: "Microsoft 365",
        description: "Office suite integration",
        category: "productivity",
        isConnected: false,
        icon: "microsoft365",
        configurable: true,
    },
    // Storage
    {
        id: "aws_s3",
        name: "AWS S3",
        description: "Cloud storage for medical records",
        category: "storage",
        isConnected: true,
        icon: "aws_s3",
        configurable: true,
    },
];

const categoryLabels = {
    communication: "Communication",
    payments: "Payments",
    productivity: "Productivity",
    storage: "Storage",
};


export function IntegrationsSettings() {
    const [loading, setLoading] = useState(false)
    const [integrations, setIntegrations] = useState(initialIntegrations);
    const [configs, setConfigs] = useState({});

    const handleConnectWithLoading = async (id, config) => {
        // Validate first
        const schemaShape = integrationSchema.shape[id];
        if (schemaShape) {
            const result = schemaShape.safeParse(config);
            if (!result.success) {
                const fieldErrors = {};
                result.error.errors.forEach((err) => {
                    const path = err.path[0];
                    fieldErrors[path] = err.message;
                });
                return { success: false, errors: fieldErrors };
            }
        }

        // Check if we have a server action for this integration
        const serverAction = integrationConnectFunctions[id];

        if (serverAction) {
            try {
                const result = await serverAction(config);

                if (result.success) {
                    setConfigs((prev) => ({ ...prev, [id]: config }));
                    setIntegrations((prev) =>
                        prev.map((integration) =>
                            integration.id === id ? { ...integration, isConnected: true } : integration
                        )
                    );
                    toast.success(result.message || `${id.charAt(0).toUpperCase() + id.slice(1).replace('_', ' ')} connected successfully!`);
                    return { success: true };
                } else {
                    toast.error(result.error || "Connection failed");
                    return { success: false, errors: { general: result.error } };
                }
            } catch (error) {
                console.error(`Error connecting ${id}:`, error);
                toast.error(`Failed to connect ${id}`);
                return { success: false, errors: { general: error.message } };
            }
        }

        // Fallback for integrations without server actions (local validation only)
        setConfigs((prev) => ({ ...prev, [id]: config }));
        setIntegrations((prev) =>
            prev.map((integration) =>
                integration.id === id ? { ...integration, isConnected: true } : integration
            )
        );
        toast.success(`${id.charAt(0).toUpperCase() + id.slice(1).replace('_', ' ')} connected successfully!`);
        return { success: true };
    };

    const handleSaveAll = () => {
        const allData = integrations.map((integration) => ({
            ...integration,
            config: configs[integration.id] || {},
        }));
        console.log("All Integrations Data:", allData);
        toast.success("All settings saved successfully");
    };

    const groupedIntegrations = integrations.reduce(
        (acc, integration) => {
            if (!acc[integration.category]) {
                acc[integration.category] = [];
            }
            acc[integration.category].push(integration);
            return acc;
        },
        {}
    );


    return (
        <div className="flex flex-col h-full">
            <SectionHeader
                title="Integrations"
                description="Connect third-party services"
                //onSave={form.handleSubmit(onSubmit)}
                onSave={handleSaveAll}
                isSaving={loading}
            />

            <ScrollArea className="h-[70vh] p-4">
                <div className="p-6 space-y-6">
                    {Object.entries(groupedIntegrations).map(([category, items]) => (
                        <div key={category} className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Settings2 className="w-4 h-4 text-primary" />
                                <h3 className="text-sm font-medium text-primary">
                                    {categoryLabels[category]}
                                </h3>
                            </div>
                            <div className="space-y-2">
                                {items.map((integration) => (
                                    <IntegrationCard
                                        key={integration.id}
                                        integration={integration}
                                        onConnectWithLoading={handleConnectWithLoading}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}



// Inline IntegrationCard component
function IntegrationCard({ integration, onConnectWithLoading }) {
    const [isOpen, setIsOpen] = useState(false);
    const [values, setValues] = useState(integration.config || {});
    const [errors, setErrors] = useState({});
    const [isConnecting, setIsConnecting] = useState(false);
    const IconComponent = iconMap[integration.id] || Cloud;
    const fields = configFields[integration.id] || [];

    const handleCardClick = () => {
        if (!isConnecting) {
            setIsOpen(!isOpen);
        }
    };

    const handleConnect = async () => {
        setIsConnecting(true);
        const result = await onConnectWithLoading(integration.id, values);
        setIsConnecting(false);
        if (!result.success && result.errors) {
            setErrors(result.errors);
            toast.error("Please fix validation errors");
        } else {
            setErrors({});
            setIsOpen(false);
        }
    };

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="bg-card rounded-lg border border-border hover:border-primary/30 transition-colors overflow-hidden">
                {/* Main Row - Clickable */}
                <div
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={handleCardClick}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{integration.name}</span>
                                {isConnecting ? (
                                    <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-xs gap-1">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Connecting
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant={integration.isConnected ? "default" : "secondary"}
                                        className={
                                            integration.isConnected
                                                ? "bg-green-500/20 text-green-600 border-green-500/30 text-xs"
                                                : "bg-secondary text-muted-foreground text-xs"
                                        }
                                    >
                                        {integration.isConnected ? "Connected" : "Not Connected"}
                                    </Badge>
                                )}
                            </div>
                            <span className="text-sm text-muted-foreground">{integration.description}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ChevronDown
                            className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                </div>

                {/* Expandable Configuration Panel */}
                <CollapsibleContent>
                    <div className="px-4 pb-4 pt-2 border-t border-border bg-secondary/30">
                        <div className="grid gap-4 sm:grid-cols-2">
                            {fields.map((field) => (
                                <div key={field.key} className="grid gap-2">
                                    <Label htmlFor={`${integration.id}-${field.key}`} className="text-sm text-foreground">
                                        {field.label}
                                    </Label>
                                    <Input
                                        id={`${integration.id}-${field.key}`}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        value={values[field.key] || ""}
                                        onChange={(e) => {
                                            setValues((prev) => ({ ...prev, [field.key]: e.target.value }));
                                            if (errors[field.key]) {
                                                setErrors((prev) => ({ ...prev, [field.key]: "" }));
                                            }
                                        }}
                                        className={`bg-card border-border text-foreground placeholder:text-muted-foreground ${errors[field.key] ? "border-destructive" : ""
                                            }`}
                                        disabled={isConnecting}
                                    />
                                    {errors[field.key] && (
                                        <span className="text-xs text-destructive">{errors[field.key]}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleConnect();
                                }}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                                disabled={isConnecting}
                            >
                                {isConnecting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <Link className="w-4 h-4" />
                                        Connect
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}