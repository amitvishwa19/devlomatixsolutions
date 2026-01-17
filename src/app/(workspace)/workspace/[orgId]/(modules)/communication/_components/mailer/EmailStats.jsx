import { Card, CardContent } from "@/components/ui/card";
import { Send, CheckCircle2, AlertCircle, Clock } from "lucide-react";

const stats = [
    {
        label: "Sent Today",
        value: 24,
        icon: Send,
        color: "text-primary",
        bgColor: "bg-primary/10",
    },
    {
        label: "Delivered",
        value: 156,
        icon: CheckCircle2,
        color: "text-success",
        bgColor: "bg-success/10",
    },
    {
        label: "Pending",
        value: 8,
        icon: Clock,
        color: "text-warning",
        bgColor: "bg-warning/10",
    },
    {
        label: "Failed",
        value: 2,
        icon: AlertCircle,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
    },
];

export const EmailStats = () => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
                <Card key={stat.label} className="border">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-display">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
