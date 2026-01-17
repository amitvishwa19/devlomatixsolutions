import React from 'react'
import { Card } from '@/components/ui/card';
import { DollarSign, Clock, AlertTriangle, CheckCircle, IndianRupee } from 'lucide-react';
import { DynamicIcon } from 'lucide-react/dynamic';

export default function InventoryStats({ inventories = [] }) {

    const stats = [
        {
            label: 'Total Inventory Items',
            value: `${inventories?.length}`,
            icon: 'siren',
            color: 'text-primary',
            bgColor: 'bg-sky-600/20',
        },
        {
            label: 'Low Stock Items',
            value: `3`,
            icon: 'triangle-alert',
            color: 'text-success',
            bgColor: 'bg-yellow-600/20',
        },
        {
            label: 'Out of Stock',
            value: `2`,
            icon: 'circle-alert',
            color: 'text-destructive',
            bgColor: 'bg-orange-600/20',
        },
        {
            label: 'Expired Item',
            value: `6`,
            icon: 'skull',
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
