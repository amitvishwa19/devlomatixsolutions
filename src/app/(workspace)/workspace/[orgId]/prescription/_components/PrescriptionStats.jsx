import { DollarSign, Clock, AlertTriangle, CheckCircle, IndianRupee } from 'lucide-react';
import { Card } from '@/components/ui/card';



export function PrescriptionStats({ prescriptions }) {


    const stats = [
        {
            label: 'Prscriptions',
            value: `${prescriptions?.length}`,
            icon: IndianRupee,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
        },
        {
            label: 'Dispensed',
            value: `${prescriptions?.filter(pris => pris?.status === 'dispensed')?.length}`,
            icon: CheckCircle,
            color: 'text-success',
            bgColor: 'bg-success/10',
        },
        {
            label: 'Pending',
            value: `${prescriptions?.filter(pris => pris?.status === 'cancelled')?.length}`,
            icon: Clock,
            color: 'text-warning',
            bgColor: 'bg-warning/10',
        },
        {
            label: 'Draft',
            value: `${prescriptions?.filter(pris => pris?.status === 'draft')?.length}`,
            icon: AlertTriangle,
            color: 'text-destructive',
            bgColor: 'bg-destructive/10',
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card
                    key={stat.label}
                    className="p-5 shadow-card animate-fade-in border rounded-lg"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <div className="flex items-center gap-4">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bgColor}`}>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                            <p className="text-xl font-bold text-foreground">{stat.value}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
