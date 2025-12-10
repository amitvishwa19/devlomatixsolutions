import React from 'react'
import { TrendingUp, TrendingDown } from "lucide-react";





export default function ClinicOverview() {
    return (
        <div className="rounded-xl border border-border/50 bg-card dark:bg-darkSecondaryBackground p-6 shadow-card animate-slide-up" style={{ animationDelay: "500ms" }}>
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Weekly Overview</h3>
                <span className="text-sm text-muted-foreground">Nov 22 - Nov 28</span>
            </div>

            <div className="space-y-4">
                {/* Bar chart visualization */}
                <div className="flex h-40 items-end justify-between gap-2">
                    {[
                        { day: "Mon", value: 65, appointments: 12 },
                        { day: "Tue", value: 80, appointments: 15 },
                        { day: "Wed", value: 45, appointments: 8 },
                        { day: "Thu", value: 90, appointments: 18 },
                        { day: "Fri", value: 70, appointments: 14 },
                        { day: "Sat", value: 30, appointments: 5 },
                        { day: "Sun", value: 0, appointments: 0 },
                    ].map((item, index) => (
                        <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
                            <div className="relative w-full">
                                <div
                                    className="w-full rounded-t-md bg-primary/20 transition-all duration-500 hover:bg-primary/30"
                                    style={{
                                        height: `${item.value * 1.4}px`,
                                        animationDelay: `${index * 100}ms`,
                                    }}
                                >
                                    <div
                                        className="absolute bottom-0 left-0 w-full rounded-t-md gradient-primary transition-all duration-300"
                                        style={{ height: `${item.value * 0.8}px` }}
                                    />
                                </div>
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">{item.day}</span>
                        </div>
                    ))}
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                            <TrendingUp className="h-4 w-4 text-success" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">72</p>
                            <p className="text-xs text-muted-foreground">Total appointments</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">+12%</p>
                            <p className="text-xs text-muted-foreground">vs last week</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
