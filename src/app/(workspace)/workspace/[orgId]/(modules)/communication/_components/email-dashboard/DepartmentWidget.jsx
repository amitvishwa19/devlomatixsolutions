import Icon from '@/components/ui/AppIcon';



export default function DepartmentWidget({ stats }) {
    return (
        <div className="bg-card rounded-lg p-6 shadow-elevation-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                    Department Activity
                </h3>
                <Icon name="BuildingOfficeIcon" size={20} className="text-primary" />
            </div>
            <div className="space-y-4">
                {stats.map((stat, index) => (
                    <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">
                                {stat.department}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {stat.sentToday} sent
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-primary h-full rounded-full transition-smooth"
                                    style={{ width: `${stat.deliveryRate}%` }}
                                />
                            </div>
                            <span className="text-xs text-muted-foreground font-caption w-12 text-right">
                                {stat.deliveryRate}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}