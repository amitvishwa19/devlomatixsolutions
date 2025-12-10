import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";




export function AdminSetupStep({
    data,
    updateData,
    onNext,
    onPrev,
}) {
    const [showPassword, setShowPassword] = useState(false);

    const isValid =
        data.adminName &&
        data.adminEmail &&
        data.adminPassword &&
        data.adminPassword.length >= 8;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-foreground mb-1">
                    Administrator Account
                </h3>
                <p className="text-sm text-muted-foreground">
                    Create the primary administrator account for the system
                </p>
            </div>

            <div className="bg-accent/50 rounded-lg p-4 border border-accent">
                <p className="text-sm text-accent-foreground">
                    <strong>Note:</strong> This account will have full access to all system
                    features and settings.
                </p>
            </div>

            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="adminName" className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        Full Name
                    </Label>
                    <Input
                        id="adminName"
                        placeholder="Enter administrator name"
                        value={data.adminName}
                        onChange={(e) => updateData({ adminName: e.target.value })}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="adminEmail" className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        Email Address
                    </Label>
                    <Input
                        id="adminEmail"
                        type="email"
                        placeholder="admin@hospital.com"
                        value={data.adminEmail}
                        onChange={(e) => updateData({ adminEmail: e.target.value })}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="adminPassword" className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary" />
                        Password
                    </Label>
                    <div className="relative">
                        <Input
                            id="adminPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Minimum 8 characters"
                            value={data.adminPassword}
                            onChange={(e) => updateData({ adminPassword: e.target.value })}
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    {data.adminPassword && data.adminPassword.length < 8 && (
                        <p className="text-xs text-destructive">
                            Password must be at least 8 characters
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onPrev} size="lg">
                    Back
                </Button>
                <Button onClick={onNext} disabled={!isValid} size="lg">
                    Continue
                </Button>
            </div>
        </div>
    );
}
