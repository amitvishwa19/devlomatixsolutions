const legendItems = [
    { status: 'available', label: 'Available', color: 'bg-success' },
    { status: 'occupied', label: 'Occupied', color: 'bg-warning' },
    { status: 'reserved', label: 'Reserved', color: 'bg-primary' },
    { status: 'maintenance', label: 'Maintenance', color: 'bg-amber-500' },
];

export function BedStatusLegend({ stats }) {
    return (
        <div className="flex flex-wrap items-center gap-6 px-6 py-4 bg-card rounded-xl border border-border">
            {legendItems.map((item) => (
                <div key={item.status} className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium">
                        {stats[item.status]} {item.label}
                    </span>
                </div>
            ))}
        </div>
    );
}
