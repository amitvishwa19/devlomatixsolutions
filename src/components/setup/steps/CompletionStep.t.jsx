import { CheckCircle2, Building2, User, Stethoscope, Sparkles, Clock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";



export function CompletionStep({
    data,
    onComplete,
    onPrev,
}) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-1">
                    Setup Complete!
                </h3>
                <p className="text-sm text-muted-foreground">
                    Your hospital management system is ready to use
                </p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 space-y-4 max-h-[280px] overflow-y-auto">
                <h4 className="font-medium text-foreground text-sm">Configuration Summary</h4>

                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">{data.hospitalName}</p>
                            <p className="text-xs text-muted-foreground">{data.hospitalType}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">{data.adminName}</p>
                            <p className="text-xs text-muted-foreground">{data.adminEmail}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Stethoscope className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {data.departments.length} Departments
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {data.departments.slice(0, 4).join(", ")}
                                {data.departments.length > 4 && ` +${data.departments.length - 4} more`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {data.openTime} - {data.closeTime}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {data.appointmentDuration} min appointments • {data.timezone}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Settings className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {data.currency} Currency
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {[
                                    data.emailNotifications && "Email",
                                    data.smsNotifications && "SMS",
                                    data.autoBackup && "Auto-backup",
                                ]
                                    .filter(Boolean)
                                    .join(" • ") || "No notifications enabled"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">What's Next?</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1.5 ml-6">
                    <li>• Add doctors and staff members</li>
                    <li>• Configure appointment schedules</li>
                    <li>• Set up patient registration workflows</li>
                    <li>• Customize system preferences</li>
                </ul>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onPrev} size="lg">
                    Back
                </Button>
                <Button onClick={onComplete} size="lg" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Launch Dashboard
                </Button>
            </div>
        </div>
    );
}
