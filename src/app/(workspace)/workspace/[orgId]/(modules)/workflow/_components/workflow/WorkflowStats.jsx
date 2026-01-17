import { Card, CardContent } from '@/components/ui/card';
import { Users, Building2, Bed, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';


export function WorkflowStats({ patients }) {
    const opdPatients = patients?.filter(p => p.workflowType === 'OPD');
    const ipdPatients = patients?.filter(p => p.workflowType === 'IPD');
    const inProgress = patients?.filter(p => p.status === 'in-progress');
    const pending = patients?.filter(p => p.status === 'pending');
    const discharged = patients?.filter(p => p.currentStage === 'discharged');
    const critical = patients?.filter(p => p.status === 'critical');

    const stats = [
        {
            label: 'Total Active',
            value: patients?.length,
            icon: Users,
            color: 'bg-primary/10 text-primary',
        },
        {
            label: 'OPD Patients',
            value: opdPatients?.length,
            icon: Building2,
            color: 'bg-info/10 text-info',
        },
        {
            label: 'IPD Patients',
            value: ipdPatients?.length,
            icon: Bed,
            color: 'bg-pending/10 text-pending',
        },
        {
            label: 'In Progress',
            value: inProgress?.length,
            icon: Clock,
            color: 'bg-warning/10 text-warning',
        },
        {
            label: 'Discharged Today',
            value: discharged?.length,
            icon: CheckCircle2,
            color: 'bg-success/10 text-success',
        },
        {
            label: 'Critical',
            value: critical?.length,
            icon: AlertTriangle,
            color: 'bg-destructive/10 text-destructive',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {stats.map((stat) => (
                <Card key={stat.label} className="workflow-card border">
                    <CardContent className="p-2">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
