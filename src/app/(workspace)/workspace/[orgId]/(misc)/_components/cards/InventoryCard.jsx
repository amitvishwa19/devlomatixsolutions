import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, Calendar, MapPin, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function InventoryCard({
    itemId,
    itemName,
    category,
    currentStock,
    minStock,
    maxStock,
    unit,
    location,
    expiryDate,
    lastRestocked,
    status,
}) {
    const statusColors = {
        "In Stock": "bg-green-500/10 text-green-500 border-green-500/20",
        "Low Stock": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        "Out of Stock": "bg-red-500/10 text-red-500 border-red-500/20",
        "Expiring Soon": "bg-orange-500/10 text-orange-500 border-orange-500/20",
    };

    const stockPercentage = (currentStock / maxStock) * 100;
    const isLowStock = currentStock <= minStock;
    const isOutOfStock = currentStock === 0;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{itemName}</CardTitle>
                            <p className="text-sm text-muted-foreground">ID: {itemId}</p>
                        </div>
                    </div>
                    <Badge className={cn("border", statusColors[status])}>{status}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <Badge variant="outline">{category}</Badge>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current Stock:</span>
                        <span className={cn(
                            "font-semibold",
                            isOutOfStock && "text-red-500",
                            isLowStock && !isOutOfStock && "text-yellow-500"
                        )}>
                            {currentStock} {unit}
                        </span>
                    </div>

                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                            className={cn(
                                "h-full transition-all",
                                isOutOfStock && "bg-red-500",
                                isLowStock && !isOutOfStock && "bg-yellow-500",
                                !isLowStock && "bg-green-500"
                            )}
                            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                        />
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Min: {minStock}</span>
                        <span>Max: {maxStock}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{location}</span>
                </div>

                {expiryDate && (
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Expires: </span>
                        <span className={status === "Expiring Soon" ? "text-orange-500 font-medium" : ""}>
                            {expiryDate}
                        </span>
                    </div>
                )}

                {lastRestocked && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Last restocked: {lastRestocked}</span>
                    </div>
                )}

                {(isLowStock || isOutOfStock) && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded-lg">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">
                            {isOutOfStock ? "Immediate restock required" : "Restock needed soon"}
                        </span>
                    </div>
                )}

                <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Restock
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">Details</Button>
                </div>
            </CardContent>
        </Card>
    )
}
