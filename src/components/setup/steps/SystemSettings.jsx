import { Clock, DollarSign, Bell, Globe, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";


const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
];

const timezones = [
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "America/Chicago",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Asia/Kolkata",
    "Asia/Dubai",
    "Australia/Sydney",
];

const appointmentDurations = [
    { value: "15", label: "15 minutes" },
    { value: "20", label: "20 minutes" },
    { value: "30", label: "30 minutes" },
    { value: "45", label: "45 minutes" },
    { value: "60", label: "1 hour" },
];

export function SystemSettingsStep({ data, updateData, onNext, onPrev, }) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-foreground mb-1">
                    System Settings
                </h3>
                <p className="text-sm text-muted-foreground">
                    Configure operational preferences for your hospital
                </p>
            </div>

            <div className="grid gap-5">
                {/* Working Hours */}
                <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        Working Hours
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="openTime" className="text-xs text-muted-foreground mb-1.5 block">
                                Opening Time
                            </Label>
                            <Input
                                id="openTime"
                                type="time"
                                value={data.openTime}
                                onChange={(e) => updateData({ openTime: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="closeTime" className="text-xs text-muted-foreground mb-1.5 block">
                                Closing Time
                            </Label>
                            <Input
                                id="closeTime"
                                type="time"
                                value={data.closeTime}
                                onChange={(e) => updateData({ closeTime: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Appointment Duration */}
                <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        Default Appointment Duration
                    </Label>
                    <Select
                        value={data.appointmentDuration}
                        onValueChange={(value) => updateData({ appointmentDuration: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                            {appointmentDurations.map((duration) => (
                                <SelectItem key={duration.value} value={duration.value}>
                                    {duration.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Timezone & Currency Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-primary" />
                            Timezone
                        </Label>
                        <Select
                            value={data.timezone}
                            onValueChange={(value) => updateData({ timezone: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                                {timezones.map((tz) => (
                                    <SelectItem key={tz} value={tz}>
                                        {tz.replace("_", " ")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-primary" />
                            Currency
                        </Label>
                        <Select
                            value={data.currency}
                            onValueChange={(value) => updateData({ currency: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                {currencies.map((currency) => (
                                    <SelectItem key={currency.code} value={currency.code}>
                                        {currency.symbol} {currency.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Notification Preferences */}
                <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-primary" />
                        Notification Preferences
                    </Label>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-foreground">Email Notifications</p>
                                <p className="text-xs text-muted-foreground">Send email alerts for appointments</p>
                            </div>
                            <Switch
                                checked={data.emailNotifications}
                                onCheckedChange={(checked) => updateData({ emailNotifications: checked })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-foreground">SMS Reminders</p>
                                <p className="text-xs text-muted-foreground">Send SMS reminders to patients</p>
                            </div>
                            <Switch
                                checked={data.smsNotifications}
                                onCheckedChange={(checked) => updateData({ smsNotifications: checked })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-foreground">Auto-backup Data</p>
                                <p className="text-xs text-muted-foreground">Daily automatic data backups</p>
                            </div>
                            <Switch
                                checked={data.autoBackup}
                                onCheckedChange={(checked) => updateData({ autoBackup: checked })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onPrev} size="lg">
                    Back
                </Button>
                <Button onClick={onNext} size="lg">
                    Continue
                </Button>
            </div>
        </div>
    );
}
