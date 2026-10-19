"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    AreaChart, 
    Area, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer, 
    CartesianGrid,
    ComposedChart
} from "recharts";
import { TrendingUp, BarChart3, Layers } from "lucide-react";

export default function EcommerceRevenueChart({ workspaceId, selectedStore, period }) {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("revenue"); // "revenue" | "orders" | "combined"

    useEffect(() => {
        let isMounted = true;
        const fetchChart = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/workspace/${workspaceId}/ecommerce/chart?storeId=${selectedStore}&period=${period}`);
                const data = await res.json();
                if (isMounted && data.success) {
                    setChartData(data.data || []);
                }
            } catch (err) {
                console.error("Failed to load chart data:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (workspaceId) {
            fetchChart();
        }

        return () => { isMounted = false; };
    }, [workspaceId, selectedStore, period]);

    const totalPeriodRevenue = chartData.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
    const totalPeriodOrders = chartData.reduce((acc, curr) => acc + (curr.orders || 0), 0);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            return (
                <div className="bg-popover/95 backdrop-blur-md border border-border/80 p-3 rounded-xl shadow-xl text-xs space-y-1">
                    <p className="font-semibold text-foreground">{dataPoint.label}</p>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Revenue:</span>
                        <span className="font-mono font-bold text-emerald-500">
                            ₹{dataPoint.revenue.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Orders:</span>
                        <span className="font-mono font-bold text-blue-500">
                            {dataPoint.orders}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="bg-card/70 backdrop-blur-md border-border/80 shadow-sm flex flex-col">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                <div>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        Sales Velocity & Revenue Trend
                    </CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Aggregate gross sales (₹{totalPeriodRevenue.toLocaleString()}) across {totalPeriodOrders} orders
                    </p>
                </div>

                {/* View Mode Toggle Buttons */}
                <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border/60 self-start sm:self-auto">
                    <Button
                        variant={viewMode === "revenue" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("revenue")}
                        className="h-6 text-[11px] px-2.5 font-medium"
                    >
                        Revenue
                    </Button>
                    <Button
                        variant={viewMode === "orders" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("orders")}
                        className="h-6 text-[11px] px-2.5 font-medium"
                    >
                        Orders
                    </Button>
                    <Button
                        variant={viewMode === "combined" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("combined")}
                        className="h-6 text-[11px] px-2.5 font-medium"
                    >
                        Combined
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 pt-4">
                {loading ? (
                    <div className="h-[280px] flex items-center justify-center">
                        <Skeleton className="h-full w-full rounded-xl" />
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="h-[280px] flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                        <BarChart3 className="w-8 h-8 mb-2 opacity-40" />
                        <p className="text-xs">No transaction telemetry for the selected period.</p>
                        <p className="text-[10px] mt-1">Transactions will plot automatically upon store sync.</p>
                    </div>
                ) : (
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                    </linearGradient>
                                    <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" vertical={false} />
                                <XAxis 
                                    dataKey="label" 
                                    stroke="currentColor" 
                                    className="text-muted-foreground text-[10px]" 
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis 
                                    stroke="currentColor" 
                                    className="text-muted-foreground text-[10px]" 
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                
                                {(viewMode === "revenue" || viewMode === "combined") && (
                                    <Area 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="#10b981" 
                                        strokeWidth={2}
                                        fillOpacity={1} 
                                        fill="url(#revenueGradient)" 
                                    />
                                )}

                                {(viewMode === "orders" || viewMode === "combined") && (
                                    <Bar 
                                        dataKey="orders" 
                                        fill="#6366f1" 
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={30}
                                        opacity={viewMode === "combined" ? 0.6 : 0.85}
                                    />
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
