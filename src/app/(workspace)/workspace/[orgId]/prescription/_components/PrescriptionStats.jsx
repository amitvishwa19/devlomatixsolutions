import { DollarSign, Clock, AlertTriangle, CheckCircle, IndianRupee } from 'lucide-react';
import { Card } from '@/components/ui/card';



export function PrescriptionStats({ invoices }) {
    const totalRevenue = invoices?.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidAmount = invoices?.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0);
    const pendingAmount = invoices?.filter((inv) => inv.status === 'pending').reduce((sum, inv) => sum + inv.totalAmount, 0);
    const overdueAmount = invoices?.filter((inv) => inv.status === 'draft').reduce((sum, inv) => sum + inv.totalAmount, 0);


    console.log(invoices?.reduce((sum, invoice) => sum + invoice.totalAmount, 0))

    const stats = [
        {
            label: 'Total Revenue',
            value: `₹${totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
            icon: IndianRupee,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
        },
        {
            label: 'Paid',
            value: `₹${paidAmount?.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
            icon: CheckCircle,
            color: 'text-success',
            bgColor: 'bg-success/10',
        },
        {
            label: 'Pending',
            value: `₹${pendingAmount?.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
            icon: Clock,
            color: 'text-warning',
            bgColor: 'bg-warning/10',
        },
        {
            label: 'Draft',
            value: `₹${overdueAmount?.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
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
