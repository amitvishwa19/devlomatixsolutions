
import { cn } from '@/lib/utils';



export const OccupancyChart = ({ stats }) => {
    const segments = [
        { label: 'Available', value: stats.availableBeds, color: 'bg-status-available' },
        { label: 'Occupied', value: stats.occupiedBeds, color: 'bg-status-occupied' },
        { label: 'Reserved', value: stats.reservedBeds, color: 'bg-status-reserved' },
        { label: 'Maintenance', value: stats.maintenanceBeds, color: 'bg-status-maintenance' },
    ];

    return (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-card animate-fade-in">
            <h3 className="text-lg font-semibold text-foreground mb-6">Bed Distribution</h3>

            {/* Donut Chart Visualization */}
            <div className="flex items-center justify-center mb-6">
                <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {(() => {
                            let cumulativePercent = 0;
                            return segments.map((segment, index) => {
                                const percent = stats.totalBeds > 0 ? (segment.value / stats.totalBeds) * 100 : 0;
                                const dashArray = `${percent} ${100 - percent}`;
                                const dashOffset = -cumulativePercent;
                                cumulativePercent += percent;

                                return (
                                    <circle
                                        key={segment.label}
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                        stroke={`hsl(var(--status-${segment.label.toLowerCase()}))`}
                                        strokeWidth="12"
                                        strokeDasharray={dashArray}
                                        strokeDashoffset={dashOffset}
                                        className="transition-all duration-500"
                                        style={{
                                            animationDelay: `${index * 100}ms`
                                        }}
                                    />
                                );
                            });
                        })()}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-foreground">{stats.occupancyRate}%</span>
                        <span className="text-xs text-muted-foreground">Occupancy</span>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-4">
                {segments.map((segment) => (
                    <div key={segment.label} className="flex items-center gap-3">
                        <div className={cn("w-3 h-3 rounded-full", segment.color)} />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{segment.label}</p>
                            <p className="text-xs text-muted-foreground">{segment.value} beds</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
