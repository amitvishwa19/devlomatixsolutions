'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const DeliveryChart = ({ data }) => {
    return (
        <div className="bg-card rounded-lg shadow-elevation-md p-6">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-1">Email Delivery Trends</h2>
                <p className="text-sm text-muted-foreground">Daily email performance over the selected period</p>
            </div>
            <div className="w-full h-80" aria-label="Email Delivery Trends Bar Chart">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                        <XAxis
                            dataKey="date"
                            stroke="hsl(var(--color-muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="hsl(var(--color-muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--color-popover))',
                                border: '1px solid hsl(var(--color-border))',
                                borderRadius: '6px',
                                color: 'hsl(var(--color-popover-foreground))',
                            }}
                        />
                        <Legend
                            wrapperStyle={{
                                paddingTop: '20px',
                            }}
                        />
                        <Bar dataKey="delivered" fill="hsl(var(--color-success))" name="Delivered" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="opened" fill="hsl(var(--color-primary))" name="Opened" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="bounced" fill="hsl(var(--color-error))" name="Bounced" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DeliveryChart;