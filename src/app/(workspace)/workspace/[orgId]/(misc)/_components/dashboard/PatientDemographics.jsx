import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const ageData = [
  { name: "0-18", value: 245, color: "hsl(var(--chart-1))" },
  { name: "19-35", value: 412, color: "hsl(var(--chart-2))" },
  { name: "36-50", value: 628, color: "hsl(var(--chart-3))" },
  { name: "51-65", value: 856, color: "hsl(var(--chart-4))" },
  { name: "65+", value: 706, color: "hsl(var(--chart-5))" },
];

const genderData = [
  { name: "Male", value: 1423, percentage: 50 },
  { name: "Female", value: 1358, percentage: 48 },
  { name: "Other", value: 66, percentage: 2 },
];

export function PatientDemographics() {
  const total = ageData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Patient Demographics</h3>
        <p className="text-xs text-muted-foreground">Age distribution breakdown</p>
      </div>

      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={ageData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {ageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
                color: "hsl(var(--primary))"
              }}
              labelStyle={{ color: "hsl(var(--primary))" }}
              itemStyle={{ color: "hsl(var(--primary))" }}
              formatter={(value) => [`${value} patients`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {ageData.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span 
              className="h-2 w-2 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-muted-foreground">{item.name}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Gender Distribution</p>
        <div className="flex gap-2">
          {genderData.map((item) => (
            <div 
              key={item.name}
              className="flex-1 text-center rounded-lg bg-secondary/30 py-2"
            >
              <p className="text-sm font-semibold text-foreground">{item.percentage}%</p>
              <p className="text-xs text-muted-foreground">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
