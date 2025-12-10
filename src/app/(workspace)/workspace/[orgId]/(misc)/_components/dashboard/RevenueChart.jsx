import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign } from "lucide-react";

const data = [
    { month: "Jan", revenue: 32000, target: 30000 },
    { month: "Feb", revenue: 35000, target: 32000 },
    { month: "Mar", revenue: 28000, target: 33000 },
    { month: "Apr", revenue: 42000, target: 35000 },
    { month: "May", revenue: 38000, target: 37000 },
    { month: "Jun", revenue: 48250, target: 40000 },
];

export function RevenueChart() {
    const currentRevenue = data[data.length - 1].revenue;
    const previousRevenue = data[data.length - 2].revenue;
    const growth = ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1);

    return (
        <div className="rounded-xl border border-border/50 bg-card dark:bg-darkSecondaryBackground p-5 shadow-card animate-slide-up lg:col-span-2" style={{ animationDelay: "750ms" }}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
                    <p className="text-sm text-muted-foreground">Monthly revenue vs target</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">${(currentRevenue / 1000).toFixed(1)}k</p>
                        <div className="flex items-center gap-1 text-success text-sm">
                            <TrendingUp className="h-4 w-4" />
                            <span>+{growth}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                            tickFormatter={(value) => `$${value / 1000}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                            formatter={(value) => [`$${value.toLocaleString()}`, ""]}
                            labelStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="target"
                            stroke="hsl(var(--muted-foreground))"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            fill="url(#targetGradient)"
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            fill="url(#revenueGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex items-center gap-6 mt-4 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-xs text-muted-foreground">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full border-2 border-dashed border-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Target</span>
                </div>
            </div>
        </div>
    );
}
