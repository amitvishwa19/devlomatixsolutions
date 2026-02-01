import React from 'react'
import { Card } from '@/components/ui/card';
import { DollarSign, Clock, AlertTriangle, CheckCircle, IndianRupee } from 'lucide-react';
import { DynamicIcon } from 'lucide-react/dynamic';

export default function ServiceStats({ services = [] }) {

    const stats = [
        {
            label: 'Total Services',
            value: `${services?.length}`,
            icon: 'shield-user',
            color: 'text-primary',
            bgColor: 'bg-green-600/20',
        },
        {
            label: 'Active Services',
            value: `${services?.filter(ser => ser.status === true)?.length || 0}`,
            icon: 'shield-check',
            color: 'text-success',
            bgColor: 'bg-yellow-600/20',
        },
        {
            label: 'Insurance Coverd',
            value: `${services?.filter(ser => ser.insuranceCover !== 'not_covered')?.length || 0}`,
            icon: 'shield-check',
            color: 'shield-plus',
            bgColor: 'bg-blue-600/20',
        },
        {
            label: 'Insurance not Coverd',
            value: `${services?.filter(ser => ser.insuranceCover === 'not_covered')?.length || 0}`,
            icon: 'shield-ban',
            color: 'text-warning',
            bgColor: 'bg-red-600/20',
        },

    ];


    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card
                    key={stat.label}
                    className="p-5  animate-fade-in border"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <div className="flex items-center gap-4">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bgColor}`}>
                            <DynamicIcon name={stat.icon} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                            <p className="text-xl font-bold text-foreground">{stat.value}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}
