'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';



const DepartmentUsageChart = ({ data }) => {
    return (
        <div className="bg-card rounded-lg shadow-elevation-md p-6">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-1">Department Usage</h2>
                <p className="text-sm text-muted-foreground">Email distribution by department</p>
            </div>
            <div className="w-full h-80" aria-label="Department Usage Pie Chart">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--color-popover))',
                                border: '1px solid hsl(var(--color-border))',
                                borderRadius: '6px',
                                color: 'hsl(var(--color-popover-foreground))',
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            wrapperStyle={{
                                paddingTop: '20px',
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DepartmentUsageChart;