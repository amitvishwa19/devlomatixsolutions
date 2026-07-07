"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, Mail, Eye, EyeOff, ChevronRight, Loader2, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { saveEcommerceConfig, testConnection } from "../_actions";
import { useEcomm } from "../../_contexts/EcommProvider";
import axios from "@/utils/axios";
import { set } from "date-fns";
import { symmetricDecrypt } from "@/lib/encryption";

const Toggle = ({ checked, onChange }) => (
    <Button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? "bg-gold" : "bg-secondary border border-border"}`}
    >
        <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background shadow transition-transform ${checked ? "translate-x-5" : ""}`}
        />
    </Button>
);

const Row = ({ title, desc, right, danger }) => (
    <div className="flex items-center justify-between gap-4 py-3">
        <div>
            <p className={`text-sm font-medium ${danger ? "text-destructive" : ""}`}>
                {title}
            </p>
            {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
        </div>
        {right}
    </div>
);

const SettingsCard = ({ icon: Icon, title, children }) => (
    <div className="border border-border rounded-xl p-5 bg-secondary/30">
        <div className="flex items-center gap-2 mb-3">
            <Icon className="w-4 h-4 text-gold" />
            <h3 className="font-serif text-base">{title}</h3>
        </div>
        <div className="divide-y divide-border">{children}</div>
    </div>
);

const SettingsSection = () => {
    const { data: session } = useSession();
    const [prefs, setPrefs] = useState({
        email: true,
        sms: false,
        orders: true,
        promo: false,
        newsletter: true,
    });

    const { appConfig,appIdentifier } = useEcomm()



    const [api, setApi] = useState({
        storeName: appConfig?.storeName || "",
        storeId: appConfig?.storeId || "",
        webhookUrl: appConfig?.webhookUrl || "",
        apiKey: appConfig?.apiKey || "",
        appIdentifier: appConfig?.appIdentifier || appIdentifier,
    });
    const [errors, setErrors] = useState({});
    const [showKey, setShowKey] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false)
    const testUrl = `${api.webhookUrl}/test`;
    const saveUrl = `${api.webhookUrl}/config`;

    const handleChange = (field, value) => {
        setApi((prev) => ({ ...prev, [field]: value === undefined ? "" : value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const validateApiConfig = () => {
        const newErrors = {};
        if (!api.storeName?.trim()) {
            newErrors.storeName = "Store Name is required";
        }
        if (!api.storeId?.trim()) {
            newErrors.storeId = "Store ID is required";
        }
        if (!api.webhookUrl?.trim()) {
            newErrors.webhookUrl = "Webhook URL is required";
        } else {
            try {
                new URL(api.webhookUrl);
            } catch {
                newErrors.webhookUrl = "Please enter a valid URL";
            }
        }
        if (!api.apiKey?.trim()) {
            newErrors.apiKey = "API Key is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveApiConfig = async () => {
        if (!validateApiConfig()) {
            toast.error("Please fill all required fields");
            return;
        }
        setSaving(true);
        try {

            console.log(api)

            const res = await axios.post(saveUrl, {...api,})
            console.log('Save Configuration Response:', res);

            if(res.status===202){
                toast.success("Configuration saved successfully!");
            }
           
          
        } catch (error) {
            toast.error("An error occurred while saving");
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        setLoading(true);
        console.log('api' ,testUrl,api)
        try {
            const res = await axios.post(testUrl, api)
            console.log('Test Connection Response:', res);

            if(res.status===404){
                toast.error("Test endpoint not found. Please ensure your webhook URL is correct and the server is configured to handle test requests.");
            }

            if(res.status===202){
                toast.success("Connection test successful!");
            }

        } catch (error) {
            console.log(error)
            toast.error("Test endpoint not found. Please ensure your webhook URL is correct and the server is configured to handle test requests.");
        } finally {
            setLoading(false)
        }
    };

    return (
        <>
            <div className="mb-6">
                <h2 className="font-serif text-2xl">Account Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Customize your preferences
                </p>
            </div>

            <div className="space-y-5 max-w-3xl">

                <SettingsCard icon={Bell} title="API Configuration">
                    <div className="py-3 space-y-4">


                        <div className="space-y-2">
                            <Label className="text-xs">Store Name *</Label>
                            <Input
                                value={api.storeName}
                                onChange={(e) => handleChange("storeName", e.target.value)}
                                placeholder="My Crystal Store"
                                className={`bg-background border ${errors.storeName ? "border-destructive" : "border-border"}`}
                            />
                            {errors.storeName && (
                                <p className="text-xs text-destructive">{errors.storeName}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">Store ID *</Label>
                            <Input
                                value={api.storeId}
                                onChange={(e) => handleChange("storeId", e.target.value)}
                                placeholder="my-store-id"
                                className={`bg-background border ${errors.storeId ? "border-destructive" : "border-border"}`}
                            />
                            {errors.storeId && (
                                <p className="text-xs text-destructive">{errors.storeId}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">Webhook URL *</Label>
                            <Input
                                value={api.webhookUrl}
                                onChange={(e) => handleChange("webhookUrl", e.target.value)}
                                placeholder="https://your-app.com/webhook"
                                className={`bg-background border ${errors.webhookUrl ? "border-destructive" : "border-border"}`}
                            />
                            {errors.webhookUrl && (
                                <p className="text-xs text-destructive">{errors.webhookUrl}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">API Key *</Label>
                            <div className="relative">
                                <Input
                                    type={showKey ? "text" : "password"}
                                    value={api.apiKey}
                                    onChange={(e) => handleChange("apiKey", e.target.value)}
                                    placeholder="Enter your API key"
                                    className={`bg-background border pr-10 ${errors.apiKey ? "border-destructive" : "border-border"}`}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showKey ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                            {errors.apiKey && (
                                <p className="text-xs text-destructive">{errors.apiKey}</p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-1">
                            <Button
                                onClick={handleSaveApiConfig}
                                disabled={saving}
                                className="gap-2"
                            >
                                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                {saving ? "Saving..." : "Save Settings"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => { handleTestConnection() }}
                                disabled={loading}
                            >
                                {loading && <Loader className="w-4 h-4 animate-spin mr-2" />}
                                Test Connection
                            </Button>
                        </div>


                    </div>
                </SettingsCard>
            </div>
        </>
    );
};

export default SettingsSection;
