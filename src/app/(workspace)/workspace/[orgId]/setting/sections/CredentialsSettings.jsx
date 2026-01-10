import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SectionHeader from "../_components/SectionHeader";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Eye, EyeOff, Plus, Trash2, KeyRound, Database, Cloud, Mail, CreditCard, Server, Lock, Webhook, MessageSquare, Phone, Globe, Shield, Cpu, HardDrive, Wifi, Key, Settings } from "lucide-react";
import { useAction } from "@/hooks/use-action";
import { upsertCredentialSettingSupabase as upsertCredentialSetting, deleteCredentialSettingSupabase as deleteCredentialSetting } from "../_actions/credentials_supabase";

const credentialSchema = z.object({
    name: z.string().min(1, "Name is required"),
    key: z.string().min(1, "Key is required"),
    value: z.string().min(1, "Value is required"),
    type: z.string().optional(),
    customType: z.string().optional(),
});

const initialCredentials = [
    { id: "1", name: "Database URL", key: "DATABASE_URL", value: "postgresql://user:pass@localhost:5432/db", type: "database", icon: Database },
    { id: "2", name: "Supabase Key", key: "SUPABASE_KEY", value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", type: "api", icon: Cloud },
    { id: "3", name: "SMTP Password", key: "SMTP_PASSWORD", value: "smtp_secret_password", type: "email", icon: Mail },
    { id: "4", name: "Stripe Secret", key: "STRIPE_SECRET_KEY", value: "sk_test_...", type: "payment", icon: CreditCard },
];

const credentialTypes = [
    { value: "api", label: "API Key", icon: Cloud },
    { value: "database", label: "Database", icon: Database },
    { value: "email", label: "Email/SMTP", icon: Mail },
    { value: "payment", label: "Payment Gateway", icon: CreditCard },
    { value: "server", label: "Server", icon: Server },
    { value: "oauth", label: "OAuth/SSO", icon: Lock },
    { value: "webhook", label: "Webhook", icon: Webhook },
    { value: "messaging", label: "Messaging/Chat", icon: MessageSquare },
    { value: "sms", label: "SMS/Phone", icon: Phone },
    { value: "cdn", label: "CDN/Storage", icon: HardDrive },
    { value: "analytics", label: "Analytics", icon: Globe },
    { value: "security", label: "Security/Auth", icon: Shield },
    { value: "ai", label: "AI/ML Service", icon: Cpu },
    { value: "iot", label: "IoT/Hardware", icon: Wifi },
    { value: "encryption", label: "Encryption Key", icon: Key },
    { value: "config", label: "Configuration", icon: Settings },
    { value: "custom", label: "Custom Type...", icon: KeyRound },
];

export function CredentialsSettings() {
    const [credentials, setCredentials] = useState(initialCredentials);
    const [showValues, setShowValues] = useState({});
    const [isAdding, setIsAdding] = useState(false);
    const [showCustomType, setShowCustomType] = useState(false);

    // Server action hooks
    const { execute: executeUpsert, isLoading: isUpserting } = useAction(upsertCredentialSetting, {
        onSuccess: (data) => {
            console.log("Credential saved:", data);
            toast.success("Credential saved successfully");
        },
        onError: (error) => {
            console.error("Error saving credential:", error);
            toast.error("Failed to save credential");
        },
    });

    const { execute: executeDelete, isLoading: isDeleting } = useAction(deleteCredentialSetting, {
        onSuccess: () => {
            toast.success("Credential deleted");
        },
        onError: (error) => {
            console.error("Error deleting credential:", error);
            toast.error("Failed to delete credential");
        },
    });

    const form = useForm({
        resolver: zodResolver(credentialSchema),
        defaultValues: {
            name: "",
            key: "",
            value: "",
            type: "api",
            customType: "",
        },
    });

    const watchType = form.watch("type");

    const handleTypeChange = (value) => {
        form.setValue("type", value);
        setShowCustomType(value === "custom");
        if (value !== "custom") {
            form.setValue("customType", "");
        }
    };

    const toggleVisibility = (id) => {
        setShowValues((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDelete = async (id, serviceName) => {
        // Remove from local state
        setCredentials((prev) => prev.filter((cred) => cred.id !== id));

        // Call server action (uncomment when using with real userId)
        // const userId = "current-user-id"; // Replace with actual user ID
        // await executeDelete({ userId, serviceName });
        toast.success("Credential deleted");
    };

    const onSubmit = async (data) => {
        const actualType = data.type === "custom" ? data.customType || "custom" : data.type;
        const typeInfo = credentialTypes.find((t) => t.value === data.type);
        const newCredential = {
            id: Date.now().toString(),
            name: data.name,
            key: data.key,
            value: data.value,
            type: actualType,
            icon: typeInfo?.icon || KeyRound,
        };

        setCredentials((prev) => [...prev, newCredential]);

        // Call server action (uncomment when using with real userId)
        // const userId = "current-user-id"; // Replace with actual user ID
        // await executeUpsert({
        //   userId,
        //   formData: {
        //     serviceName: data.key,
        //     apiKey: data.value,
        //     // Add other fields as needed based on type
        //   },
        // });

        form.reset();
        setShowCustomType(false);
        setIsAdding(false);
        toast.success("Credential added successfully");
    };

    const handleSaveAll = async () => {
        setIsSaving(true);

        try {
            // Simulate saving all credentials
            // const userId = "current-user-id"; // Replace with actual user ID
            // for (const credential of credentials) {
            //   await executeUpsert({
            //     userId,
            //     formData: {
            //       serviceName: credential.key,
            //       apiKey: credential.value,
            //     },
            //   });
            // }

            console.log("Saving all credentials:", credentials);
            await new Promise((resolve) => setTimeout(resolve, 500));
            toast.success("All credentials saved successfully");
        } catch (error) {
            toast.error("Failed to save credentials");
        } finally {
            setIsSaving(false);
        }
    };

    const maskValue = (value) => {
        if (value.length <= 8) return "••••••••";
        return value.substring(0, 4) + "••••••••" + value.substring(value.length - 4);
    };

    const getTypeBadgeColor = (type) => {
        switch (type) {
            case "database": return "bg-blue-500/10 text-blue-500";
            case "api": return "bg-green-500/10 text-green-500";
            case "email": return "bg-purple-500/10 text-purple-500";
            case "payment": return "bg-orange-500/10 text-orange-500";
            case "server": return "bg-gray-500/10 text-gray-500";
            case "oauth": return "bg-indigo-500/10 text-indigo-500";
            case "webhook": return "bg-pink-500/10 text-pink-500";
            case "messaging": return "bg-cyan-500/10 text-cyan-500";
            case "sms": return "bg-teal-500/10 text-teal-500";
            case "cdn": return "bg-amber-500/10 text-amber-500";
            case "analytics": return "bg-lime-500/10 text-lime-500";
            case "security": return "bg-red-500/10 text-red-500";
            case "ai": return "bg-violet-500/10 text-violet-500";
            case "iot": return "bg-emerald-500/10 text-emerald-500";
            case "encryption": return "bg-rose-500/10 text-rose-500";
            case "config": return "bg-slate-500/10 text-slate-500";
            default: return "bg-muted text-muted-foreground";
        }
    };

    return (
        <div className="flex flex-col h-full">
            <SectionHeader
                title="Credentials"
                description="Manage API keys, secrets, and environment variables"
                onSave={handleSaveAll}
                isSaving={isSaving || isUpserting}
            />

            <ScrollArea className="flex-1  h-[60vh] p-4">
                <div className="space-y-4">
                    {/* Add Credential Button */}
                    <div className="flex justify-end">
                        <Button onClick={() => setIsAdding(!isAdding)} size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Credential
                        </Button>
                    </div>

                    {isAdding && (
                        <Card className="border-dashed border-primary/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Add New Credential</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Display Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., Production API Key" {...field} className="h-8 text-sm" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="type"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Type</FormLabel>
                                                        <FormControl>
                                                            <select
                                                                value={field.value}
                                                                onChange={(e) => handleTypeChange(e.target.value)}
                                                                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                            >
                                                                {credentialTypes.map((type) => (
                                                                    <option key={type.value} value={type.value}>
                                                                        {type.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        {showCustomType && (
                                            <FormField
                                                control={form.control}
                                                name="customType"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Custom Type Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., blockchain, crm, erp..." {...field} className="h-8 text-sm" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                        <FormField
                                            control={form.control}
                                            name="key"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Environment Key</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., API_KEY" {...field} className="h-8 text-sm font-mono" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="value"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Value</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="Enter secret value" {...field} className="h-8 text-sm" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex gap-2 pt-2">
                                            <Button type="submit" size="sm" disabled={isUpserting}>
                                                {isUpserting ? "Saving..." : "Save Credential"}
                                            </Button>
                                            <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-3">
                        {credentials.map((credential) => {
                            const Icon = credential.icon || KeyRound;
                            return (
                                <Card key={credential.id} className="overflow-hidden">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className="p-2 rounded-md bg-muted shrink-0">
                                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-sm truncate">{credential.name}</span>
                                                        <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${getTypeBadgeColor(credential.type)}`}>
                                                            {credential.type}
                                                        </Badge>
                                                    </div>
                                                    <code className="text-xs text-muted-foreground font-mono block mb-2">
                                                        {credential.key}
                                                    </code>
                                                    <div className="flex items-center gap-2">
                                                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono flex-1 truncate">
                                                            {showValues[credential.id] ? credential.value : maskValue(credential.value)}
                                                        </code>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 shrink-0"
                                                            onClick={() => toggleVisibility(credential.id)}
                                                        >
                                                            {showValues[credential.id] ? (
                                                                <EyeOff className="h-3 w-3" />
                                                            ) : (
                                                                <Eye className="h-3 w-3" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                                                onClick={() => handleDelete(credential.id, credential.key)}
                                                disabled={isDeleting}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {credentials.length === 0 && !isAdding && (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                                <KeyRound className="h-10 w-10 text-muted-foreground mb-3" />
                                <CardTitle className="text-sm mb-1">No Credentials</CardTitle>
                                <CardDescription className="text-xs">
                                    Add your first credential to get started
                                </CardDescription>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
