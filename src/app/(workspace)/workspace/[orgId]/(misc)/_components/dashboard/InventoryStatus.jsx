import { Package, AlertTriangle, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const inventory = [
    { name: "Surgical Gloves", stock: 85, threshold: 100, unit: "boxes" },
    { name: "Syringes (10ml)", stock: 45, threshold: 200, unit: "units" },
    { name: "Gauze Pads", stock: 30, threshold: 150, unit: "packs" },
    { name: "Antiseptic Solution", stock: 12, threshold: 50, unit: "bottles" },
    { name: "Face Masks", stock: 120, threshold: 100, unit: "boxes" },
];

export function InventoryStatus() {
    const lowStockCount = inventory.filter(item => (item.stock / item.threshold) * 100 < 50).length;

    return (
        <div className="rounded-xl border border-border/50 bg-card dark:bg-darkSecondaryBackground p-5 shadow-card animate-slide-up" style={{ animationDelay: "650ms" }}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Inventory Status
                </h3>
                {lowStockCount > 0 && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                        <AlertTriangle className="h-3 w-3" />
                        {lowStockCount} Low
                    </span>
                )}
            </div>

            <div className="space-y-3">
                {inventory.map((item, index) => {
                    const percentage = (item.stock / item.threshold) * 100;
                    const isLow = percentage < 50;
                    const isCritical = percentage < 25;

                    return (
                        <div key={index} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-foreground">{item.name}</span>
                                <span className={`text-xs font-medium ${isCritical ? "text-destructive" : isLow ? "text-warning" : "text-muted-foreground"}`}>
                                    {item.stock} {item.unit}
                                </span>
                            </div>
                            <Progress
                                value={Math.min(percentage, 100)}
                                className={`h-1.5 ${isCritical ? "[&>div]:bg-destructive" : isLow ? "[&>div]:bg-warning" : "[&>div]:bg-success"}`}
                            />
                        </div>
                    );
                })}
            </div>

            <button className="w-full mt-4 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                <TrendingDown className="h-4 w-4" />
                Reorder Supplies
            </button>
        </div>
    );
}
